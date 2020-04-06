package gw.reinsurance.agreement

uses com.guidewire.pl.system.bundle.validation.EntityValidationException
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.reinsurance.RIUtil
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil

@Export
class RIAgreementValidation extends PCValidationBase {

  var _agreement : RIAgreement
  var _agreementUnchanged : RIAgreement

  construct(valContext : PCValidationContext, agreement : RIAgreement) {
    super(valContext)
    _agreement = agreement
    _agreementUnchanged = agreement
  }

  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")

    validateDates()
    validateAgreementItself()
    validateActivePrograms()
  }

  function validateDates() {
    // validate effDate and expDate -- they should be normalized
    if (_agreement.EffectiveDate != RIUtil.adjustEffectiveTimeForRI(_agreement.EffectiveDate)) {
        Result.addError(_agreementUnchanged, "default",
            displaykey.Web.Reinsurance.Program.Validation.EffectiveDateNormalization(_agreementUnchanged))
        // should we fix this one so it doesn't generate anything spurious?
        // _agreement.setEffectiveDateWithDefaultTime(_agreement.EffectiveDate)
    }
    if (_agreement.ExpirationDate != RIUtil.adjustEffectiveTimeForRI(_agreement.ExpirationDate)) {
        Result.addError(_agreementUnchanged, "default",
            displaykey.Web.Reinsurance.Program.Validation.ExpirationDateNormalization(_agreementUnchanged))
        // should we fix this one so it doesn't generate anything spurious?
        // _agreement.setExpirationDateWithDefaultTime(_agreement.ExpirationDate)
    }
    if (_agreement.ExpirationDate <= _agreement.EffectiveDate) {
      Result.addError(_agreementUnchanged, "default",
          displaykey.Web.Reinsurance.Program.Validation.ExpiresBeforeEffective(_agreementUnchanged))
    }
  }

  function validateAgreementItself() {
    validateRequiredFieldErrorAgreementFieldsAreSet()
    validateCoverageLimitLargerThanOrEqualToAttachmentPoint()
    validateMaxRetentionLessThanOrEqualToAttachmentPoint()
    validateParticipants()
    validateCoverageGroups()
  }

  private function validateActivePrograms(){
    var query = new Query<RIProgram>(RIProgram)
    query.compare("Status", Relop.Equals, ContractStatus.TC_ACTIVE)
    var joinTable = query.join(ProgramTreaty, "Program")
    joinTable.compare("Treaty", Relop.Equals, _agreement)
    var iter = query.select().iterator()
    while(iter.hasNext()){
      var program = iter.next()
      // load program to this bundle so that program.Treaties returns this treaty with all the changes
      program = _agreement.Bundle.add(program)
      try {
        PCValidationContext.doPageLevelValidation( \ ctx -> new RIProgramValidation(ctx, program).validateProgram())
      } catch (e : EntityValidationException) {
        Result.addWarning(_agreement, "default", displaykey.Web.Reinsurance.Program.Validation.InvalidProgram(program.Name))
      }
    }
  }

  private function validateCoverageGroups() {
    if (_agreement typeis Treaty && _agreement.CoverageGroups.Empty) {
      Result.addError(_agreementUnchanged, "default", displaykey.Web.Reinsurance.Agreement.Verify.MissingCoverageGroup)
    }
  }

  /**
   * check that requiredFieldError fields are set based on subtype
   */
  private function validateRequiredFieldErrorAgreementFieldsAreSet() {
    //coverage fields
    if (_agreement typeis QuotaShareRITreaty || _agreement typeis NonProportionalRIAgreement) {
      requiredFieldError(displaykey.Web.Reinsurance.Treaty.CededShare, _agreement.CededShare)
    }
    //Amount of coverage is amount ceded for fac prop agreements and amoutn of RI otherwise
    if (!(_agreement typeis FacProportionalRIAgreement)) {
      requiredFieldError(displaykey.Web.Reinsurance.Treaty.AmountOfCoverage, _agreement.AmountOfCoverage)
    }
    if (_agreement typeis SurplusRITreaty || _agreement typeis NonProportionalRIAgreement) {
      requiredFieldError(displaykey.Web.Reinsurance.Treaty.AttachmentPoint, _agreement.AttachmentPoint)
    }
    if (!(_agreement typeis FacProportionalRIAgreement)) {
      requiredFieldError(displaykey.Web.Reinsurance.Treaty.CoverageLimit, _agreement.CoverageLimit)
    }
    if (_agreement typeis NonProportionalRIAgreement) {
      requiredFieldError(displaykey.Web.Reinsurance.Treaty.AttachmentIndexed, _agreement.AttachmentIndexed)
      requiredFieldError(displaykey.Web.Reinsurance.Treaty.LimitIndexed, _agreement.LimitIndexed)
    }
    if (_agreement typeis SurplusRITreaty) {
      requiredFieldError(displaykey.Web.Reinsurance.Treaty.MaxRetention, _agreement.MaxRetention)
    }

    //premium and commission fields
    if (_agreement typeis NonProportionalRIAgreement) {
      if (_agreement typeis Treaty) {
        requiredFieldError(displaykey.Web.Reinsurance.Treaty.CedingRate, _agreement.CedingRate)
      }
      requiredFieldError(displaykey.Web.Reinsurance.Treaty.CalculateCededPremium, _agreement.CalculateCededPremium)
    }
    requiredFieldError(displaykey.Web.Reinsurance.Treaty.Commission, _agreement.Commission)
    if (_agreement typeis Facultative and!(_agreement typeis FacProportionalRIAgreement)) {
      requiredFieldError(displaykey.Web.Reinsurance.FacAgreement.Markup, _agreement.MarkUp)
      requiredFieldError(displaykey.Web.Reinsurance.FacAgreement.Premium, _agreement.CededPremium)
    }

    //other term fields
    if (_agreement typeis PerRisk) {
      requiredFieldError(displaykey.Web.Reinsurance.Treaty.CountTowardTotalLimit, _agreement.CountTowardTotalLimit)
    }

  }

  private function validateCoverageLimitLargerThanOrEqualToAttachmentPoint() {
    // Validate Limit >= Attachment Point  (Could be =AP for special cases discussed later.)
    if (_agreement.CoverageLimit < _agreement.AttachmentPoint) {
      Result.addError(_agreementUnchanged, "default", displaykey.Web.Reinsurance.Agreement.Verify.LimitToAttachPointError)
    }
  }

  private function validateMaxRetentionLessThanOrEqualToAttachmentPoint() {
    // validate that Max Retention <= Attachment Point.
    if (_agreement typeis SurplusRITreaty) {
      if (_agreement.MaxRetention > _agreement.AttachmentPoint) {
        Result.addError(_agreementUnchanged, "default", displaykey.Web.Reinsurance.Agreement.Verify.MaxRetentionToAttachPointError)
      }
    }
  }

  private function validateParticipants() {
    if(_agreement.Participants.IsEmpty){
      Result.addError(_agreementUnchanged, "default", displaykey.Web.Reinsurance.Agreement.Verify.NeedParticipants)
    }else{
      var totalRisk = _agreement.Participants.sum(\ a -> a.RiskShare)
      if(totalRisk <> 100){
        Result.addError(_agreementUnchanged, "default", displaykey.Web.Reinsurance.Agreement.Verify.TotalRiskShare)
      }
      var countUnique = _agreement.Participants*.Participant*.ID.toSet().Count
      if(countUnique < _agreement.Participants.Count){
        Result.addError(_agreementUnchanged, "default", displaykey.Web.Reinsurance.Agreement.Verify.DuplicateParticipants)
      }
    }
  }

  private function requiredFieldError(fieldName : String, value : Object) {
    if (value == null) {
      Result.addError(_agreement, "default", displaykey.Java.Validation.MissingRequired(fieldName))
    }
  }

  function validateForRisk(ririsk : RIRisk) {
    for(error in ririsk.canAttach(_agreement)){
      Result.addError(_agreement, "default", error)
    }
  }

  static function validateUI(agreement : RIAgreement) {
    PCValidationContext.doPageLevelValidation( \ context -> new RIAgreementValidation(context, agreement).validate())
  }

  static function validateAgainstRisk(agreement : RIAgreement, ririsk : RIRisk) {
    var context = ValidationUtil.createContext("default")
    var validation = new RIAgreementValidation(context, agreement)
    validation.validateForRisk(ririsk)
    context.raiseExceptionIfProblemsFound()
  }
}