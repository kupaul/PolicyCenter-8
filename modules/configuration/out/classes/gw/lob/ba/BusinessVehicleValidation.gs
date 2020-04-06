package gw.lob.ba

uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses java.util.HashSet

/**
 * Validation for {@link entity.BusinessVehicle BusinessVehicle}
 */
@Export
class BusinessVehicleValidation extends PCValidationBase {
  
  var _vehicle : BusinessVehicle as Vehicle
  
  construct(valContext : PCValidationContext, veh : BusinessVehicle) {
    super(valContext)
    _vehicle = veh
  }

  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")
    vin()
    lengthOfLeaseRequiredIfLeased()
    addlInterestDetailUnique()
    mutuallyExclusivePhysDamageCoverages()
  }

  /**
   * Add an error to the current context if the "VIN" number is not set.
   */
  function vin() {
    Context.addToVisited(this, "vin")
    if (Vehicle.Vin == null) {
      Result.addError(Vehicle, "default", 
        displaykey.Web.Policy.BA.Validation.NoVin( Vehicle.VehicleNumber, Vehicle.Location))
    }
  }

  /**
   * Validate that "lengthOfLeaseRequiredIfLeased" is set if a vehicle is leased.
   */
  function lengthOfLeaseRequiredIfLeased() {
    Context.addToVisited(this, "lengthOfLeaseRequiredIfLeased")
    if (Vehicle.LeaseOrRent and Vehicle.LengthOfLease == null) {
      Result.addError(Vehicle, "default", 
        displaykey.Web.Policy.BA.Validation.LengthOfLeaseRequired(Vehicle.VehicleNumber))
    }
  }

  /**
   * Add an error if Additional Interest details are not unique for any given vehicle.
   * {@link AddlInterestDetail} details must be unique for the following properties:
   * <ul>
   *   <li>{@link entity.AddlInterestDetail#PolicyAddlInterest PolicyAddlInterest}</li>
   *   <li>{@link entity.AddlInterestDetail#AdditionalInterestType AdditionalInterestType}</li>
   *   <li>{@link entity.AddlInterestDetail#ContractNumber ContractNumber}</li>
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
        Result.addError(Vehicle, "default", displaykey.EntityName.PolicyLine.Validation.AddlInterestDetailUnique(detail.DisplayName), "BusinessVehicles")
        if (!thisSet.HasElements) {
          return
        }
      }
    }
  }

  /**
   * Add an error if both BAComprehensiveCov and BASpecCausesLossCov exist for this vehicle.
   */
  function mutuallyExclusivePhysDamageCoverages() {
    Context.addToVisited( this, "mutuallyExclusivePhysDamageCoverages" )
    if (Vehicle.BAComprehensiveCovExists and Vehicle.BASpecCausesLossCovExists) {
      Result.addError( Vehicle, "default", displaykey.Web.Policy.BA.Validation.mutuallyExclusivePhysDamage )
    }
  }

  /**
   * Validate a given vehicle.
   */
  static function validateVehicle(vehicle : BusinessVehicle) {
    PCValidationContext.doPageLevelValidation( \ context -> {
      var validation = new BusinessVehicleValidation(context, vehicle)
      validation.validate()
    })
  }
}
