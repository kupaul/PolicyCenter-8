package gw.lob.cp

uses gw.validation.PCValidationContext
uses gw.policy.PolicyLineValidation
uses java.util.Set
uses entity.windowed.CPBldgAddlInterestVersionList
uses java.lang.UnsupportedOperationException

@Export
class CPLineValidation extends PolicyLineValidation<entity.CommercialPropertyLine> {
  
  property get cpLine() : entity.CommercialPropertyLine {
    return Line
  }

  construct(valContext : PCValidationContext, polLine : entity.CommercialPropertyLine) {
    super(valContext, polLine)
  }
  /**
   * Validate the Commercial Property Line.
   *
   * Checks the following:
   * <ul>
   *   <li>Blanket Limit valid</li>
   *   <li>At least one building per location</li>
   *   <li>At least two coverages per blanket</li>
   *   <li>Buildings are valid.  {@link gw.lob.bop.BOPBuildingValidation}</li>
   *   <li>Blankets are valid.</li>
   * </ul>
   */
  override function doValidate() {
    validateBlanketLimit()
    atLeastOneBuildingPerLocation()
    validateAtleastTwoCoveragePerBlanket()
    var validatedClassCodeSearchCriteria : Set<CPClassCodeSearchCriteria> = {}
    var buildings = cpLine.CPLocations*.Buildings
    buildings*.VersionList.toList().arrays<CPBldgAddlInterestVersionList>("AdditionalInterests") // warm up the bundle and global cache
    for (building in buildings) {
      var buildingValidator = new CPBuildingValidation(Context, building, validatedClassCodeSearchCriteria)
      buildingValidator.validate()
      validatedClassCodeSearchCriteria.add(buildingValidator.buildClassCodeSearchCriteria())
    }
    cpLine.CPBlankets.each( \ blanket -> new CPBlanketValidation(Context, blanket).validate())
  }
  
  /**
   * Validates sum of blanketed coverage limits is same as the sum of building Coverage limits
   */
  function validateBlanketLimit(){
    Context.addToVisited(this, "validateBlanketLimit") 
    var blankets = cpLine.CPBlankets
    for(blnk in blankets) {
      var buildingLimitSum = blnk.BuildingCovLimitSum 
      var blanketLimit = blnk.CPBlanketCov.CPBlanketLimitTerm.Value
      if(blnk.BuildingCoverages.HasElements) {
        if (buildingLimitSum != blanketLimit) {
          if (Context.isAtLeast("quotable")) {
            Result.addWarning(blnk, "default", displaykey.Web.Policy.CP.Validation.BlanketLimitDoesNotMatchTotalLimit(blnk.CPBlanketNum),"CPBlanket")
          }
        }
      }
    }
  }

  /**
   * Validates to check each location has at least 1 building
   */
  function atLeastOneBuildingPerLocation() {
    Context.addToVisited(this, "atLeastOneBuildingPerLocation")
    var loc = cpLine.CPLocations.firstWhere( \ loc -> loc.Buildings.Count < 1)
    if (loc != null or cpLine.CPLocations.IsEmpty) {
      if (Context.isAtLeast("quotable")) {
        Result.addError( cpLine, "default", displaykey.Web.Policy.CP.Validation.atLeastOneBuilding, "CPBuildings")
      } else {
        Result.addWarning( cpLine, "default", displaykey.Web.Policy.CP.Validation.atLeastOneBuilding, "CPBuildings")
      }
    }
  }
  
  /**
   * Validates to check each blanket has at least 2 building coverages
   */
  function validateAtleastTwoCoveragePerBlanket() {
    Context.addToVisited(this, "validateAtleastTwoCoveragePerBlanket") 
    var blankets = cpLine.CPBlankets
    for (blanket in blankets) {
      if (blanket.BuildingCoverages.Count < 2) {
        if (Context.isAtLeast("quotable")) {
          Result.addError(cpLine, "default",displaykey.Web.Policy.CP.Validation.MustHaveAtLeastTwoBuildingCoverage(blanket.CPBlanketNum),"CPBlanket")
        } 
      }
    } 
  }

  /**
   * Validates to check modifiers
   */
  static function validateModifiers() {
    PCValidationContext.doPageLevelValidation( \ context -> {})
  }

  /**
   * Does a page level validation for the CP Line
   */
  static function validate(line : CPLine) {
    PCValidationContext.doPageLevelValidation( \context -> new CPLineValidation(context, line).validate())
  }
  
  /**
   * Does a page level validation for the buildings on the line
   */
  static function validateBuildings(line : CPLine) {
    PCValidationContext.doPageLevelValidation( \context ->{
      var validation = new CPLineValidation(context, line)
      validation.atLeastOneBuildingPerLocation()
    })
  }
  
  /**
   * Does a page level validation for blankets on the line
   */
  static function validateBlankets(line : CPLine) {
    PCValidationContext.doPageLevelValidation(\context ->{
      var validation = new CPLineValidation(context, line)
      validation.validateAtleastTwoCoveragePerBlanket()
      validation.validateBlanketLimit()
    })
  }

  override function validateLineForAudit() {
    throw new UnsupportedOperationException(displaykey.Validator.UnsupportedAuditLineError)
  }

}
