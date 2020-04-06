package gw.policy
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses java.util.HashSet

/**
 * Validation to ensure that a policy additional insured does not have 
 * more than one detail of the same type. 
 */
@Export
class PolicyAddlInsuredAndTypeUniqueValidation extends PCValidationBase {
    
  var _policyAddlInsured : PolicyAddlInsured

  construct(valContext : PCValidationContext, policyAddlInsured : PolicyAddlInsured) {
    super(valContext)
    _policyAddlInsured = policyAddlInsured
  }

  /**
   * This code formerly existed in
   * BALineValidation.additionalInsuredAndTypeUnique(),
   * BOPLineValidation.additionalInsuredAndTypeUnique(), and
   * GLLineValidation.additionalInsuredAndTypeUnique(). It checks that
   * there are no repeat AdditionalInsuredDetails types in the 
   * additionalInsured's list PolicyAdditionalInsuredDetails.
   */
  override function validateImpl() {
    Context.addToVisited(this, "validate")
    var seenTypes = new HashSet<typekey.AdditionalInsuredType>()
    for (var additionalInsuredDetail in _policyAddlInsured.PolicyAdditionalInsuredDetails) {
      if (seenTypes.contains(additionalInsuredDetail.AdditionalInsuredType)) {
        Result.addError(_policyAddlInsured, "default", displaykey.Web.PolicyLine.Validation.AdditionalInsuredUnique(_policyAddlInsured))
      } else {
        seenTypes.add(additionalInsuredDetail.AdditionalInsuredType)
      }
    }
  }

}
