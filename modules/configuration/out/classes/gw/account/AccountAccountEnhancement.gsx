package gw.account
uses java.lang.IllegalArgumentException

enhancement AccountAccountEnhancement : entity.AccountAccount {
  /**
   * Returns an {@link AccountRelationship} which represents this {@link AccountAccount} 
   * relationship from the perspective of the "primaryAccount" argument. Throws if the
   * argument account is not involved in this relationship.
   * 
   * @param primaryAccount the account to view the relationship from.
   * @return the {@link AccountRelationship} from the perspective of the primaryAccount argument.
   * @throws IllegalArgumentException if the primaryAccount is not involved in this relationshiop.
   */
  function getRelationship(primaryAccount : Account) : AccountRelationship {
    if (primaryAccount == this.SourceAccount) {
      return new SourceAccountRelationship(this)
    } else if (primaryAccount == this.TargetAccount) {
      return new TargetAccountRelationship(this)
    } else {
      var message = displaykey.Account.RelatedAccount.Error.NoRelationship(primaryAccount, this.RelationshipType, this.SourceAccount, this.TargetAccount)
      throw new IllegalArgumentException(message)
    }
  }
}
