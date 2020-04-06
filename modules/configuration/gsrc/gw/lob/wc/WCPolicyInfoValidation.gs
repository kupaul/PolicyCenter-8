package gw.lob.wc

uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil
uses gw.validation.PCValidationBase

@Export
class WCPolicyInfoValidation extends PCValidationBase {

  var _line : WorkersCompLine as Line
  
  property get wcLine() : WorkersCompLine {
    return Line
  }

  construct(valContext : PCValidationContext, polLine : WorkersCompLine) {
    super(valContext)
    _line = polLine
  }

  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")
    checkYearBusinessStartedMakesSense()
  }
  
  function checkYearBusinessStartedMakesSense() {
    Context.addToVisited(this, "checkYearBusinessStartedMakesSense")
    new gw.policy.PolicyYearBusinessStartedValidator(Context, Line).validate()
  }
  
  static function validateFields(line : WorkersCompLine) {
    var context = ValidationUtil.createContext("default")
    new WCPolicyInfoValidation(context, line).validate()
    context.raiseExceptionIfProblemsFound()
  }
}
