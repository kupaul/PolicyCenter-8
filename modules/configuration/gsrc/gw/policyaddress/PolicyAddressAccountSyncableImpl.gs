package gw.policyaddress
uses com.google.common.collect.ImmutableSet
uses gw.api.domain.account.AbstractDateAwareAccountSyncableImpl
uses gw.account.AddressToPolicyAddressSyncedField
uses gw.api.util.DisplayableException
uses gw.api.database.Query
uses gw.api.domain.account.AccountSyncedField
uses gw.api.domain.account.AccountSyncable
uses java.util.Set
uses gw.api.domain.account.PendingUpdate
uses gw.api.domain.account.DateAwareAccountSyncedField

/**
 * Implementation that handles PolicyAddress's account syncing behavior.
 */
@Export
class PolicyAddressAccountSyncableImpl extends AbstractDateAwareAccountSyncableImpl<PolicyAddress> {
 
  static final var ACCOUNT_SYNCED_FIELDS = ImmutableSet.copyOf({
    AddressToPolicyAddressSyncedField.AddressLine1,
    AddressToPolicyAddressSyncedField.AddressLine2,
    AddressToPolicyAddressSyncedField.AddressLine3,
    AddressToPolicyAddressSyncedField.City,
    AddressToPolicyAddressSyncedField.AddressLine1Kanji,
    AddressToPolicyAddressSyncedField.AddressLine2Kanji,
    AddressToPolicyAddressSyncedField.CityKanji,
    AddressToPolicyAddressSyncedField.CEDEX,
    AddressToPolicyAddressSyncedField.CEDEXBureau,
    AddressToPolicyAddressSyncedField.County,
    AddressToPolicyAddressSyncedField.PostalCode,
    AddressToPolicyAddressSyncedField.State,
    AddressToPolicyAddressSyncedField.Country,
    AddressToPolicyAddressSyncedField.Description,
    AddressToPolicyAddressSyncedField.AddressType
  })
  protected static property get AccountSyncedFieldsInternal() : Set<AccountSyncedField<AccountSyncable, ?>> {  // provided so subclasses can extend this list
    return ACCOUNT_SYNCED_FIELDS
  }

  construct(accountSyncable : PolicyAddress) {
    super(accountSyncable)
  }

  override property get AccountSyncedFields() : Set<AccountSyncedField<AccountSyncable, ?>> {  // must override to ensure that we call the correct static AccountSyncedFieldsInternal property
    return AccountSyncedFieldsInternal
  }

  override function assignToSource(theAddress : KeyableBean) {
    var address = theAddress as entity.Address
    _accountSyncable.setFieldValue("Address", address)
    if (address.New){
      address.setFieldValue("TemporaryLastUpdateTime", _accountSyncable.Branch.EditEffectiveDate)
    }
    super.assignToSource(address)
  }
  
  override function refreshAccountInformation() {
    _accountSyncable.Address.refresh()
  }

  override function handleInvalidAccountAndPolicyEntityFields() {
    throw new DisplayableException(displaykey.Web.Policy.Address.Validation.MustRequote) 
  }

  override property get LastUpdateTime() : DateTime {
    return _accountSyncable.Address.LastUpdateTime
  }

  override protected function createPendingUpdate() {
    if (not _accountSyncable.Address.New) {  // PolicyAddress writes-through to the Address if new, we only need to handle future/backdated changes if the Address is not new
      super.createPendingUpdate()
    }
  }

  override property get AccountContactForActivity() : AccountContact {
    var acQuery = Query.make(AccountContact)
    acQuery.compare("Account", Equals, PolicyPeriod.Policy.Account)
    acQuery.join("Contact").or( \ res -> {
      res.compare("PrimaryAddress", Equals, _accountSyncable.Address)
      res.subselect("ID", CompareIn, ContactAddress, "Contact").compare("Address", Equals, _accountSyncable.Address)
    })
    return acQuery.select().FirstResult
  }

  override protected function createActivity() {
    if (not _accountSyncable.Address.New) {  // PolicyAddress writes-through to the Address if new, we only need to handle future/backdated changes if the Address is not new
      super.createActivity()
    }
  }

  override function createUpdateForField(field : DateAwareAccountSyncedField<AccountSyncable, Object>) : KeyableBean & PendingUpdate {
    var update = new PendingAddressUpdate(_accountSyncable.Bundle){
      :Job = _accountSyncable.Branch.Job,
      :PendingUpdateTime = _accountSyncable.EffectiveDate,
      :TargetAddress = _accountSyncable.Address
    }
    return update
  }

}
