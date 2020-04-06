package gw.policy

uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext


@Export
class PolicyContactRoleValidation extends PCValidationBase {

  var _policyRole : PolicyContactRole as PolicyRole

  construct(valContext : PCValidationContext, role : PolicyContactRole) {
    super(valContext)
    _policyRole = role
  }

  override protected function validateImpl() {
    Context.addToVisited( this, "validateImpl" )

    allAccountContactsAreActive()
  }

  function allAccountContactsAreActive() {
    Context.addToVisited(this, "allAccounContactsAreActive")
    if (Context.isAtLeast("quotable")) {
      if (!PolicyRole.AccountContactRole.AccountContact.Active) {
        Result.addError(PolicyRole.Branch, "quotable", displaykey.Web.Policy.PolicyContact.Validation.NotActive(PolicyRole.DisplayName))
      }
    }
  }
}
