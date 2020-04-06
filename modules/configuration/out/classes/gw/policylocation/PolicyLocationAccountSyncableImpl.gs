package gw.policylocation
uses com.google.common.collect.ImmutableSet
uses gw.api.domain.account.AbstractAccountSyncableImpl
uses gw.account.AccountLocationToPolicyLocationSyncedField
uses gw.api.util.DisplayableException
uses gw.api.domain.account.AccountSyncedField
uses gw.api.domain.account.AccountSyncable
uses java.util.Set

/**
 * Implementation that handles PolicyLocation's account syncing behavior.
 */
@Export
class PolicyLocationAccountSyncableImpl extends AbstractAccountSyncableImpl<PolicyLocation> {
 
  static final var ACCOUNT_SYNCED_FIELDS = ImmutableSet.copyOf({
    AccountLocationToPolicyLocationSyncedField.AddressLine1,
    AccountLocationToPolicyLocationSyncedField.AddressLine2,
    AccountLocationToPolicyLocationSyncedField.AddressLine3,
    AccountLocationToPolicyLocationSyncedField.City,
    AccountLocationToPolicyLocationSyncedField.AddressLine1Kanji,
    AccountLocationToPolicyLocationSyncedField.AddressLine2Kanji,
    AccountLocationToPolicyLocationSyncedField.CityKanji,
    AccountLocationToPolicyLocationSyncedField.CEDEX,
    AccountLocationToPolicyLocationSyncedField.CEDEXBureau,
    AccountLocationToPolicyLocationSyncedField.County,
    AccountLocationToPolicyLocationSyncedField.PostalCode,
    AccountLocationToPolicyLocationSyncedField.State,
    AccountLocationToPolicyLocationSyncedField.Country,
    AccountLocationToPolicyLocationSyncedField.Description,
    AccountLocationToPolicyLocationSyncedField.AddressType,
    AccountLocationToPolicyLocationSyncedField.ValidUntil,
    AccountLocationToPolicyLocationSyncedField.EmployeeCount
  })
  protected static property get AccountSyncedFieldsInternal() : Set<AccountSyncedField<AccountSyncable, ?>> {  // provided so subclasses can extend this list
    return ACCOUNT_SYNCED_FIELDS
  }

  construct(accountSyncable : PolicyLocation) {
    super(accountSyncable)
  }

  override property get AccountSyncedFields() : Set  <AccountSyncedField<AccountSyncable, ?>> {  // must override to ensure that we call the correct static AccountSyncedFieldsInternal property
    return AccountSyncedFieldsInternal
  }

  override function refreshAccountInformation() {
    _accountSyncable.AccountLocation.refresh()
  }

  override function assignToSource(accountLocation : KeyableBean) {
    _accountSyncable.setFieldValue("AccountLocation", accountLocation)
    super.assignToSource(accountLocation)
  }
  
  override function handleInvalidAccountAndPolicyEntityFields() {
    throw new DisplayableException(displaykey.Web.Policy.LocationContainer.Location.Validation.MustRequote)
  }

}
