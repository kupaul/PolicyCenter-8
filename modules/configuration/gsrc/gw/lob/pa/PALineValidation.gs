package gw.lob.pa

uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses java.lang.UnsupportedOperationException


@Export
class PALineValidation extends PolicyLineValidation<entity.PersonalAutoLine> {
  
  property get paLine() : entity.PersonalAutoLine { return Line }

  private var _covsValidator : PALineCoveragesValidator as CoveragesValidator
  private var _driversValidator : PALineDriversValidator as DriversValidator
  private var _vehiclesValidator : PALineVehiclesValidator as VehiclesValidator
  private var _assignmentValidator : PALineAssignmentValidator as AssignmentValidator
  
  construct(aContext : PCValidationContext, aLine : entity.PersonalAutoLine) {
    super(aContext, aLine)
    _covsValidator = new PALineCoveragesValidator(aContext, aLine)
    _driversValidator = new PALineDriversValidator(aContext, aLine)
    _vehiclesValidator = new PALineVehiclesValidator(aContext, aLine)
    _assignmentValidator = new PALineAssignmentValidator(aContext, aLine)
  }

  /**
   * Validate the PA Line.
   *
   * Checks the following:
   * <ul>
   *   <li>PolicyPeriod no more than one year</li>
   *   <li>Coverages are valid</li>
   *   <li>Assignments are valid</li>
   *   <li>Vehicles are valid</li>
   *   <li>Drivers are valid</li>
   * </ul>
   */
  override function doValidate() {
    policyPeriodOneYearMax()

    CoveragesValidator.doValidate()
    AssignmentValidator.doValidate()
    VehiclesValidator.doValidate()
    DriversValidator.doValidate()
  }

  /**
   * Validate the given PA policy period has one year maximum duration
   * If policy line's effective date is before the policy line's expiration date minus one year then an error will be raised
   */
  function policyPeriodOneYearMax() {
    if (paLine.EffectiveDate.before(paLine.ExpirationDate.addYears(-1))) {
      Result.addError(paLine, ValidationLevel.TC_DEFAULT, displaykey.Web.Policy.PA.Validation.MaxPolicyPeriod)
    }
  }

  override function validateLineForAudit() {
    throw new UnsupportedOperationException(displaykey.Validator.UnsupportedAuditLineError)
  }
  
}

