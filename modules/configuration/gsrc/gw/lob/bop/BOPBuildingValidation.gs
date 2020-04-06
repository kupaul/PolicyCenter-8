package gw.lob.bop

uses gw.lob.AbstractBuildingValidation
uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil

uses java.lang.Integer
uses java.util.Date
uses java.util.HashSet
uses java.util.Set
uses gw.api.util.JurisdictionMappingUtil

/**
 * Defines the Business Owners Policy line building validation utility class.
 *
 * Used to validate a BOP line building.
 */
@Export
class BOPBuildingValidation extends AbstractBuildingValidation<BOPClassCodeSearchCriteria> {

  var _building : BOPBuilding

  construct(valContext : PCValidationContext, bldg : BOPBuilding, validatedClassCodeSearchCriteria : Set<BOPClassCodeSearchCriteria>) {
    super(valContext, validatedClassCodeSearchCriteria)
    _building = bldg
  }

  /**
   * Validate the current building.
   *
   * Checks the following:
   * <ul>
   *   <li>At least base coverage exists for this building (BOPBuildingCov or BOPPersonalPropCov)</li>
   *   <li>For BOPOrdinanceCov coverage.
   *     <ul>
   *       <li>Ensure the limits are set properly</li>
   *       <li>BOPOrdinanceCov ensure that all limits are empty if BOPOrdLawIncomeExpenseTerm is set</li>
   *     </ul>
   *   </li>
   *   <li>BOPOrdinanceCov and BOPBuildingCov are not both selected</li>
   *   <li>The Building was built between teh minimum and maxiumim policy creation year</li>
   *   <li>Building improvement dates are between the building's built date and today</li>
   *   <li>Check that the building class code is valid.</li>
   *   <li>Additional interest details are unique</li>
   * </ul>
   */
  override function validateImpl() {
    Context.addToVisited(this, "validateImpl")
    checkAtLeastOneBaseCov()
    checkOrdLawCoverageLimits()
    checkIncomeExpenseTerm()
    checkOrdLawCovRequiresBuildingCov()
    checkYearBuiltMakesSense()
    checkBuildingImprovementDatesMakeSense()
    checkClassCodeIsValid()
    addlInterestDetailUnique()
  }

  /**
   * Validate the given building.
   * @see #validate()
   */
  static function validateBuilding(bldg : BOPBuilding) {
    var context = ValidationUtil.createContext("default")
    new BOPBuildingValidation(context, bldg, {}).validate()
    context.raiseExceptionIfProblemsFound()
  }

  /**
   *
   */
  private function checkAtLeastOneBaseCov() {
    Context.addToVisited(this, "checkAtLeastOneBaseCov")
    if(not(_building.BOPBuildingCovExists or _building.BOPPersonalPropCovExists)) {
      Result.addError(_building, "default",
        displaykey.Web.Policy.BOP.Validation.BuildingOrBusinessPersonalPropertyCovRequired(_building.DisplayName, _building.BOPLocation.DisplayName))
    }
  }

  /**
   * Ensure the limits are set properly for BOPOrdinanceCov
   */
  private function checkOrdLawCoverageLimits() {
    Context.addToVisited(this, "checkOrdLawCoverageLimits")
    if(_building.BOPOrdinanceCovExists) {
      var errortext = ""
      var cov = _building.BOPOrdinanceCov
      if ( cov.BOPOrdLawCov23LimTerm.Value > 0 ) {
        if ( cov.BOPOrdLawCov2LimTerm.Value > 0 ) {
          errortext = displaykey.Web.Policy.BOP.Validation.Coverage2Limit
        }
        if ( cov.BOPOrdLawCov3LimTerm.Value > 0 ) {
          if(errortext != "") {
            errortext =  errortext + displaykey.Web.Policy.BOP.Validation.AndCoverage3Limit
          } else {
            errortext = displaykey.Web.Policy.BOP.Validation.Coverage3Limit
          }
        }
      }
      if(errortext != "") {
        Result.addError(cov, "default",
            displaykey.Web.Policy.BOP.Validation.Combined23Limit(_building.DisplayName, _building.BOPLocation.DisplayName, errortext))
      }
    }
  }

  /**
   * BOPOrdinanceCov ensure that all limits are empty if BOPOrdLawIncomeExpenseTerm is set
   */
  private function checkIncomeExpenseTerm() {
    Context.addToVisited(this, "checkIncomeExpenseTerm")
    if(_building.BOPOrdinanceCovExists) {
      var cov = _building.BOPOrdinanceCov
      if(cov.BOPOrdLawIncomeExpenseTerm.Value and allCoveragesEmpty(cov)) {
        Result.addError(cov, "default",
            displaykey.Web.Policy.BOP.Validation.IncomeExpenseTerm(_building.DisplayName, _building.BOPLocation.DisplayName))
      }
    }
  }

  /**
   * BOPOrdinanceCov and BOPBuildingCov are not both selected
   */
  private function checkOrdLawCovRequiresBuildingCov() {
    Context.addToVisited(this, "checkOrdLawCovRequiresBuildingCov")
    if(_building.BOPOrdinanceCovExists and !_building.BOPBuildingCovExists) {
      Result.addError(_building, "default",
          displaykey.Web.Policy.BOP.Validation.OrdLawRequiresBuilding(_building.DisplayName, _building.BOPLocation.DisplayName))
    }
  }

  /**
   * The Building was built between teh minimum and maxiumim policy creation year
   */
  private function checkYearBuiltMakesSense() {
    Context.addToVisited(this, "checkYearBuiltMakesSense")
    var yb = _building.Building.YearBuilt
    var min = ValidationUtil.getMinPolicyCreationYear()
    var max = ValidationUtil.getMaxPolicyCreationYear()
    if (yb < min or yb > max) {
      Result.addError(_building, "default",
          displaykey.Web.Policy.BOP.Validation.YearBuildingBuilt(displaykey.Web.Policy.BOP.Building.YearBuilt, min, max))
    }
  }

  /**
   * Building improvement dates are between the building's built date and today
   */
  private function checkBuildingImprovementDatesMakeSense() {
    Context.addToVisited(this, "checkBuildingImprovementDatesMakeSense")
    checkBuildingImprovementDate(_building.Building.Heating.YearAdded,
                                 displaykey.Web.Policy.LocationContainer.Location.Building.LastUpdateHeating)
    checkBuildingImprovementDate(_building.Building.Plumbing.YearAdded,
                                 displaykey.Web.Policy.LocationContainer.Location.Building.LastUpdatePlumbing)
    checkBuildingImprovementDate(_building.Building.Roofing.YearAdded,
                                 displaykey.Web.Policy.LocationContainer.Location.Building.LastUpdateRoofing)
    checkBuildingImprovementDate(_building.Building.Wiring.YearAdded,
                                 displaykey.Web.Policy.LocationContainer.Location.Building.LastUpdateWiring)
  }

  private function checkBuildingImprovementDate(elementYear : Integer, elementType : String) {
    if (elementYear < _building.Building.YearBuilt) {
      Result.addError(_building, "default",
          displaykey.Web.Policy.BOP.Validation.BuildingImprovementYearPredatesYearBuilt(elementType,
                                                       displaykey.Web.Policy.BOP.Building.YearBuilt))
    }
    else if (elementYear > Date.Today.YearOfDate) {
      Result.addError(_building, "default",
          displaykey.Web.Policy.BOP.Validation.BuildingDateInFuture(elementType))
    }
  }

  private function allCoveragesEmpty(cov : BOPOrdinanceCov) : boolean {
    return cov.BOPOrdLawCov23LimTerm.Value == null and cov.BOPOrdLawCov2LimTerm.Value == null and cov.BOPOrdLawCov3LimTerm.Value == null
  }

  /**
   * Add an error if Additional Interest details are not unique for current building.
   * {@link AddlInterestDetail} details must be unique for the following properties:
   * <ul>
   *   <li>{@link entity.AddlInterestDetail#PolicyAddlInterest PolicyAddlInterest}</li>
   *   <li>{@link entity.AddlInterestDetail#AdditionalInterestType AdditionalInterestType}</li>
   *   <li>{@link entity.AddlInterestDetail#ContractNumber ContractNumber}</li>
   * </ul>
   */
  private function addlInterestDetailUnique() {
    Context.addToVisited(this, "addlInterestDetailUnique")   
    var thisSet = new HashSet<AddlInterestDetail>(_building.AdditionalInterestDetails.toList())
    for (detail in _building.AdditionalInterestDetails) {
      var oldCount = thisSet.Count
      thisSet.removeWhere(\ o -> o.PolicyAddlInterest == detail.PolicyAddlInterest and 
                                 o.AdditionalInterestType == detail.AdditionalInterestType and 
                                 o.ContractNumber == detail.ContractNumber)
      if (thisSet.Count < oldCount - 1) {
        Result.addError(_building, "default", displaykey.EntityName.PolicyLine.Validation.AddlInterestDetailUnique(detail.DisplayName), "PersonalVehicles")
        if (!thisSet.HasElements) {
          return
        }
      }
    }
  }
  
  /*****************************************************************************
   *
   * Properties and methods for building ClassCode validation.
   *
   ****************************************************************************/
  override protected property get ClassCodeCode()  : String {
    return _building.ClassCode.Code
  }

  override protected property get ReferenceDate() : Date {
    var bopLocation = _building.BOPLocation
    
    var bopLine = bopLocation.BOPLine
    return bopLine.getReferenceDateForCurrentJob(JurisdictionMappingUtil.getJurisdiction(bopLocation.Location ))
  }

  override protected property get PreviousSelectedClassCode() : BOPClassCode {
    var bopLine = _building.BOPLocation.BOPLine
    return (bopLine.Branch.Job.NewTerm)
        ? null : _building.BasedOn.ClassCode
  }

  override protected function createClassCodeSearchCritieria() : BOPClassCodeSearchCriteria {
    return new BOPClassCodeSearchCriteria()
  }

  override protected function addClassCodeError() : void {
    Result.addError(_building, "default",
        displaykey.Web.Policy.BOP.Validation.UnavailableClassCode(
            _building.BOPLocation.Location.LocationNum,
            _building.Building.BuildingNum, ClassCodeCode))
  }
}
