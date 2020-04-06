package gw.api.domain.account
uses java.lang.IllegalStateException
uses gw.plugin.Plugins
uses gw.plugin.account.IAccountSyncablePlugin
uses java.util.Set

/**
 * Base entity-agnostic functionality for account syncables.
 */
@Export
abstract class AbstractAccountSyncableImpl<S extends AccountSyncable> implements AccountSyncable {

  protected var _accountSyncable : S
  
  construct(accountSyncable : S) {
    _accountSyncable = accountSyncable
  }
  
  /**
   * An account syncable is synced if it is on a job that allows account-syncing and in a
   * policy period status in which it can be edited.  If this account syncable is not on a job
   * (e.g., a preempted branch) this also evaluates to false.
   */
  override property get SyncedToAccount() : boolean {
    return PolicyPeriod.Job.AccountSyncingEnabled and InEditablePolicyPeriodStatus
  }
  
  /**
   * Most account syncables are editable when the policy period status is not "Quoting", "Quoted',
   * or in a Closing or Closed typefilter state.  This also returns true if the policy period status is
   * null, which we assume means the job is newly created.
   */
  protected property get InEditablePolicyPeriodStatus() : boolean {
    return not ClosingOrClosedPolicyPeriodStatuses.union({"Quoting", "Quoted"}).contains(PolicyPeriod.Status)
  }
  
  protected property get ClosingOrClosedPolicyPeriodStatuses() : Set<PolicyPeriodStatus> {
    return PolicyPeriodStatus.TF_CLOSED.TypeKeys.union(PolicyPeriodStatus.TF_CLOSING.TypeKeys)
  }

  override property get HasMatchingAccountAndPolicyFields() : boolean {
    return AccountSyncedFields.allMatch(\ field -> field.checkIfAccountAndPolicyEntityFieldValuesMatch(_accountSyncable))
  }

  override property get HasEmptyPolicyEntityFields() : boolean {
    return AccountSyncedFields.allMatch(\ field -> field.getPolicyEntityFieldValue(_accountSyncable) == null)
  }
  
  override property get HasChangedPolicyEntityFields() : boolean {
    return (_accountSyncable as KeyableBean).New or AccountSyncedFields.hasMatch(\ field -> field.isPolicyEntityFieldChanged(_accountSyncable))
  }

  override function assignToSource(source : KeyableBean){
    if (not PolicyPeriod.Locked) {  // merging contacts may reassign an account syncable's source in a locked branch, so skip copying in those cases
      copyPolicyContractDataUnchecked()
    }
  }

  override function prepareForDiff() {
    callMethodIfAccountSyncingEnabledOnJob(\ -> prepareForDiffImpl())
  }

  override function prepareForJobEdit() {
    callMethodIfAccountSyncingEnabledOnJob(\ -> prepareForJobEditImpl())
  }

  override function prepareForJobStart() {
    callMethodIfAccountSyncingEnabledOnJob(\ -> prepareForJobStartImpl())
  }

  override function prepareForOOSMerge() {
    callMethodIfAccountSyncingEnabledOnJob(\ -> prepareForOOSMergeImpl())
  }

  override function prepareForPromote() {
    callMethodIfAccountSyncingEnabledOnJob(\ -> prepareForPromoteImpl())
  }

  override function prepareForQuote() {
    callMethodIfAccountSyncingEnabledOnJob(\ -> prepareForQuoteImpl())
  }

  /**
   * Refresh the account information and then calls the given method()
   * if the account syncable is on a job that has AccountSyncingEnabled
   */
  protected function callMethodIfAccountSyncingEnabledOnJob(method()) {
    if (PolicyPeriod.Job.AccountSyncingEnabled) {
      Plugins.get(IAccountSyncablePlugin).refreshAccountInformation(this)
      method()
    }
  }

  /**
   * Prepare this account syncable so that the diff code can operate correctly on it, if it is on a job that allows account-syncing.
   */
  protected function prepareForDiffImpl() {
    if (SyncedToAccount) {
      copyPolicyContractData()
    }
  }

  /**
   * Prepare this account syncable so that the job edit code can operate correctly on it, if it is on a job that allows account-syncing.
   */
  protected function prepareForJobEditImpl() {
    // nothing by default
  }

  /**
   * Prepare this account syncable so that the job start code can operate correctly on it, if it is on a job that allows account-syncing.
   */
  protected function prepareForJobStartImpl() {
    // nothing by default
  }

  /**
   * Prepare this account syncable so that the OOS merge code can operate correctly on it, if it is on a job that allows account-syncing.
   */
  protected function prepareForOOSMergeImpl() {
    if (SyncedToAccount) {
      copyPolicyContractData()
    }
  }

  /**
   * Prepare this account syncable so that the promote code can operate correctly on it, if it is on a job that allows account-syncing.
   */
  protected function prepareForPromoteImpl() {
    validateAccountAndPolicyEntityFields()
  }

  /**
   * Prepare this account syncable so that the quote code can operate correctly on it, if it is on a job that allows account-syncing.
   */
  protected function prepareForQuoteImpl() {
    if (SyncedToAccount) {
      copyPolicyContractData()
    }
  }

  override function copyPolicyContractData() {
    if (SyncedToAccount) {
      copyPolicyContractDataUnchecked()
    } else {
      throw new IllegalStateException(displaykey.Java.AccountSyncable.UnsyncedCopyContractDataError)
    }
  }

  override function copyPolicyContractDataUnchecked() {
    AccountSyncedFields.each(\ field -> field.copyFromAccountToPolicy(_accountSyncable))
  }

  override function validateAccountAndPolicyEntityFields() {
    if (not HasMatchingAccountAndPolicyFields) {
      handleInvalidAccountAndPolicyEntityFields()
    }
  }
  
  /**
   * The default implementation of validateAccountAndPolicyEntityFields() calls this method
   * when the account and policy fields don't match.  Subclasses must implement this method,
   * typically by throwing a DisplayableException.
   */
  abstract protected function handleInvalidAccountAndPolicyEntityFields()

  /**
   * Handle the pre-update for this account syncable.
   */
  override function handlePreUpdate() {
    callMethodIfAccountSyncingEnabledOnJob(\ -> handlePreUpdateImpl())
  }
  
  /**
   * Handle pre-updates if this account syncable is on a job that allows account-syncing.
   */
  protected function handlePreUpdateImpl() {
    // nothing by default
  }

  protected final property get PolicyPeriod() : PolicyPeriod {
    return (_accountSyncable as EffDated).BranchUntyped as PolicyPeriod
  }

}
