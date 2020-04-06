package gw.validation
uses gw.api.profiler.PCProfilerTag

/**
 * Provides base support for validation, giving access to the PCValidationContext within which every
 * validation instance must work.
 */
@Export
abstract class PCValidationBase implements PCValidation {
  
  var _context : PCValidationContext

  /**
   * The validation context.  This context stores validation errors and warnings that are encountered during validation
   */
  property get Context() : PCValidationContext { return _context }

  /**
   * The validation level to perform.  i.e. if attempting to quote, the validation level will be {@link typekey.ValidationLevel#TC_QUOTABLE}
   */
  property get Level() : ValidationLevel { return Context.Level }

  /**
   * The validation results
   */
  property get Result() : PCValidationResult { return Context.Result }

  override property get Name() : String { return (typeof this).Name }
  
  /**
   * Constructor that takes a validation context, which holds the level to perform validation at and the
   * validation results (errors and warnings).
   *
   * @param context PCValidationContext
   */
  protected construct(valContext : PCValidationContext) {
    _context = valContext
  }

  final override function validate() {
    Context.addToVisited(this, "validate")
    withProfilerLabel(Name, \ -> validateImpl())
  }

  abstract protected function validateImpl()

  /**
   * If the Guidewire Profiler is active, performs the given task within
   * the {@link PCProfilerTag#VALIDATE} tag. When the data is displayed in the
   * profiler analysis tool, it will be marked with the given <code>label</code>.
   */
  protected function withProfilerLabel(label : String, task()) {
    PCProfilerTag.VALIDATE.execute(\ p -> {
      p.setProperty(label)
      task()
    })
  }

}
