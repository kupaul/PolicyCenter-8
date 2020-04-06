package gw.validation

uses com.guidewire.pl.system.bundle.validation.EntityValidationException
uses java.util.HashMap
uses java.util.HashSet
uses java.util.Set
uses java.lang.ThreadLocal

/**
 * Gathers contextual information for validation, including the validation level, results for accumulating errors
 * and warnings and a record of the classes and validation methods that have been visited.
 */
@Export
class PCValidationContext {
  
  var _result : PCValidationResult as Result
  var _level : ValidationLevel as Level
  var _visited = new HashMap<String, Set<String>>()

  /**
   * Constructor
   *
   * @param valLevel ValidationLevel at which validation should be performed
   */
  construct(valLevel : ValidationLevel) {
    _result = new PCValidationResult()
    _level = valLevel
  }

  // For testing
  internal property get VisitedClasses() : Set<String> {
    return _visited.Keys
  }

  /**
   * Indicates whether validation should be performed for the given level.
   *
   * @param valLevel
   */
  function isAtLeast(valLevel : ValidationLevel) : boolean {
    // lower priority is "higher" by some twist of logic
    return Level.getPriority() <= valLevel.getPriority()
  }

  /**
   * Should be called by every method invoked during validation to get a complete
   * picture of the checks that were performed. The method returns true if the
   * given validation.Name and methodName have not been visited before. 
   *
   * While this method provides the opportunity to trace validation logic, it
   * does not do so automatically. To be effective, each method needs to make this 
   * call and pass in a methodName that matches its name.
   *
   * @param validation  The instance of the validation class to track
   * @param methodName  The method that is being invoked
   */
  function addToVisited(validation : PCValidation, methodName : String) : boolean {
    var className = validation.Name
    if (hasVisited(className, methodName)) {
      return false
    }
    if (not _visited.containsKey(className)) {
      _visited.put(className, new HashSet<String>())
    }
    _visited.get(className).add(methodName)
    return true
  }

  /**
   * Indicates whether the given combination of validation object and method name have been seen before.
   *
   * @param className fully qualified validation class name, including package
   * @param methodName
   */
  function hasVisited(className : String, methodName : String) : boolean {
    var methods = _visited.get(className)
    return methods != null and methods.contains(methodName)
  }

  /**
   * Produces a string that lists the validation methods that were visited as validation was performed
   * with this Context. The string is useful for debugging.
   */
  function showVisited() : String {
    var debugString = new java.lang.StringBuilder()
    for (className in _visited.Keys) {
      _visited.get(className)
          .each( \ methodName -> debugString.append(className).append(".").append(methodName).append("\n") )
    }
    return debugString.toString()
  }

  /**
   * Resets visited hash set
   */
   function resetVisited() {
     _visited.clear()
   }

  /**
   * Throws EntityValidationException if errors or warnings have been added to the context.
   */    
  function raiseExceptionIfProblemsFound() {
    if (Result.hasErrors(Level) or Result.hasWarnings(Level)) {
      throw new EntityValidationException(Result, Level)
    }
  }

  /**
   * Throws EntityValidationException if errors *only* have been added to the context.
   */    
  function raiseExceptionIfErrorsFound() {
    if (Result.hasErrors(Level)) {
      throw new EntityValidationException(Result, Level)
    }
  }

  private static var _ignorePageLevelValidations = new ThreadLocal<Boolean>()

  static function doPageLevelValidation(validator(context : PCValidationContext)) {
    doPageLevelValidation(validator, ValidationLevel.TC_DEFAULT)
  }
  
  static function doPageLevelValidation(validator(context : PCValidationContext), valLevel : ValidationLevel) {
    //skip any validation if currently ignoring page-level stuff
    if (_ignorePageLevelValidations.get() != Boolean.TRUE) {    
      var context = ValidationUtil.createContext(valLevel)
      validator(context)
      context.raiseExceptionIfProblemsFound()
    }
  }

  static function doWhileIgnoringPageLevelValidation(action()) {
    try {
      _ignorePageLevelValidations.set(Boolean.TRUE)  
      action()
    } finally {
      _ignorePageLevelValidations.remove()
    }
  }
}
