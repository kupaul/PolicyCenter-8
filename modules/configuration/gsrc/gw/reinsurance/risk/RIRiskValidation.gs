package gw.reinsurance.risk

uses gw.reinsurance.NullSafeMath
uses gw.validation.PCValidationContext
uses gw.validation.PCValidationBase
uses java.text.DateFormat
uses gw.pl.currency.MonetaryAmount
uses java.lang.IllegalStateException
uses gw.job.uw.ValueFormatter

/**
 * A validator class (@see(gw.validation.PCValidationBase) that checks to make sure an RIRisk obeys the following rules:
 * <ol>
 * <li>Each risk has a valid coverage range.  (This is delegated to risk.validateCoverageRanges())</li>
 * <li>Sum of proportional fac coverage does not exceed net retention after XOL is ceded</li>
 * <li>If the TIV is unlimited, Prop fac must cede a percentage, not an absolute risk amount</li>
 * <li>Facultative agreements are legally attached.  (This is delegated to risk.canAttach(facAgreement).</li>
 * <li>Agreement type is appropriate for risk.  (For example, unlimited TIV is not legal with a surplus treaty.)</li>
 * <li>All attached treaties apply to the RICoverageGroup associated with the risk.</li>
 * </ol>
 */
@Export
class RIRiskValidation extends PCValidationBase {

  var _risk : RIRisk

  construct(valContext : PCValidationContext, risk : RIRisk) {
    super(valContext)
    _risk = risk
  }

  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")

    if (gw.api.system.PCConfigParameters.RIModuleOn()) {
      validateCoverageRanges()
      checkMaxFacPropSumIsLessThanMaxPropRetention()
      checkFacPropOnlyCededPercentIfNullTIV()
      checkFacultativeAgreements()
      checkAllowedAttachmentTypes()
      checkAllTreatiesAssociatedWithRiskDoesIncludeRICoverageGroup()
      checkAgreementCeding()
    }
  }

  /**
   * Check that certain attachments are not attached in specific cases
   */
  private function checkAllowedAttachmentTypes() {
    //unlimited risk for WC does not allow surplus agreements
    if (_risk.TotalRisk == null) {
      var invalidAttachments = _risk.Attachments.AttachmentsForRiskCeding.getAttachmentsOfType({TC_SURPLUSRITREATY})
      if (invalidAttachments.HasElements) {
        Result.addError(_risk, "default", displaykey.Web.Reinsurance.RIRisk.Validation.InvalidAttachmentForRiskWithNoTIV)
      }
    }
  }

  /**
   * Check that coverage ranges (attachment points to limits) do not overlap (error) and do not have gaps between layers (warning)
   */
  private function validateCoverageRanges() {
    var errors = _risk.validateCoverageRanges()
    errors.each(\ e -> {
      Result.addError(_risk, "default", e)
    })
  }

  private function checkFacultativeAgreements() {
    for(agreement in this._risk.PolicyAttachmentAgreements){
      var errors = this._risk.canAttach(agreement)
      for(error in errors){
        Result.addError(_risk, "default", error)
      }
    }
  }

  private function checkAgreementCeding() {
    for (attachment in _risk.Attachments) {
      var agreement = attachment.Agreement
      if (agreement typeis Facultative) {
        if (agreement.AttachmentPoint > this._risk.TotalRisk) {
          var formatter = ValueFormatter.forType(ValueFormatterType.TC_CURRENCY)
          var attachmentPoint = formatter.format(agreement.AttachmentPoint.Amount.asString())
          var totalRisk = formatter.format(_risk.TotalRisk.Amount.asString())
          Result.addWarning(_risk, "default", displaykey.Web.Reinsurance.RIRisk.Validation.AgreementAttachmentAbovePML(agreement.Name, attachmentPoint, totalRisk, _risk.Reinsurable.DisplayName))
        }
      }
      if (agreement typeis PerRisk) {
        if (attachment.MaxCeding > attachment.CededRisk) {
          Result.addWarning(_risk, "default", displaykey.Web.Reinsurance.RIRisk.Validation.AgreementDoesNotCedeToCapacity(agreement.Name, _risk.Reinsurable.DisplayName))
        }
      }
    }
  }

  /*
   * Check that sum of fac prop does not exceed net retention after XOL is ceded
   */
  private function checkMaxFacPropSumIsLessThanMaxPropRetention() {
    var propShare = _risk.SharedAmongProp
    var currencyOfRIRisk = _risk.Currency

    var totalMaxPropShareCeded = 0bd.ofCurrency(currencyOfRIRisk)
    _risk.Attachments.ProportionalFacAttachmentsForCalc.each(\ r -> {
    var monetaryAmount : MonetaryAmount
      try{
        monetaryAmount = {_risk.TotalRisk, r.Agreement.AmountOfCoverage}.max()
      } catch (ex : IllegalStateException) {
        monetaryAmount = null
      }
      var maxCeded = r.Agreement.calculateCoverageCeded(monetaryAmount, _risk.GrossRetention)
      totalMaxPropShareCeded = NullSafeMath.nsAdd(totalMaxPropShareCeded, maxCeded)
    })

    if (totalMaxPropShareCeded > propShare) {
        Result.addError(_risk, "default", displaykey.Web.Reinsurance.RIRisk.Validation.FacPropExceedsMaxPropRetention(DateFormat.getDateInstance().format(_risk.EffectiveDate)))
    }
  }

  /*
   * If the TIV is null, Prop fac is not allowed if it has a Ceded Amount but it is allowed if Ceded % is set
   */
  private function checkFacPropOnlyCededPercentIfNullTIV() {
    if (_risk.TotalInsuredValue == null) {
      _risk.Attachments.ProportionalFacAttachmentsForCalc.each(\ a -> {
        if ((a.Agreement.AmountOfCoverage != null and a.Agreement.AmountOfCoverage.IsPositive)
              or (a.Agreement.CededShare == null or a.Agreement.CededShare == 0)) {
          Result.addError(_risk, "default", displaykey.Web.Reinsurance.RIRisk.Validation.FacPropNullTIVRequiresCededPercentage(a.Agreement.Name))
        }
      })
    }
  }

  /*
   * Check if all the treaties associated with this risk does apply to or includes RICoverageGroup of the risk
   */
  private function checkAllTreatiesAssociatedWithRiskDoesIncludeRICoverageGroup() {
    var coverageGroup = _risk.Reinsurable.CoverageGroup
    _risk.Attachments.Treaties.each(\ t -> {
      if (!t.Agreement.CoverageGroups.contains(coverageGroup)) {
        Result.addError(_risk, "default", displaykey.Web.Reinsurance.RIRisk.Validation.TreatyAssociatedWithRiskDoesNotApplyToRICoverageGroup)
      }
    })
  }

  static function validateUI(risk : RIRisk) {
    if (risk <> null){
      PCValidationContext.doPageLevelValidation( \ context -> new RIRiskValidation(context, risk).validate())
    }
  }
}
