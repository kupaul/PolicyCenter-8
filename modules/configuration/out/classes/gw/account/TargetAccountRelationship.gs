package gw.account
uses gw.plugin.Plugins
uses gw.plugin.account.IAccountPlugin

/**
 * This class represents a view of an AccountAccount entity from the perspective of the 
 * TargetAccount in the relationship. The OtherAccount property of this class maps to the 
 * SourceAccount in the AccountAccount, and the RelationshipType property maps to the inverse of
 * the RelationshipType in the AccountAccount, where the inverse is calculated using the plugin 
 * method {@link IAccountPlugin#getInverseRelationshipType(AccountRelationshipType)}.
 */
@Export
class TargetAccountRelationship implements AccountRelationship {
  var _accountAccount : AccountAccount

  construct(accountAccount : AccountAccount) {
    _accountAccount = accountAccount
  }

  override property get OtherAccount() : Account {
    return _accountAccount.SourceAccount
  }
  
  override property set OtherAccount(relatedAccount : Account) {
    _accountAccount.SourceAccount = relatedAccount
  }
  
  override property get RelationshipType() : AccountRelationshipType {
    return Plugins.get(IAccountPlugin).getInverseRelationshipType(_accountAccount.RelationshipType)
  }
  
  override property set RelationshipType(type : AccountRelationshipType) {
    _accountAccount.RelationshipType = Plugins.get(IAccountPlugin).getInverseRelationshipType(type)
  }
}
