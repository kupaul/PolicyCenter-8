package gw.reinsurance.risk

uses gw.api.system.PCLoggerCategory
uses gw.pl.currency.MonetaryAmount
uses gw.api.reinsurance.RIAttachment
uses gw.api.util.DisplayableException
uses gw.api.web.util.PCCurrencyAmountUtil
uses gw.plugin.Plugins
uses gw.plugin.reinsurance.IReinsuranceConfigPlugin
uses gw.reinsurance.NullSafeMath

uses java.lang.IllegalArgumentException
uses java.math.BigDecimal
uses java.util.Set
uses gw.util.fingerprint.FP64

enhancement RIRiskEnhancement : RIRisk {

  //set of functions showing breakup of calculations for net retention in UI
  property get XOLCoverage() : MonetaryAmount {
    return this.Attachments.XOLAttachmentsForCalc.CededRisks(this.Currency) // cededRisk can be null
  }

  property get SharedAmongProp() : MonetaryAmount {
    return nsSub(TotalRisk, XOLCoverage)
  }

  property get ProportionalCoverage() : MonetaryAmount {
    return this.Attachments.ProportionalAttachmentsForCalc.CededRisks(this.Currency)
  }

  property get ProportionalRetention() : MonetaryAmount {
    return SharedAmongProp - ProportionalCoverage
  }

  property get RetainedPropShare() : BigDecimal {
    var percentage : BigDecimal
    try {
      percentage = PCCurrencyAmountUtil.calculatePercentageOf(ProportionalRetention, SharedAmongProp, PercentageScale)
    } catch (e : IllegalArgumentException) {
      //returning null when calculating percentage with negative numbers
    }
    return percentage
  }

  property get NXOLCoverage() : MonetaryAmount {
    return this.Attachments.NXOLAttachmentsForCalc.CededRisks(this.Currency)
  }

  property get NetRetention() : MonetaryAmount {
    return nsSub(nsSub(nsSub(TotalRisk, XOLCoverage), ProportionalCoverage), NXOLCoverage)
  }

  property get TargetMaxRetention() : MonetaryAmount {
    var configPlugin = Plugins.get(IReinsuranceConfigPlugin)
    return configPlugin.getTargetMaxRetention(this)
  }

  property get FacRINeeded() : MonetaryAmount {
    var facNeeded = nsSub(NetRetention, TargetMaxRetention)
    if (facNeeded.IsNegative) {
      facNeeded = 0bd.ofCurrency(this.Currency)
    }
    return facNeeded
  }

  property get DefaultGrossRetention() : MonetaryAmount {
    var configPlugin = Plugins.get(IReinsuranceConfigPlugin)
    return configPlugin.getDefaultGrossRetention(this)
  }

  property get TotalRisk() : MonetaryAmount {
    var percentage = this.ProbableMaxLossPct
    var tiv = this.TotalInsuredValue
    return percentage <> null and tiv <> null ?
      PCCurrencyAmountUtil.calculatePercentage(tiv, percentage) : tiv
  }

  /**
   * Called by PCReinsurancePlugin after attachment changes
   */
  function updateAttachments() {
    if (this.GrossRetention <> this.DefaultGrossRetention) {
      // If the default changes, we could use the following rules to decide what to do with the actual gross retention (AGR):
      // 1) If AGR = prior default, then set AGR = new default. (wasn't overridden previously, so use new default)
      // 2) If AGR <= new default, keep AGR as is (was overridden and old value is still valid, so retain it)
      // 3) If AGR > new default, set to new default. (Old overridden value is invalid b/c too high, so use new, lower default)
      if (   this.GrossRetention == this.DefaultRetentionFromProgram
          or this.GrossRetention > this.DefaultGrossRetention) {
        PCLoggerCategory.REINSURANCE_PLUGIN.info("Changed gross retention on risk ${this.PublicID} from ${this.GrossRetention} to ${this.DefaultGrossRetention}")
        this.GrossRetention = this.DefaultGrossRetention
        this.DefaultRetentionFromProgram = this.DefaultGrossRetention
      }
    }
    this.updateCedingOnAllAttachments()
  }

  function updateCedingOnAllAttachments() {
    this.updateCeding(this.Attachments)
  }

  function calculateNetRetention(lossAmount : MonetaryAmount) : MonetaryAmount {
    if(this.Attachments == null){
      return lossAmount
    }
    var cededAmount = this.Attachments.CededRisks(this.Currency)
    return nsSub(lossAmount, cededAmount)
  }

  property get Agreements() : entity.RIAgreement[]{
    return this.Attachments*.Agreement
  }

  function validateCoverageRanges() : Set<String> {
    //fac xol attachments are allowed to overlap proportional attachments
    var attachments = this.Attachments.AttachmentsForRiskCeding
    var grossRetention = attachments.HasElements ? attachments.first().Risk.GrossRetention : null
    var errors = attachments.GrossPerRiskTreatyAttachmentsForCalc*.Agreement.getCoverageOverlapErrors(grossRetention, this.EffectiveDate, this.ExpirationDate)
    errors.addAll(attachments.XOLAttachmentsForCalc*.Agreement.getCoverageOverlapErrors(grossRetention, this.EffectiveDate, this.ExpirationDate))
    errors.addAll(attachments.NXOLAttachmentsForCalc*.Agreement.getCoverageOverlapErrors(grossRetention, this.EffectiveDate, this.ExpirationDate))
    return errors.toSet()
  }

  /**
   * Attach the reinsurable risk to a given facultative agreement and return the associated RIAttachment
   *
   * @param ririsk the reinsurable risk
   * @param facAgreement the facultative agreeement
   * @return the RIAttachment
   */
  function attachRiskToFacultative(fac : RIAgreement) : RIAttachment {
    if (not fac.Subtype.hasCategory(typekey.ArrangementType.TC_FACULTATIVE)) {
      throw new IllegalArgumentException("Agreement must be facultative to attach to risk")
    }
    var errors = this.canAttach(fac)
    if(errors.HasElements){
      throw new DisplayableException(errors.first())
    }
    this.attach(fac, null)
    return this.getAttachments().singleWhere(\ a -> a.Agreement == fac)
  }

  /**
   * Detach the reinsurable risk from a given facultative agreement
   *
   * @param ririsk the reinsurable risk
   * @param facAgreement the facultative agreeement
   */
  function detachRiskFromFacultative(fac : RIAgreement) {
    if (not fac.Subtype.hasCategory(typekey.ArrangementType.TC_FACULTATIVE)) {
      throw new IllegalArgumentException("Agreement must be facultative to remove from risk")
    }
    PCLoggerCategory.REINSURANCE_PLUGIN.info("Removing ${this.Reinsurable}")
    this.detach(fac)
  }

  public property get PercentageScale() : int{
    return 6 // longpercentagetype
  }

  static function nsAdd(arg1 : MonetaryAmount, arg2 : MonetaryAmount) : MonetaryAmount {
    return NullSafeMath.nsAdd(arg1, arg2)
  }

  static function nsSub(arg1 : MonetaryAmount, arg2 : MonetaryAmount) : MonetaryAmount {
    return NullSafeMath.nsSub(arg1, arg2)
  }

  static function nsMult(arg1 : BigDecimal, arg2 : BigDecimal) : BigDecimal {
    return NullSafeMath.nsMult(arg1, arg2)
  }

  static function nsDiv(arg1 : BigDecimal, arg2 : BigDecimal) : BigDecimal {
    return NullSafeMath.nsDiv(arg1, arg2)
  }

  property get UWIssueKey() : String {
    var fingerPrint = new FP64()
    var includedAttachments = this.Attachments.AttachmentsForRiskCeding.sortBy(\ elt -> elt.Agreement.AgreementNumber)
    includedAttachments.each( \ elt -> {
      fingerPrint.extend(elt.Agreement.AgreementNumber)
    })
    return this.Reinsurable.UWIssueKey + fingerPrint.toString()
  }
}
