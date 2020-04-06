package gw.account

/**
 * This class represents a view of an AccountAccount entity from the perspective of the 
 * SourceAccount in the relationship. The OtherAccount property of this class maps to the 
 * TargetAccount in the AccountAccount, and the RelationshipType property maps directly to the 
 * RelationshipType in the AccountAccount.
 */
@Export
class SourceAccountRelationship implements AccountRelationship {
  var _accountAccount : AccountAccount

  construct(accountAccount : AccountAccount) {
    _accountAccount = accountAccount
  }

  override property get OtherAccount() : Account {
    return _accountAccount.TargetAccount
  }
  
  override property set OtherAccount(relatedAccount : Account) {
    _accountAccount.TargetAccount = relatedAccount
  }
  
  override property get RelationshipType() : AccountRelationshipType {
    return _accountAccount.RelationshipType
  }
  
  override property set RelationshipType(type : AccountRelationshipType) {
    _accountAccount.RelationshipType = type
  }
}
