package gw.lob.gl
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses gw.policy.PolicyAddlInsuredAndTypeUniqueValidation

@Export
class GLLineValidation extends PolicyLineValidation<entity.GeneralLiabilityLine> {

  property get glLine() : entity.GeneralLiabilityLine { return Line }
  
  construct(valContext : PCValidationContext, polLine : entity.GeneralLiabilityLine) {
    super(valContext, polLine)
  }

  /**
   * Validate the GL Line.
   *
   * Checks the following:
   * <ul>
   *   <li>Additional Insured and Type are unique</li>
   *   <li>Retro date is valid</li>
   *   <li>At least one exposure</li>
   *   <li>Exposures are valid</li>
   * </ul>
   */
  override function doValidate() {
    additionalInsuredAndTypeUnique()
    validateRetroDate()
    checkExposures()
    atLeastOneExposure()
    if (glLine.GLCoverageForm == null) {
      Result.addError( glLine, "quotable", displaykey.Web.Policy.GL.Validation.GLCoverageForm, "GLLine" )
    }
  }
  
  override function validateLineForAudit() {
    allAuditAmountsShouldBeFilledIn()
  }

  private function additionalInsuredAndTypeUnique() {
    Context.addToVisited( this, "additionalInsuredAndTypeUnique" )
    for (var addlInsured in glLine.AdditionalInsureds) {
       new PolicyAddlInsuredAndTypeUniqueValidation(Context, addlInsured).validate()
    }
  }
  
  private function atLeastOneExposure() {
    Context.addToVisited( this, "atLeastOneExposure" )
    if (glLine.GLExposuresWM.Count < 1) {
      Result.addError( glLine, "default", displaykey.Web.Policy.GL.Validation.AtLeastOneExposure, "GLLineEU")
    }
  }
  
  /**
   * Verify that all AuditedAmounts are filled in
   */
  function allAuditAmountsShouldBeFilledIn() {
    if (glLine.Branch.Job typeis Audit) {
      glLine.VersionList.Exposures.flatMap(\ g -> g.AllVersions).each(\ glExposure -> {
          if (glExposure.AuditedBasis == null) {
            Result.addError(glLine,
                            "quotable",
                            displaykey.Web.AuditWizard.Details.NullAmountsError,
                            displaykey.Web.AuditWizardMenu.Details)
          }}
      )
    }
  }
  
  function validateRetroDate(){
    if(glLine.GLCoverageForm == GLCoverageFormType.TC_CLAIMSMADE){ 
      if(glLine.RetroactiveDate.before( glLine.ClaimsMadeOrigEffDate )){
        Result.addWarning( glLine, "default", displaykey.Web.Policy.GL.Validation.RetroDateTooEarly )
      }
      if(glLine.RetroactiveDate.after( glLine.Branch.PeriodStart )){
        Result.addError( glLine, "default", displaykey.Web.Policy.GL.Validation.RetroDateAfterPeriodStart )
      }
    }
  }

  static function validateExposures(line : GLLine) {
    PCValidationContext.doPageLevelValidation( \ context -> new GLLineValidation(context, line).checkExposures())
  }
  
  
  static function validatePolicyContacts(line : GLLine) {
    PCValidationContext.doPageLevelValidation( \ context -> 
        new GLLineValidation(context, line).additionalInsuredAndTypeUnique())
  }

  static function validateSchedules(line : GLLine) {
    PCValidationContext.doPageLevelValidation( \ context -> new GLLineValidation(context, line).checkSchedulesAreNotEmpty())
  }
    
  private function checkExposures() {
    glLine.Exposures.each( \ exposure -> new GLExposureValidation(Context, exposure).validate())
  }

}
