package gw.api.domain.account

@Export
class NamedInsuredAccountContactRoleMethods extends AccountContactRoleMethodsDefaultImpl {

  construct(role : NamedInsured) {
    super(role)
  }
  
  override function initialize() {
    NamedInsured.IndustryCode = NamedInsured.AccountContact.Account.IndustryCode
  }
  
  private property get NamedInsured() : NamedInsured {
    return AccountContactRole as NamedInsured
  }

}
