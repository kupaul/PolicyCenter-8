package gw.validation

/**
 * Interface that defines methods for validation. Every validation class must be able to validation itself and
 * be hooked into deep validation. Objects to be validated, the validation level and other context information
 * should be passed as arguments to the constructor. To minimize the performance impact, validation should be
 * performed selectively based on the validation level and other factors.
 */
@Export
interface PCValidation {

  /**
   * Performs any number of validation checks and adds error and warning messages to the given ValidationResult
   * as appropriate. Validation checks should be written as granular methods that look for a single problem.
   */
  function validate()

  /**
   * Returns an identifier for the given validation.
   */ 
  property get Name() : String
}
