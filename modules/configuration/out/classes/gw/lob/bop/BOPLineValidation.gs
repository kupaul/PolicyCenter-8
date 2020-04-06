package gw.lob.bop

uses gw.validation.PCValidationContext
uses gw.policy.PolicyLineValidation
uses java.util.Set
uses gw.lob.common.AnswerValidation
uses gw.policy.PolicyAddlInsuredAndTypeUniqueValidation
uses java.lang.UnsupportedOperationException

/**
 * Line level validation for the {@link entity.BusinessOwnersLine BusinesOwnersLine}
 */
@Export
class BOPLineValidation extends PolicyLineValidation<entity.BusinessOwnersLine> {

  /**
   * The {@link entity.BusinessOwnersLine BusinesOwnersLine} being validated.
   */
  property get bopLine() : entity.BusinessOwnersLine {
    return Line
  }

  construct(valContext : PCValidationContext, polLine : entity.BusinessOwnersLine) {
    super(valContext, polLine)
  }

  /**
   * Validate the Business Owners Line.
   *
   * Checks the following:
   * <ul>
   *   <li>Additional Insures are unique</li>
   *   <li>Locations are valid</li>
   *   <li>Answers are valid</li>
   *   <li>Buildings are valid.  {@link gw.lob.bop.BOPBuildingValidation}</li>
   *   <li>Coverages are valid.</li>
   *   <li>Small business type is set.</li>
   * </ul>
   */
  override function doValidate() {
    additionalInsuredAndTypeUnique()
    checkLocations()
    checkAnswers()
    checkBuildings()
    checkCoverages()
    checkSmallBusinessType()
  }

  /**
   * Validate all buildings for the given line.
   * @param line a Business Owners line to validate businesses
   */
  static function validateBuildings(line : BOPLine) {
    PCValidationContext.doPageLevelValidation( \ context -> new BOPLineValidation(context, line).checkBuildings())
  }

  /**
   * Check the answers of a Business Owners line
   * @param line a Business Owners line to validate answers for
   */
  static function validateSupplementalStep(line : BOPLine) {
    PCValidationContext.doPageLevelValidation( \ context -> {
      var val = new BOPLineValidation(context, line)
      val.checkAnswers()
    })
  }

  /**
   * Check that all generic schedules that are selected have at least one scheduled item.
   * @param line a Business Owners
   */
  static function validateSchedules(line : BOPLine) {
    PCValidationContext.doPageLevelValidation( \ context -> new BOPLineValidation(context, line).checkSchedulesAreNotEmpty())
  }

  /**
   * Check the answers of a Business Owners line
   * @param line a Business Owners line to validate answers for
   * @see gw.lob.common.AnswerValidation
   */
  function checkAnswers() {
    Context.addToVisited( this, "checkAnswers" )
    new AnswerValidation( Context, Line, Line.Answers, "BOPSupplemental" ).validate()
  }
  
  private function checkLocations() {
    bopLine.BOPLocations.each(\ location -> new BOPLocationValidation(Context, location).validate())
  }
  
  private function checkSmallBusinessType() {
    Context.addToVisited(this, "checkSmallBusinessType")
    if (bopLine.SmallBusinessType == null) {
      Result.addError(bopLine , "default", displaykey.Web.Policy.BOP.Validation.SmallBusinessTypeRequired )  
    }
  }
  
  private function checkBuildings() {
    var validatedClassCodeSearchCriteria : Set<BOPClassCodeSearchCriteria> = {}
    for (building in bopLine.BOPLocations*.Buildings) {
      var buildingValidator = new BOPBuildingValidation(Context, building, validatedClassCodeSearchCriteria)
      buildingValidator.validate()
      validatedClassCodeSearchCriteria.add(buildingValidator.buildClassCodeSearchCriteria())
    }
  }

  /**
   * Check BOP coverages
   *
   * <ul>
   *   <li>the forgery limit is set properly</li>
   *   <li>Only one coverage exists for the terrorism</li>
   *   <li>Only one coverage exists for the liquor</li>
   * </ul>
   */
  internal function checkCoverages() {
    Context.addToVisited(this, "allLineCoverages")
    //checkForNoSmallBusinessType()
    for (coverage in bopLine.BOPLineCoverages) {
      if (coverage typeis BOPForgeAltCov) {
        checkForgeryAlteration(coverage)
      }
    }
    checkOnlyOneCoverageInGroup("BOPTerrorismCat")
    checkOnlyOneCoverageInGroup("BOPLiquorCat")
  }

  /**
   * Check the BOPForgeAltLimitTerm limit matches the BOPEmpDisCov limit
   */
  private function checkForgeryAlteration(cov : BOPForgeAltCov) {
    if (cov == null) {
      return
    }
    Context.addToVisited(this, "checkForgeryAlteration")
    if  (not Context.isAtLeast("default")) {
      return
    }
    if (bopLine.BOPEmpDisCovExists) {
      if (bopLine.BOPEmpDisCov.BOPEmpDisLimitTerm.Value == bopLine.BOPForgeAltCov.BOPForgeAltLimitTerm.Value) {
        return
      }
    }
    Result.addError(cov, "default", displaykey.Web.Policy.BOP.Validation.ForgeryAndEmployeeDishonesty(cov.Pattern.DisplayName))
  }
  
  private function checkOnlyOneCoverageInGroup(category : String) {
    Context.addToVisited( this, "checkOnlyOneCoverageInGroup" )
    var categoryname = bopLine.Pattern.getCoverageCategory( category ).Name
    var caList : String[]
    caList = {category}
    var covs = bopLine.getCoveragesInCategories( caList )
    if (covs.Count > 1) {
      var covnames = " -- "
      for (cov in covs) {
        covnames = covnames + cov.Pattern.Name + ", "
      }
      Result.addError(bopLine , "default", displaykey.Web.Policy.BOP.Validation.OnlyOneCoverageinCategory(categoryname) + covnames )  
    }
  }

  internal function additionalInsuredAndTypeUnique() {
    Context.addToVisited( this, "additionalInsuredAndTypeUnique" )
    for (var addlInsured in bopLine.AdditionalInsureds) {
      new PolicyAddlInsuredAndTypeUniqueValidation(Context, addlInsured).validate()
    }
  }

  override function validateLineForAudit() {
    throw new UnsupportedOperationException(displaykey.Validator.UnsupportedAuditLineError)
  }

}
