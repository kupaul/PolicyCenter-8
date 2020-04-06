package gw.lob.pa
uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil

@Export
class PALineStepsValidator {

  /**
   * Removing Driver validation
   * Validates the driver must not be assigned to any Vehicles in the policy.
   *
   * @param paLine Personal Auto Line
   * @param driver Policy Driver wants to be removed
   *
   * @Throws EntityValidationException if user is trying to remove a driver who is assigned to any vehicles in the Personal Auto policy.
   */
  static function validateRemovingDriver(paLine : PersonalAutoLine, driver : PolicyDriver) {
    var context = ValidationUtil.createContext(ValidationLevel.TC_DEFAULT)
    var validator = new PALineValidation(context, paLine)
    validator.AssignmentValidator.isAssignedToVehicles(driver)
    context.raiseExceptionIfProblemsFound()
  }

  /**
   * Driver validation
   * Validates the Drivers in the policy.
   * An error or warning displays on screen if the validation result contains any errors or warnings.
   *
   * @param paLine Personal Auto Line
   *
   */
  static function validateDriversStep(paLine : PersonalAutoLine) {
    PCValidationContext.doPageLevelValidation(\ context -> {
      var validator = new PALineValidation(context, paLine)
      validator.DriversValidator.validate()
    })
  }

  /**
   * Vehicles validation
   * Validates the Vehicles, Assign Drivers to Vehicles percentage and license State Matches Garage State in the policy.
   * An error or warning displays on screen if the validation result contains any errors or warnings.
   *
   * @param paLine Personal Auto Line
   *
   */
  static function validateVehiclesStep(paLine : PersonalAutoLine) {
    PCValidationContext.doPageLevelValidation(\ context -> {
      var validator = new PALineValidation(context, paLine)
      validator.VehiclesValidator.validate()
      validator.AssignmentValidator.validate()
      validator.DriversValidator.licenseStateMatchesGarageState()
    })
  }


  /**
   * All Vehicles Garaged In Same State validation
   * Validates All Vehicles in the policy garaged in the same state.
   * An error or warning displays on screen if the validation result contains any errors or warnings.
   *
   * @param paLine Personal Auto Line
   *
   */
  static function validateAllVehiclesGaragedInSameState(paLine : PersonalAutoLine) : PCValidationContext {
    var result : PCValidationContext 
    PCValidationContext.doPageLevelValidation(\ context -> {
      var validator = new PALineValidation(context, paLine)
      validator.VehiclesValidator.allGaragesInSameState()
      result = context
    })      
    return result
  }
  /**
   * Personal Auto Line validation
   * Validates coverages in the personal auto line.
   * An error or warning displays on screen if the validation result contains any errors or warnings.
   *
   * @param paLine Personal Auto Line
   *
   */
  static function validatePALineStep(paLine : PersonalAutoLine) {
    PCValidationContext.doPageLevelValidation(\ context -> {
      var validator = new PALineValidation(context, paLine)
      validator.CoveragesValidator.validate()
    })
  }
}
