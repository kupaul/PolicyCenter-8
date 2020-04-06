package gw.job

/**
 * A marker exception class that is thrown in order to halt a quote due to some sort of error condition
 * such as validation errors, product model sync errors, or blocking UW issues.
 */
@Export
class QuoteHaltedException extends java.lang.RuntimeException {
  
  var _haltedDueToUWIssues : boolean as HaltedDueToUWIssues
  
  construct(issues : List<String>) {
    super(issues.join("; "))
    _haltedDueToUWIssues = false
  }
}
