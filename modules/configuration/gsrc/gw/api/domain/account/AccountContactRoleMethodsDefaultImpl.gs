package gw.api.domain.account

/**
 * Default implementation of {@link AccountContactRoleMethods}.
 */
@Export
class AccountContactRoleMethodsDefaultImpl implements AccountContactRoleMethods {

  var _accountContactRole : AccountContactRole as readonly AccountContactRole
  
  construct(role : AccountContactRole) {
    _accountContactRole = role
  }
  
  override function initialize() {
  }

}
