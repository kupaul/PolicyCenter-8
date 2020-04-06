package gw.lob.pa
uses gw.validation.PCValidationContext
uses gw.policy.PolicyLineValidation
uses gw.api.util.StateJurisdictionMappingUtil
uses java.lang.UnsupportedOperationException

@Export
class PALineVehiclesValidator extends PolicyLineValidation<entity.PersonalAutoLine>  {

  private static final var VEHICLES_WIZARD_STEP = "PersonalVehicles"
  private static var QQINFO_WIZARD_STEP = "PAQuickSubmission_Info"  
  
  property get paLine() : entity.PersonalAutoLine { return Line }
  
  construct(valContext : PCValidationContext, policyLine : entity.PersonalAutoLine) {
    super(valContext, policyLine)
  }

  /**
   * Validate the PA Line Vehicles.
   *
   * Checks the following:
   * <ul>
   *   <li>At least one vehicle</li>
   *   <li>All garages in the same state</li>
   *   <li>VIN is unique in period</li>
   *   <li>Vehicles are valid.</li>
   * </ul>
   */
  override function doValidate() {
    atLeastOneVehicle()
    allGaragesInSameState()
    vinIsUniqueInPeriod()
    validateEachVehicle()
  }

  /**
   * Quick Quote Personal Auto Vehicle Validation - At least one Vehicle is required. Validates each Vehicle by calling the private function <code>validateVehicleQQ</code>.
   * <ul>
   *   <li>Validates VehicleType cannot be NULL</li>
   *   <li>Validates Cost New cannot be NULL</li>
   *   <li>Validates cost New Value must be Positive</li>
   * </ul>
   *  An error or warning displays on screen if the validation result contains any errors or warnings.
   */
  public function validateQQ() {
    Context.addToVisited(this, "validateQQ")
    atLeastOneVehicle()
    paLine.Vehicles.each(\ vehicle -> validateVehicleQQ(vehicle))
  }

  private function validateVehicleQQ(vehicle : entity.PersonalVehicle) {
    if (vehicle.VehicleType == null) {
      Result.addFieldError(vehicle, "VehicleType", "default", 
          displaykey.Web.Policy.PA.Validation.VehicleTypeRequired, QQINFO_WIZARD_STEP)
    }
    if (vehicle.CostNew == null) {
      Result.addFieldError(vehicle, "CostNew", "default", 
          displaykey.Web.Policy.PA.Validation.CostNewRequired, QQINFO_WIZARD_STEP)
    } else  if (not vehicle.CostNew.IsPositive) {
      Result.addFieldError(vehicle, "CostNew", "default", 
          displaykey.Web.Policy.PA.Validation.PositiveCostNewRequired, QQINFO_WIZARD_STEP)
    }
  }

  private function atLeastOneVehicle() {
    if (paLine.Vehicles.IsEmpty and Context.isAtLeast(ValidationLevel.TC_DEFAULT)) {
      var msg = displaykey.Web.Policy.PA.Validation.AtLeastOneVehicle
      if (Context.isAtLeast(ValidationLevel.TC_QUICKQUOTABLE)) {
        Result.addError(paLine, ValidationLevel.TC_QUICKQUOTABLE, msg, VEHICLES_WIZARD_STEP)
      } else {
        Result.addWarning(paLine, ValidationLevel.TC_DEFAULT, msg, VEHICLES_WIZARD_STEP)
      }
    }
  }

  private function vinIsUniqueInPeriod() {
    var vehicles = paLine.Vehicles.where(\ v -> v.Vin.HasContent)
    if (vehicles.map(\ v -> v.Vin).toSet().Count <> vehicles.Count) {
      Result.addError(paLine, ValidationLevel.TC_DEFAULT, displaykey.Web.Policy.PA.Validation.VinNumbers, VEHICLES_WIZARD_STEP)
    }
  }

  /*
   * For a Submission the base state initially defaults to the primary insured's address state, 
   * but if all of the vehicles are garaged in a different state, then it is THAT state that should 
   * be used as the basis for forms and coverage rules, not the one specified on Policy Info.
   * For a Change job, the base state can not be changed and we can validate against the base state 
   * of the 'based on' branch.
   */
  function allGaragesInSameState() {
    var baseState : State
    var errorMessaage : String
    if (Line.Branch.Job typeis PolicyChange) {
      baseState = StateJurisdictionMappingUtil.getStateMappingForJurisdiction(Line.Branch.BasedOn.BaseState)
      errorMessaage = displaykey.Web.Policy.PA.Validation.ChangeBaseState(baseState)
    } else {
      baseState = paLine.Vehicles.first().GarageLocation.State
      errorMessaage = displaykey.Web.Policy.PA.Validation.GaragesInSameState
    }
    if (paLine.Vehicles.hasMatch(\ vehicle -> vehicle.GarageLocation.State != baseState)) {
      Result.addError(paLine, ValidationLevel.TC_DEFAULT, errorMessaage, VEHICLES_WIZARD_STEP)
    }
  }

  private function validateEachVehicle() {
    paLine.Vehicles.each(\ vehicle -> new PersonalVehicleValidation(Context, vehicle).validate())
  }

  override function validateLineForAudit() {
    throw new UnsupportedOperationException(displaykey.Validator.UnsupportedAuditLineError)
  }

}
