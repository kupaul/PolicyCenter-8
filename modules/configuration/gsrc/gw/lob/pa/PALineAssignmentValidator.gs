package gw.lob.pa
uses gw.validation.PCValidationContext
uses gw.policy.PolicyLineValidation
uses java.lang.UnsupportedOperationException

@Export
class PALineAssignmentValidator extends PolicyLineValidation<entity.PersonalAutoLine> {

  private static final var VEHICLES_WIZARD_STEP = "PersonalVehicles"
  
  property get paLine() : entity.PersonalAutoLine { return Line }
  
  construct(valContext : PCValidationContext, policyLine : entity.PersonalAutoLine) {
    super(valContext, policyLine)
  }

  /**
   * Validate the PA Line Assignments.
   *
   * Checks the following:
   * <ul>
   *   <li>At least one driver</li>
   *   <li>Sums to 100%</li>
   *   <li>No negative percentages</li>
   *   <li>No excluded assigned driver</li>
   * </ul>
   */
  override function doValidate() {
    atLeastOneDriver()
    hundredPercent()
    nonNegativePercentage()
    noExcludedAssignedDriver()
  }

  /**
   * Added error to validation result if the driver is assigned to a vehicle in the policy
   * @param driver        A policy driver
  */
  function isAssignedToVehicles(driver : PolicyDriver) {
    if (paLine.Vehicles*.Drivers.hasMatch(\ p -> p.PolicyDriver == driver)) {
      Result.addError(paLine, ValidationLevel.TC_DEFAULT, displaykey.Web.Policy.PA.Validation.AssignedDrivers)
    }
  }

  private function atLeastOneDriver() {
    doValidation(\ v -> v.Drivers.Count == 0,
                 \ s -> displaykey.Web.Policy.PA.Validation.AtLeastOneDriver(s))
  }
  
  private function hundredPercent() {
    doValidation(\ v -> v.Drivers.Count > 0 and v.TotalPercentageDriven != 100,
                 \ s -> displaykey.Web.Policy.PA.Validation.DriverPercentages(s))
  }
  
  private function nonNegativePercentage() {
    doValidation(\ v -> v.Drivers.Count > 0 and v.Drivers.hasMatch(\ d -> d.PercentageDriven < 0),
                 \ s -> displaykey.Web.Policy.PA.Validation.DriverPercentageNegative(s))
  }
  
  private function noExcludedAssignedDriver() {
    doValidation(\ v -> v.Drivers.hasMatch(\ dr -> dr.PolicyDriver.Excluded),
                 \ s -> displaykey.Web.Policy.PA.Validation.ExcludedAssignedDriver(s))
  }
  
  private function doValidation( filter(elt : PersonalVehicle) : boolean, displayMsg(elt : String) : String ) {
    var matches = paLine.Vehicles.where(\ v -> filter(v))
    if (!matches.IsEmpty) {
      var vehicleNumbers = (paLine.Branch.Submission.QuoteType != QuoteType.TC_QUICK
            ? matches.map(\ v -> v.VehicleNumber)
            : matches.map(\ v -> v.QuickQuoteNumber))
        .sort().join(", ")
      if (Context.isAtLeast(ValidationLevel.TC_QUICKQUOTABLE)) {
        Result.addError(paLine, ValidationLevel.TC_QUICKQUOTABLE, displayMsg(vehicleNumbers), VEHICLES_WIZARD_STEP)
      } else {
        Result.addWarning(paLine, ValidationLevel.TC_DEFAULT, displayMsg(vehicleNumbers), VEHICLES_WIZARD_STEP)
      }
    }
  }

  override function validateLineForAudit() {
    throw new UnsupportedOperationException(displaykey.Validator.UnsupportedAuditLineError)
  }

}
