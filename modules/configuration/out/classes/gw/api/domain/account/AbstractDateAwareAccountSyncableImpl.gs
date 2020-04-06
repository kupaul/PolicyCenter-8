package gw.api.domain.account
uses gw.api.domain.DisplayKeyResolver
uses gw.entity.IEntityType
uses gw.entity.IEntityPropertyInfo
uses java.lang.IllegalArgumentException
uses java.util.ArrayList

/**
 * Base account syncable implementation that considers the current date and the entity's
 * SliceDate and EffectiveDate when determining if the account syncable is synced and how
 * it handles an AccountSyncableEVent.
 */
@Export
abstract class AbstractDateAwareAccountSyncableImpl<S extends AccountSyncable> extends AbstractAccountSyncableImpl<S> {
 
  construct(accountSyncable : S) {
    super(accountSyncable)
  }

  /**
   * A date-aware account syncable is synced if it is on a job that allows account syncing, in a
   * policy period status in which it can be edited and, if it is on job with date-aware account
   * syncing, then the account syncable is being modified within the update time window.
   */
  override property get SyncedToAccount() : boolean {
    return super.SyncedToAccount and (!PolicyPeriod.Job.AccountSyncingIsDateAware or WithinUpdateTimeWindow)
  }

  protected property get WithinUpdateTimeWindow() : boolean {
    return !(IsFutureChangeEvent or IsPastChangeEvent)
  }

  protected property get IsFutureChangeEvent() : boolean {
    return SliceOrEffectiveDate.afterNow()
  }

  protected property get IsFirstFutureChangeEvent() : boolean {
    var effDated = _accountSyncable as EffDated
    var effDate = effDated.BranchUntyped.EditEffectiveDate
    var basedOn = effDated.BasedOnUntyped
    if (not effDate.afterNow() or basedOn == null or not effDated.EffectiveDateRange.includes(effDate)) {
      return false
    }
    var allSliceDates = basedOn.VersionList.AllVersionsUntyped*.EffectiveDate
    return not allSliceDates.hasMatch(\ d -> d.afterNow() and d <= effDate)
  }

  protected property get IsPastChangeEvent() : boolean {
    return LastUpdateTime != null and SliceOrEffectiveDate.compareIgnoreTime(LastUpdateTime) < 0
  }

  protected property get IsEditEffectiveDateChangeEvent() : boolean {
    return SliceOrEffectiveDate == PolicyPeriod.EditEffectiveDate
  }

  protected property get SliceOrEffectiveDate() : DateTime {
    var effDatedAccountSyncable = (_accountSyncable as EffDated)
    return effDatedAccountSyncable.Slice ? effDatedAccountSyncable.SliceDate : effDatedAccountSyncable.EffectiveDate
  }

  /**
   * Returns the last update time of the account-level entity, given this account syncable.
   */
  abstract protected property get LastUpdateTime() : DateTime

  override protected function prepareForPromoteImpl() {
    if (!PolicyPeriod.Job.AccountSyncingIsDateAware or WithinUpdateTimeWindow) {
      super.prepareForPromoteImpl()
    }
  }

  override protected function prepareForJobStartImpl() {
    if (IsFirstFutureChangeEvent or HasEmptyPolicyEntityFields) {
      copyPolicyContractDataUnchecked()
    }
  }

  override function handlePreUpdateImpl() {
    super.handlePreUpdateImpl()
    if (PolicyPeriod.Job.AccountSyncingIsDateAware) {
      if (IsFutureChangeEvent) {
        createPendingUpdate()
      } else if (IsPastChangeEvent and IsEditEffectiveDateChangeEvent) {
        createActivity()
      }
    }
  }
  
  /**
   * Creates a pending update for a future-dated account-level entity change.
   */
  protected function createPendingUpdate(){
    var changedFields = _accountSyncable.AccountSyncedFields.whereTypeIs(DateAwareAccountSyncedField).where(\ field -> hasFieldChanged(field))
    if (not changedFields.Empty){
      var pendingUpdates = new ArrayList<PendingUpdate & KeyableBean>()
      for (field in changedFields){
        var pendingUpdate = pendingUpdates.where(\p -> typeof p == field.PendingUpdateType).first()
        if (pendingUpdate == null){
          pendingUpdate = createUpdateForField(field)
          pendingUpdates.add(pendingUpdate)
        }
        var value = field.getPolicyEntityFieldValue(_accountSyncable)
        pendingUpdate.setFieldValue(field.PendingUpdateFieldName, value)
        pendingUpdate.setFieldValue(field.PendingUpdateFieldIsNullName, value == null)
      }
    }
  }
  
  protected function hasFieldChanged(field : AccountSyncedField) : boolean {
    return field.isPolicyEntityFieldChanged(_accountSyncable)
  }
  
  /**
   * Create an unpopulated {@link PendingUpdate} corresponding to the given field entity.
   */
  abstract function createUpdateForField(field : DateAwareAccountSyncedField) : PendingUpdate & KeyableBean

  /**
   * Gets the AccountContact to assign the activity to.
   */
  abstract protected property get AccountContactForActivity() : AccountContact

  /**
   * Creates an activity indicating which account-synced fields have been updated in a past-dated job,
   * so a user may choose to manually apply those changes to the corresponding account-level entities.
   */
  protected function createActivity() {
    var changedFields = _accountSyncable.AccountSyncedFields.where(\ field -> field.isPolicyEntityFieldChanged(_accountSyncable))
    if (not changedFields.Empty) {
      var accountContact = AccountContactForActivity
      var activityPattern = ActivityPattern.finder.getActivityPatternByCode("general_reminder")
      var activity = activityPattern.createPolicyActivity(PolicyPeriod.Bundle, PolicyPeriod.Policy,
        displaykey.Web.Contact.Activity.UpdateContactInformation.SubjectText(accountContact.Contact),
        displaykey.Web.Contact.Activity.UpdateContactInformation.Description(accountContact.Contact),
        null, Priority.TC_HIGH, null, null, null)
      activity.AccountContact = accountContact
      var note = activity.newNote()
      note.Subject = displaykey.Web.Contact.Activity.UpdateContactInformation.Note.SubjectText(accountContact.Contact)
      note.Body = changedFields.map(\ field -> getChangedFieldMessage(field)).join("\n")
      activity.assignUserAndDefaultGroup(User.util.CurrentUser)
    }
  }
  
  internal function getChangedFieldMessage(changedField : AccountSyncedField<AccountSyncable, Object>) : String {
    var keyableBean = _accountSyncable as KeyableBean
    var type = (typeof _accountSyncable) as IEntityType
    var typeInfo = type.TypeInfo
    return getChangedFieldMessage(DisplayKeyResolver.getInstance().getPropertyDisplayName(type, typeInfo.getProperty(changedField.PolicyEntityFieldName) as IEntityPropertyInfo),
      typeInfo.DisplayName,
      keyableBean.getOriginalValue(changedField.PolicyEntityFieldName),
      keyableBean.getFieldValue(changedField.PolicyEntityFieldName))
  }
  
  internal static function getChangedFieldMessage(fieldDisplayName : String, entityTypeDisplayName : String, originalValue : Object, newValue : Object) : String {
    if (originalValue == null and newValue == null) {
      throw new IllegalArgumentException("Should not call getChangedFieldMessage if both the original value and the new value are null.")
    } else if (originalValue == null) {
      return displaykey.Web.Contact.Activity.UpdateContactInformation.SetField(fieldDisplayName, entityTypeDisplayName, newValue)
    } else if (newValue == null) {
      return displaykey.Web.Contact.Activity.UpdateContactInformation.RemoveField(fieldDisplayName, entityTypeDisplayName, originalValue)
    } else {
      return displaykey.Web.Contact.Activity.UpdateContactInformation.ChangeField(fieldDisplayName, entityTypeDisplayName, originalValue, newValue)
    }
  }

}
