package gw.contact

uses gw.api.domain.account.AbstractDateAwareAccountSyncableImpl
uses com.google.common.collect.ImmutableSet
uses gw.api.domain.account.AccountSyncedField
uses gw.account.ContactToPolicyContactRoleSyncedField
uses gw.account.PersonToPolicyContactRoleSyncedField
uses gw.api.util.DisplayableException
uses gw.api.domain.account.AccountSyncable
uses java.util.Set
uses java.util.HashSet
uses java.util.Collections
uses gw.api.domain.account.PendingUpdate
uses gw.api.domain.account.DateAwareAccountSyncedField

/**
 * Base implementation that handles PolicyContactRoles's account syncing behavior.
 */
@Export
abstract class AbstractPolicyContactRoleAccountSyncableImpl<S extends PolicyContactRole> extends AbstractDateAwareAccountSyncableImpl<S> {
 
  static final var ACCOUNT_SYNCED_FIELDS : Set<AccountSyncedField<AccountSyncable, ?>> =
    Collections.unmodifiableSet<AccountSyncedField<AccountSyncable, ?>>({
      ContactToPolicyContactRoleSyncedField.CompanyName,
      ContactToPolicyContactRoleSyncedField.CompanyNameKanji,
      PersonToPolicyContactRoleSyncedField.FirstName,
      PersonToPolicyContactRoleSyncedField.FirstNameKanji,
      PersonToPolicyContactRoleSyncedField.LastName,
      PersonToPolicyContactRoleSyncedField.LastNameKanji,
      PersonToPolicyContactRoleSyncedField.Particle,
      PersonToPolicyContactRoleSyncedField.DateOfBirth,
      PersonToPolicyContactRoleSyncedField.MaritalStatus
    })
  protected static property get AccountSyncedFieldsInternal() : Set<AccountSyncedField<AccountSyncable, ?>> {  // provided so subclasses can extend this list
    return ACCOUNT_SYNCED_FIELDS
  }
  
  construct(accountSyncable : S) {
    super(accountSyncable)
  }

  override property get AccountSyncedFields() : Set<AccountSyncedField<AccountSyncable, ?>> {  // must override to ensure that we call the correct static AccountSyncedFieldsInternal property
    return AccountSyncedFieldsInternal
  }

  override protected function handleInvalidAccountAndPolicyEntityFields() {
    throw new DisplayableException(displaykey.Web.Policy.Contact.Validation.MustRequote)
  }

  override function refreshAccountInformation() {
    _accountSyncable.AccountContactRole.refresh()
    _accountSyncable.AccountContactRole.AccountContact.refresh()
    _accountSyncable.AccountContactRole.AccountContact.Contact.refresh()
  }

  override function assignToSource(source : KeyableBean) {
    var accountContactRole = source as entity.AccountContactRole
    _accountSyncable.setFieldValue("AccountContactRole", accountContactRole)
    if (accountContactRole.New or accountContactRole.AccountContact.New) {
      var effDate = _accountSyncable.Branch.EditEffectiveDate
      accountContactRole.AccountContact.setFieldValue("TemporaryLastUpdateTime", effDate)
      if (accountContactRole.AccountContact.Contact.New){
        accountContactRole.AccountContact.Contact.setFieldValue("TemporaryLastUpdateTime", effDate)
        for (anAddress in accountContactRole.AccountContact.Contact.AllAddresses){
          if (anAddress.New){
            anAddress.setFieldValue("TemporaryLastUpdateTime", effDate)
          }
        }
      }
    }
    if (not _accountSyncable.Branch.Locked) {  // merging contacts may reassign an account syncable's source in a locked branch, so skip copying in those cases
      copyPolicyContractDataUnchecked()
      if (_accountSyncable.New){
        copyPolicyEntityFieldValues(getOtherPolicyContactRolesWithSameContact())  // overwrite with more specific effective-dated information
      }      
    }
  }
  
  /**
   * Copies policy entity field values from the given policy contact roles.  It will get only one value for
   * the field (e.g. assumes that the other policy contact roles will have the same field value).
   */
  internal function copyPolicyEntityFieldValues(policyContactRoles : PolicyContactRole[]) {
    var fields = new HashSet<AccountSyncedField<AccountSyncable, Object>>(AccountSyncedFields)
    for (policyContactRole in policyContactRoles) {
      if (policyContactRole != _accountSyncable) {
        var fieldsIter = fields.iterator()
        while (fieldsIter.hasNext()) {
          var field = fieldsIter.next()
          var fieldProp = (typeof policyContactRole).TypeInfo.getProperty(field.PolicyEntityFieldName)
          if (fieldProp != null) {
            var theValue = field.getPolicyEntityFieldValue(policyContactRole)
            _accountSyncable.setFieldValue(field.PolicyEntityFieldName, theValue)  // avoid side-effects by seting directly (instead of field#setPolicyEntityFieldValue)
            fieldsIter.remove()
          }
        }
      }
    }
  }
  
  internal function getOtherPolicyContactRolesWithSameContact() : PolicyContactRole[] {
    return _accountSyncable.Branch.PolicyContactRoles.where(\ pcr -> pcr.hasSameContactAs(_accountSyncable) and pcr != _accountSyncable)
  }

  override property get LastUpdateTime() : DateTime {
    return _accountSyncable.AccountContactRole.AccountContact.calculateMaximumLastUpdateTime()
  }

  override function handlePreUpdateImpl() {
    if (HasChangedPolicyEntityFields) {
      super.handlePreUpdateImpl()
    }
  }
  
  override function createUpdateForField(field : DateAwareAccountSyncedField<AccountSyncable, Object>) : KeyableBean & PendingUpdate {
    var update : PendingUpdate & KeyableBean & PendingUpdateDelegate
    if (field.PendingUpdateType == entity.PendingContactUpdate){
      update = new PendingContactUpdate(_accountSyncable.Bundle){
        :PendingUpdateTime = _accountSyncable.EffectiveDate,
        :TargetContact = _accountSyncable.AccountContactRole.AccountContact.Contact
      }
    } else if (field.PendingUpdateType == entity.PendingAccountContactRoleUpdate){
      update = new PendingAccountContactRoleUpdate(_accountSyncable.Bundle){
        :PendingUpdateTime = _accountSyncable.EffectiveDate,
        :TargetAccountContactRole = _accountSyncable.AccountContactRole
      }
    }
    update.Job = _accountSyncable.Branch.Job
    return update
  }

  
  override protected function hasFieldChanged(field : AccountSyncedField) : boolean {
    var isChanged = super.hasFieldChanged(field)
    return not _accountSyncable.AccountContactRole.AccountContact.Contact.New and isChanged
  }
  
  override protected property get AccountContactForActivity() : AccountContact {
    return _accountSyncable.AccountContactRole.AccountContact
  }

}
