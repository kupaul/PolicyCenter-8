package gw.account

/**
 * Handles a field synced between an AccountContactRole and a PolicyContactRole.
 */
@Export
class AccountContactRoleToPolicyContactRoleSyncedField<S extends PolicyContactRole, T> extends AbstractPolicyContactRoleSyncedField<S, T> {
  public static final var RelationshipTitle : AccountContactRoleToPolicyContactRoleSyncedField<PolicyOwnerOfficer, Relationship> = new AccountContactRoleToPolicyContactRoleSyncedField<PolicyOwnerOfficer, Relationship>("RelationshipTitle")
  
  construct(baseFieldName : String) {
    super(baseFieldName, PendingAccountContactRoleUpdate)
  }

  override function getAccountEntity(accountSyncable : S) : KeyableBean {
    return accountSyncable.AccountContactRole
  }

  override protected function setTemporaryLastUpdateTime(accountSyncable : S) {
    // AccountContactRoles will share the date field on the AccountContact
    accountSyncable.AccountContactRole.AccountContact.setFieldValue("TemporaryLastUpdateTime", accountSyncable.Branch.EditEffectiveDate)
  }
  
}
