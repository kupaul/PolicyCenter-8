package gw.policy
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil

/**
 * Validation to ensure that the year the business starts (assuming a 
 * non-null value) is within the range of the min and max policy creation year.
 */
@Export
class PolicyYearBusinessStartedValidator extends PCValidationBase {
    
  var _policyLine : PolicyLine

  //could pass in the year business started, but at the moment the line is more natural
  construct(valContext : PCValidationContext, line : PolicyLine) {
    super(valContext)
    _policyLine = line
  }

  /**
   * Formerly this code existed in 
   * BOPPolicyInfoValidation.checkYearBusinessStartedMakesSense() and
   * WCPolicyInfoValidation.checkYearBusinessStartedMakesSense
   */
  override function validateImpl() {
    Context.addToVisited(this, "validateImpl")
    var ybs = _policyLine.Branch.Policy.Account.YearBusinessStarted
    if (ybs != null) {
      if (Context.isAtLeast("default")) {
        var min = ValidationUtil.getMinPolicyCreationYear()
        var max = ValidationUtil.getMaxPolicyCreationYear()
        if (ybs < min or ybs > max) {
          Result.addError(_policyLine, "default",
            displaykey.Web.Policy.Validation.YearBusinessStarted(min, max))
        }
      }
    }
  }

}
