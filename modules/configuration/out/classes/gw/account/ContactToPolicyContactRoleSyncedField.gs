package gw.account

/**
 * Handles a field synced between a Contact and a PolicyContactRole.
 */
@Export
class ContactToPolicyContactRoleSyncedField<S extends PolicyContactRole, T> extends AbstractPolicyContactRoleSyncedField<S, T> {
  public static final var CompanyName : ContactToPolicyContactRoleSyncedField<PolicyContactRole, String> = new ContactToPolicyContactRoleSyncedField<PolicyContactRole, String>("Name", "CompanyNameInternal", "CompanyName", "CompanyNameIsNull")
  public static final var CompanyNameKanji : ContactToPolicyContactRoleSyncedField<PolicyContactRole, String> = new ContactToPolicyContactRoleSyncedField<PolicyContactRole, String>("NameKanji", "CompanyNameKanjiInternal", "CompanyNameKanji", "CompanyNameKanjiIsNull")

  construct(accountEntityFieldNameArg : String, policyEntityFieldNameArg : String, updateEntityFieldName : String, updateEntityIsNullFieldName : String) {
    super(accountEntityFieldNameArg, policyEntityFieldNameArg, updateEntityFieldName, updateEntityIsNullFieldName, PendingContactUpdate)
  }


  construct(baseFieldName : String) {
    super(baseFieldName, PendingContactUpdate)
  }

  override function getAccountEntity(accountSyncable : S) : KeyableBean {
    return accountSyncable.AccountContactRole.AccountContact.Contact
  }

}
