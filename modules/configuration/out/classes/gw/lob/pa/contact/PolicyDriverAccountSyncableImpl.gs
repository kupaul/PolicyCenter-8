package gw.lob.pa.contact

uses gw.contact.AbstractPolicyContactRoleAccountSyncableImpl
uses gw.account.PersonToPolicyContactRoleSyncedField
uses com.google.common.collect.ImmutableSet
uses gw.api.domain.account.AccountSyncedField
uses gw.api.domain.account.AccountSyncable
uses java.util.Set

/**
 * Implementation that handles PolicyDriver's account syncing behavior.
 */
@Export
class PolicyDriverAccountSyncableImpl extends AbstractPolicyContactRoleAccountSyncableImpl<PolicyDriver> {

  static final var ACCOUNT_SYNCED_FIELDS = ImmutableSet.copyOf(
    AbstractPolicyContactRoleAccountSyncableImpl.AccountSyncedFieldsInternal.union(
      {
        PersonToPolicyContactRoleSyncedField.LicenseNumber,
        PersonToPolicyContactRoleSyncedField.LicenseState
      }
    )
  )
  protected static property get AccountSyncedFieldsInternal() : Set<AccountSyncedField<AccountSyncable, ?>> {  // provided so subclasses can extend this list
    return ACCOUNT_SYNCED_FIELDS
  }

  construct(accountSyncable : PolicyDriver) {
    super(accountSyncable)
  }

  override property get AccountSyncedFields() : Set<AccountSyncedField<AccountSyncable, ?>> {  // must override to ensure that we call the correct static AccountSyncedFieldsInternal property
    return AccountSyncedFieldsInternal
  }

}
