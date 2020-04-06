package gw.lob.cp

uses gw.api.util.JurisdictionMappingUtil
uses gw.internal.ext.org.apache.commons.collections.keyvalue.MultiKey
uses gw.lob.AbstractBuildingValidation
uses gw.validation.PCValidationContext

uses java.util.Date
uses java.util.Set

/**
 * Defines the Commercial Property line building validation utility class.
 *
 * Used to validate a CP line building.
 */
@Export
class CPBuildingValidation extends AbstractBuildingValidation<CPClassCodeSearchCriteria> {
  var _building : CPBuilding

  construct(valContext : PCValidationContext, bldg : CPBuilding, validatedClassCodeSearchCriteria : Set<CPClassCodeSearchCriteria>) {
    super(valContext, validatedClassCodeSearchCriteria)
    _building = bldg
  }

  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")
    requiredFieldsSet()
    atLeastOneBaseCov()
    checkClassCodeIsValid()
    addlInterestDetailUnique()
  }

  private function addlInterestDetailUnique() {
    Context.addToVisited(this, "addlInterestDetailUnique")   
    var detailsPartitionedByUniqueKey = _building.AdditionalInterestDetails
      .partition(\ a -> new MultiKey(a.PolicyAddlInterest, a.AdditionalInterestType, a.ContractNumber))
    for (lst in detailsPartitionedByUniqueKey.Values) {
      if (lst.Count > 1) {
        Result.addError(_building, "default", displaykey.EntityName.PolicyLine.Validation.AddlInterestDetailUnique(lst.first().DisplayName), "CPBuildings")
      }
    }
  }
  
  private function requiredFieldsSet() {
    Context.addToVisited(this, "requiredFieldsSet")
    if (_building.CoverageForm == null) {
      Result.addError(_building, TC_DEFAULT, displaykey.Web.Policy.Validation.MissingRequiredField(
              displaykey.Web.Policy.CP.Validation.Building(_building.CPLocation, _building),
              CPBuilding.Type.TypeInfo.getProperty("CoverageForm").DisplayName))
    }
    if (_building.ClassCode == null) {
      Result.addError(_building, TC_DEFAULT, displaykey.Web.Policy.Validation.MissingRequiredField(
              displaykey.Web.Policy.CP.Validation.Building(_building.CPLocation, _building),
              CPBuilding.Type.TypeInfo.getProperty("ClassCode").DisplayName))
    }
  }

  private function atLeastOneBaseCov() {
    Context.addToVisited(this, "atLeastOneBaseCov")
    var covExists = _building.CPBldgCovExists or _building.CPBPPCovExists or
                    _building.CPBldgBusIncomeCovExists or _building.CPBldgExtraExpenseCovExists
    if (!covExists) {
      if (Context.isAtLeast("quotable")) {
        Result.addError(_building, "default",
        displaykey.Web.Policy.CP.Validation.atLeastOneCovRequired(_building.DisplayName, _building.CPLocation.DisplayName), "CPBuildings")
      } else {
        Result.addWarning(_building, "default",
        displaykey.Web.Policy.CP.Validation.atLeastOneCovRequired(_building.DisplayName, _building.CPLocation.DisplayName), "CPBuildings")
      }
    }
  }

  private function atLeastOneBusinessIncomeLimit() {
    Context.addToVisited(this, "atLeastOneBusinessIncomeLimit")
    var limitExists =  _building.CPBldgBusIncomeCov.BusIncomeMfgLimitTerm.Value != null or
                       _building.CPBldgBusIncomeCov.BusIncomeOtherLimitTerm.Value != null or
                       _building.CPBldgBusIncomeCov.BusIncomeRentalLimitTerm.Value != null

    if (!limitExists) {
        Result.addError(_building, "default",
        displaykey.Web.Policy.CP.Validation.atLeastOneBusIncLimitRequired, "CPBuildings")
    }
  }

  /**
   * Does a page level validation for building
   *<ul>
   * <li> Validates all required fields are set
   * <li> Validates at least one Base Coverage on the building
   * <li> Validates building class code is valid
   * <li> Validates Additional Interest Details is unique
   * <li>  Validates at least one Business Income Limit exists if the building has Bldg Bus Income Coverage
   * </ul>
   * An error or warning displays on screen if the validation result contains any errors or warnings.
   */
  static function validateBuilding(building : CPBuilding) {
    PCValidationContext.doPageLevelValidation( \ context -> {
      var validation = new CPBuildingValidation(context, building, {})
      validation.validate()
      if (building.CPBldgBusIncomeCovExists) {
        validation.atLeastOneBusinessIncomeLimit()
      }
    })
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
    var cpLocation = _building.CPLocation
    var cpLine = cpLocation.CPLine
    return cpLine.getReferenceDateForCurrentJob(JurisdictionMappingUtil.getJurisdiction(cpLocation.Location))
  }

  override protected property get PreviousSelectedClassCode() : CPClassCode {
    var cpLine = _building.CPLocation.CPLine
    return (cpLine.Branch.Job.NewTerm)
        ? null : _building.BasedOn.ClassCode
  }

  override protected function createClassCodeSearchCritieria() : CPClassCodeSearchCriteria {
    return new CPClassCodeSearchCriteria()
  }

  override protected function addClassCodeError() : void {
    Result.addError(_building, "default",
        displaykey.Web.Policy.CP.Validation.UnavailableClassCode(ClassCodeCode))
  }
}
