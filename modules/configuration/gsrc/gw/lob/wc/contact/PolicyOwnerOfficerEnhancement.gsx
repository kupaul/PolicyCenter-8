package gw.lob.wc.contact
uses gw.account.AccountContactRoleToPolicyContactRoleSyncedField

@Export
enhancement PolicyOwnerOfficerEnhancement : entity.PolicyOwnerOfficer {

  /**
   * Shared and revisioned relationship/title.
   */
  property get RelationshipTitle() : Relationship {
    return AccountContactRoleToPolicyContactRoleSyncedField.RelationshipTitle.getValue(this)
  }

  /**
   * Shared and revisioned relationship/title.
   */
  property set RelationshipTitle(arg : Relationship) {
    AccountContactRoleToPolicyContactRoleSyncedField.RelationshipTitle.setValue(this, arg)
  }

}