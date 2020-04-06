package gw.lob.pa

uses java.util.HashSet
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil

@Export
class PersonalVehicleValidation extends PCValidationBase {

  private static var VEHICLES_WIZARD_STEP = "PersonalVehicles"  

  var _vehicle : PersonalVehicle as Vehicle
  construct(valContext : PCValidationContext, veh : PersonalVehicle) {
    super(valContext)
    _vehicle = veh
  }

  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")
    lengthOfLeaseRequiredIfLeased()
    addlInterestDetailUnique()
    requiredFields()
  }

  /**
  ** Validation to check the Length of Lease or Rental is not null if the Vehicle is leased or Rented
  */
  function lengthOfLeaseRequiredIfLeased() {
    Context.addToVisited(this, "lengthOfLeaseRequiredIfLeased")
    if (Vehicle.LeaseOrRent and Vehicle.LengthOfLease == null) {
      Result.addFieldError(Vehicle, "LengthOfLease", "default", 
          displaykey.Web.Policy.PA.Validation.LengthOfLeaseRequired, VEHICLES_WIZARD_STEP)
    }
  }

  /**
   * Validation to check the uniqueness of Additional Interest Details of the Vehicle
   * Display error on page if there are duplicate entries matching all of the following conditions:
   * <ul>
   *   <li> {@link entity.PolicyAddlInterest}
   *   <li> {@link typekey.AdditionalInterestType}
   *   <li>  Contract number on Additional Interest
   * </ul>
  */
  function addlInterestDetailUnique() {
    Context.addToVisited(this, "addlInterestDetailUnique")   
    var thisSet = new HashSet<AddlInterestDetail>(Vehicle.AdditionalInterestDetails.toList())
    for (detail in Vehicle.AdditionalInterestDetails) {
      var oldCount = thisSet.Count
      thisSet.removeWhere(\ o -> o.PolicyAddlInterest == detail.PolicyAddlInterest and 
                                 o.AdditionalInterestType == detail.AdditionalInterestType and 
                                 o.ContractNumber == detail.ContractNumber)
      if (thisSet.Count < oldCount - 1) {
        Result.addError(Vehicle, "default", displaykey.EntityName.PolicyLine.Validation.AddlInterestDetailUnique(detail.DisplayName), VEHICLES_WIZARD_STEP)
        if (!thisSet.HasElements) {
          return
        }
      }
    }
  }

  /**
   * Checks Vehicle required fields: Type, VIN, LicenseState, CostNew
   */
  function requiredFields() {
    Context.addToVisited(this, "requiredFields")
    if (Vehicle.VehicleType == null) {
      Result.addFieldError(Vehicle, "VehicleType", "default", 
          displaykey.Web.Policy.PA.Validation.VehicleTypeRequired, VEHICLES_WIZARD_STEP)
    }

    if (Vehicle.LicenseState == null) {
      Result.addFieldWarning(Vehicle, "LicenseState", "default",
          displaykey.Web.Policy.PA.Validation.LicenseStateRequired, VEHICLES_WIZARD_STEP)
    }

    if (not Vehicle.Vin.HasContent) {
      Result.addFieldError(Vehicle, "Vin", "default", 
          displaykey.Web.Policy.PA.Validation.VINRequired, VEHICLES_WIZARD_STEP)
    }
    if (Vehicle.CostNew == null) {
      Result.addFieldError(Vehicle, "CostNew", "default", 
          displaykey.Web.Policy.PA.Validation.CostNewRequired, VEHICLES_WIZARD_STEP)
    } else  if (not Vehicle.CostNew.IsPositive) {
      Result.addFieldError(Vehicle, "CostNew", "default", 
          displaykey.Web.Policy.PA.Validation.PositiveCostNewRequired, VEHICLES_WIZARD_STEP)
    }
  }

  /**
   * Validate Vehicles on creation
   * <ul>
   *   <li> Validates length of Lease/Rent is not NULL if the Vehicle is Leased or Rented
   *   <li> Validates Additional Interest Details uniqueness
   *   <li> Validates all required fields are not NULL
   * </ul>
   * An error or warning displays on screen if the validation result contains any errors or warnings.
  */
  static function validateVehiclesOnCreate(paLine : PersonalAutoLine) {
    var context = ValidationUtil.createContext("default")
    paLine.Vehicles.each(\ vehicle -> new PersonalVehicleValidation(context, vehicle).validate())
    context.raiseExceptionIfProblemsFound()
  }
}
