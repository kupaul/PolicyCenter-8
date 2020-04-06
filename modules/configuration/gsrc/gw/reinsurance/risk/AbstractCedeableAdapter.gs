package gw.reinsurance.risk

uses gw.pl.currency.MonetaryAmount
uses gw.api.reinsurance.Cedeable
uses gw.api.reinsurance.RIAttachment
uses gw.api.web.util.PCBigDecimalUtil
uses gw.api.web.util.PCCurrencyAmountUtil
uses gw.reinsurance.NullSafeMath
uses gw.util.IOrderedList
uses java.math.BigDecimal
uses gw.pl.util.ArgCheck

@Export
abstract class AbstractCedeableAdapter implements Cedeable {

  abstract property get TotalRisk() : MonetaryAmount
  abstract property get GrossRetention() : MonetaryAmount
  abstract property get PercentageScale() : int
  abstract property get Currency() : Currency
  abstract function getOverrideCededAmountForSurplusRITreaty(treaty : SurplusRITreaty) : MonetaryAmount

  override function updateCeding(attachments : List<RIAttachment>) : List<RIAttachment> {
    resetAttachmentCedings(attachments)
    calculateAttachmentCedings(attachments)
    calculateProportionalPercentage(attachments)
    calculateMaxCedings(attachments)
    return attachments
  }

  private function calculateMaxCedings(attachments: List <RIAttachment>) {
    var propShare = NullSafeMath.nsSub(TotalRisk, attachments.XOLAttachmentsForCalc.CededRisks(Currency))
    attachments.each( \ attachment -> {
      var limitToUse = (attachment.Agreement.Subtype == TC_FACPROPORTIONALRIAGREEMENT) ? propShare : TotalRisk
      attachment.MaxCeding = attachment.Agreement.calculateCoverageCeded(limitToUse, GrossRetention)
    })
  }

  private function calculateProportionalPercentage(attachments: List <RIAttachment>) {
    var propShare = NullSafeMath.nsSub(TotalRisk, attachments.XOLAttachmentsForCalc.CededRisks(Currency))
    setPropPercentage(attachments.ProportionalAttachmentsForCalc, propShare)
  }

  private function amountCededToAttachmentWithLayerLimits(attachment : RIAttachment, lossAmount : MonetaryAmount) : MonetaryAmount {
    var amountCeded = 0bd.ofCurrency(attachment.Agreement.Currency)
    attachment.CoverageLayers.each(\ r -> {
      var start = {r.Start, lossAmount}.min()
      var end = {r.End, lossAmount}.min()
      amountCeded += amountCededToSlice(attachment, start, end)
    })
    return amountCeded
  }

  private function calculateAttachmentCedings(attachments: List <RIAttachment>) {
    calculateXOLCedings(attachments)

    var propShare = NullSafeMath.nsSub(TotalRisk, attachments.XOLAttachmentsForCalc.CededRisks(Currency))
    calculateQuotaShareCedings(attachments, propShare)

    var availablePropShare = propShare
    attachments.QuotaShareAttachmentsForCalc.each( \ quotaShare -> {
      var qsAmountAndRetention = {quotaShare.Agreement.getCoverageLimit(GrossRetention), propShare}.min()
      availablePropShare = {NullSafeMath.nsSub(availablePropShare, qsAmountAndRetention), 0bd.ofCurrency(Currency)}.max()
    })
    calculatePropFacCedings(attachments, propShare, availablePropShare)

    availablePropShare = NullSafeMath.nsSub(availablePropShare, attachments.ProportionalFacAttachmentsForCalc.CededRisks(Currency))
    calculateSurplusCedings(attachments, propShare, availablePropShare)

    var availableNetAmount = NullSafeMath.nsSub(TotalRisk, attachments.GrossAttachmentsForCalc.CededRisks(Currency))
    calculateNetXOLCedings(attachments, availableNetAmount)
  }

  private function calculateNetXOLCedings(attachments: List <RIAttachment>, availableNetAmount : MonetaryAmount) {
    if (availableNetAmount != null) {
      ArgCheck.nonNegative(availableNetAmount, "availableNetAmount")
    }

    var cededToQuotaShare = attachments.QuotaShareAttachmentsForCalc.CededRisks(Currency)
    var carrierShareOfGrossRetention = NullSafeMath.nsSub(GrossRetention, cededToQuotaShare)
    var nxolAttachments = attachments.NXOLAttachmentsForCalc
    setAgreementLayers(nxolAttachments, carrierShareOfGrossRetention)
    nxolAttachments.each(\ r -> {
      r.CededRisk = amountCededToAttachmentWithLayerLimits(r, availableNetAmount)
    })
  }

  private function calculateSurplusCedings(attachments: List <RIAttachment>, propShare : MonetaryAmount, availablePropShare : MonetaryAmount) {
    //need to set layers with quota share in case of overlap
    //setAgreementLayers(attachments.ProportionalTreatyAttachmentsForCalc, null)
    //agreements layers already set with quota share
    if (propShare != null) {
      ArgCheck.nonNegative(propShare, "propShare")
      ArgCheck.nonNegative(availablePropShare, "availablePropShare")
    }

    var surplusAttachments = orderAttachmentsForCalc(attachments.SurplusAttachmentsForCalc)
    surplusAttachments.each( \ r -> {
      var amountToCede = {amountCededToAttachmentWithLayerLimits(r, TotalRisk), availablePropShare}.min()

      if (r.Agreement typeis SurplusRITreaty and amountToCede != null) {
        var overrideAmount = getOverrideCededAmountForSurplusRITreaty(r.Agreement)
        if (overrideAmount < amountToCede and overrideAmount.IsPositive) {
          amountToCede = overrideAmount
        }
      }

      r.CededRisk = amountToCede
      availablePropShare = NullSafeMath.nsSub(availablePropShare, r.CededRisk)
    })
  }

  private function calculatePropFacCedings(attachments: List <RIAttachment>, propShare : MonetaryAmount, availablePropShare : MonetaryAmount) {
    if (propShare != null) {
      ArgCheck.nonNegative(propShare, "propShare")
      ArgCheck.nonNegative(availablePropShare, "availablePropShare")
    }

    var zeroCurrencyUnit = 0bd.ofCurrency(Currency)

    var orderedAttachments = orderAttachmentsForCalc(attachments.ProportionalFacAttachmentsForCalc)
    orderedAttachments.each(\ r -> {
      r.CededRisk = r.Agreement.calculateCoverageCeded(propShare, GrossRetention)
    })

    //correct for overlaps of prop fac with other prop facs
    var riskAvailable = availablePropShare
    orderedAttachments.each(\ r -> {
      if (riskAvailable != null and r.CededRisk != null) {
        if (riskAvailable < r.CededRisk) {
          r.CededRisk = riskAvailable
        }
        riskAvailable = zeroCurrencyUnit.max(NullSafeMath.nsSub(riskAvailable, r.CededRisk))
      }
    })
  }

  private function calculateQuotaShareCedings(attachments: List <RIAttachment>, propShare : MonetaryAmount) {
    if (propShare != null) {
      ArgCheck.nonNegative(propShare, "propShare")
    }

    //need to calculate surplus layers along with quotashare in case of overlaps
    setAgreementLayers(attachments.ProportionalTreatyAttachmentsForCalc, null)
    var qsAttachments = attachments.QuotaShareAttachmentsForCalc
    qsAttachments.each(\ r -> {
      r.CededRisk = amountCededToAttachmentWithLayerLimits(r, propShare)
    })
  }

  private function calculateXOLCedings(attachments: List <RIAttachment>) {
    var xolAttachments = attachments.XOLAttachmentsForCalc
    setAgreementLayers(xolAttachments, null)
    xolAttachments.each(\ r -> {
      r.CededRisk = amountCededToAttachmentWithLayerLimits(r, TotalRisk)
    })
  }

  //Set layer limits that the attachment can cede to regardless of risk amount but taking into account any overlapping attachments
  private function calculateAttachmentCedingLayers(attachments : List<RIAttachment>) {
    //XOLs
    setAgreementLayers(attachments.XOLAttachmentsForCalc, null)

    //prop treaties
    setAgreementLayers(attachments.ProportionalTreatyAttachmentsForCalc, null)

    //amount not ceded below gross retention
    var quotaShareTreaties = attachments.ProportionalTreatyAttachmentsForCalc.getAttachmentsOfType({typekey.RIAgreement.TC_QUOTASHARERITREATY})
    var cededToQuotaShare = quotaShareTreaties.sum(Currency, \ r -> r.CoverageLayers.sum(Currency, \ c -> amountCededToSlice(r, c.Start, c.End)))
    var carrierShareOfGrossRetention = NullSafeMath.nsSub(GrossRetention, cededToQuotaShare)

    //net agreements
    setAgreementLayers(attachments.NXOLAttachmentsForCalc, carrierShareOfGrossRetention)
  }

  private function nsOrder(arg : BigDecimal) : BigDecimal {
    return arg == null ? 0 : arg
  }

  private function nxolOrder(agreement : RIAgreement) : BigDecimal {
    return agreement.IsNXOLWithApplyToGrossRetention ? 1 : 0
  }

  protected function orderAttachmentsForCalc(attachments : List<RIAttachment>) : IOrderedList<RIAttachment> {
    return attachments.orderBy(\ r -> r.Agreement.Subtype.RiskCedingOrder)
                                        .thenByDescending(\ r -> nxolOrder(r.Agreement))
                                        .thenByDescending(\ r -> nsOrder(r.Agreement.getCoverageLimit(GrossRetention)))
                                        .thenByDescending(\ r -> nsOrder(r.Agreement.getAttachmentPoint(GrossRetention)))
                                        .thenByDescending(\ r -> nsOrder(r.Agreement.CededShare))
                                        .thenByDescending(\ r -> nsOrder(r.Agreement.AmountOfCoverage))
                                        .thenByDescending(\ r -> nsOrder(r.hashCode()))
  }

  /**
   * used only for nonproportional agreements
   */
  private function amountCededToSlice(attachment : RIAttachment, layerStart : MonetaryAmount, layerEnd : MonetaryAmount) : MonetaryAmount {
    if (layerStart > layerEnd) {
      throw "layerEnd cannot be less than layerStart"
    }
    var cededAmountAtEnd = attachment.Agreement.calculateCoverageCeded(layerEnd, GrossRetention)
    var cededAmountAtStart = attachment.Agreement.calculateCoverageCeded(layerStart, GrossRetention)
    return NullSafeMath.nsSub(cededAmountAtEnd, cededAmountAtStart)
  }

  private function getApplicableAttachments(attachments : List<RIAttachment>, sliceStart : MonetaryAmount, sliceEnd : MonetaryAmount, carrierShareGrossRetention : MonetaryAmount) : List<RIAttachment> {
    var filteredAttachments = attachments.where(\ r -> r.Agreement.getAttachmentPoint(GrossRetention) <= sliceStart and r.Agreement.getCoverageLimit(GrossRetention) >= sliceEnd)
    filteredAttachments.removeWhere(\ r -> r.Agreement.IsNXOLWithApplyToGrossRetention and sliceStart >= carrierShareGrossRetention)
    return filteredAttachments
  }

  /**
   * used only for nonproportional agreements
   * cannot mix gross and net attachments together.  NXOL and FacNXOL attachments need to be ceded to win separate call after XOL and FacXOL
   */
  private function setAgreementLayers(attachments : List<RIAttachment>, carrierShareGrossRetention : MonetaryAmount) {
    var attachmentGroupingCount = 0
    attachmentGroupingCount += attachments.XOLAttachmentsForCalc.HasElements ? 1 : 0
    attachmentGroupingCount += attachments.NXOLAttachmentsForCalc.HasElements ? 1 : 0
    attachmentGroupingCount += attachments.ProportionalTreatyAttachmentsForCalc.HasElements ? 1 : 0

    if (attachmentGroupingCount > 1) {
      throw "layers of xol, nxol, and prop attachments cannot be calculated in the same call"
    }

    if (attachments.HasElements) {
      var slicePoints = attachments.AttachmentsForRiskCeding*.Agreement*.getAttachmentPoint(GrossRetention).toSet()
      slicePoints.addAll(attachments.AttachmentsForRiskCeding*.Agreement*.getCoverageLimit(GrossRetention).toSet())
      slicePoints.add(carrierShareGrossRetention)
      slicePoints.remove(null)

      var totalCeded : MonetaryAmount
      var orderedSlices = slicePoints.order()
      var i = 0
      while (i < orderedSlices.Count - 1) {
        var sliceStart = orderedSlices.get(i)
        var sliceEnd = orderedSlices.get(i+1)
        var applicableAttachments = getApplicableAttachments(attachments, sliceStart, sliceEnd, carrierShareGrossRetention)
        if (applicableAttachments.HasElements) {
          var winningAttachment = orderAttachmentsForCalc(applicableAttachments).first()
          var sliceAmount = amountCededToSlice(winningAttachment, sliceStart, sliceEnd)
          if (totalCeded == null) {
            totalCeded = sliceAmount
          } else {
            totalCeded += sliceAmount
          }
          winningAttachment.addCoverageLayer(sliceStart, sliceEnd)
        }
        i++
      }
    }
  }

  private function resetAttachmentCedings(attachments : List<RIAttachment>) {
    attachments.each(\ r -> {
      r.MaxCeding = null
      r.CededRisk = null
      r.ProportionalPercentage = null
      r.resetCoverageLayers()
    })
  }

  private function setPropPercentage(attachments : List<RIAttachment>, propShare : MonetaryAmount) {
    attachments.each(\ r -> {
      //propShare is null for unlimited risk.  Use ceded share for prop % in this case
      var cededShare = r.Agreement.CededShare == null ? null : r.Agreement.CededShare.setScale(PercentageScale)
      var percentage = propShare == null ? cededShare : PCCurrencyAmountUtil.calculatePercentageOf(r.CededRisk, propShare, PercentageScale)
      r.ProportionalPercentage = PCBigDecimalUtil.isValidPercentage(percentage) ? percentage : null
    })
  }
}