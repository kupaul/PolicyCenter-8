package gw.validation

uses gw.api.system.PCConfigParameters
uses gw.api.validation.ValidationResult
uses java.lang.Integer
uses java.util.Date

@Export
class ValidationUtil {

  /**
   * Return the minimum year that can be used for creating any policy.
   */
  static function getMinPolicyCreationYear() : Integer {
    return PCConfigParameters.MinimumPolicyCreationYear.Value
  }
  
  /**
   * Return the maximum year that can be used for creating any policy.  This will always be a value greater than
   * or equal to the current year.
   */
  static function getMaxPolicyCreationYear() : Integer {
    return Date.Today.YearOfDate +
      PCConfigParameters.MaximumPolicyCreationYearDelta.Value
  }
  
  /**
   * Creates a new PCValidationContext instance with a new validation result and the given level.
   */
  static function createContext(level : ValidationLevel) : PCValidationContext {
    return new PCValidationContext(level)
  }
  
  /**
   * Returns the thread-local ValidationResult object, or null if no thread-local validation 
   * result has been set.
   */
  static function getResult() : ValidationResult {
    return ValidationResult.getCurrent()
  }

  /**
   * Checks the thread-local validation result against the "default" validation level and throws an exception if
   * any errors or warnings are found at that level
   */
  static function checkCurrentResult() {
    var context = new PCValidationContext("default")
    context.Result.add(ValidationResult.getCurrent())
    context.raiseExceptionIfProblemsFound()
  }
}
