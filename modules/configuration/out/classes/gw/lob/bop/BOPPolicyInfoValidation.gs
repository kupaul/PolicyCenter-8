package gw.lob.bop

uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil
uses gw.validation.PCValidationBase

@Export
class BOPPolicyInfoValidation extends PCValidationBase {
    
  var _line : BOPLine as Line
  
  property get bopLine() : BOPLine {
    return Line
  }

  construct(valContext : PCValidationContext, polLine : BOPLine) {
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
  
  static function validateFields(line : BOPLine) {
    var context = ValidationUtil.createContext("default")
    new BOPPolicyInfoValidation(context, line).validate()
    context.raiseExceptionIfProblemsFound()
  }
}
