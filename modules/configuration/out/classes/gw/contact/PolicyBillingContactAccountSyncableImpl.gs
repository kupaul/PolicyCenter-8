package gw.contact

/**
 * Implementation that handles PolicyBillingContact's account syncing behavior.
 */
@Export
class PolicyBillingContactAccountSyncableImpl extends AbstractPolicyContactRoleAccountSyncableImpl<PolicyBillingContact> {

  construct(accountSyncable : PolicyBillingContact) {
    super(accountSyncable)
  }

  /**
   * PolicyBillingContact is editable when the policy period status not in a Closing
   * or Closed typefilter state.  This also returns true if the policy period status is
   * null, which we assume means the job is newly created.
   */
  override protected property get InEditablePolicyPeriodStatus() : boolean {
    return not ClosingOrClosedPolicyPeriodStatuses.contains(PolicyPeriod.Status)
  }

  /**
   * Unlike other PolicyContactRoles, PolicyBillingContact remains synced during quoting and
   * thus doesn't need to do anything.
   */
  override protected function prepareForQuoteImpl() {
    // do nothing
  }

  /**
   * Unlike other PolicyContactRoles, PolicyBillingContact finally unsyncs at binding
   * and should copy down at that point.
   */
  override protected function prepareForPromoteImpl() {
    if (WithinUpdateTimeWindow and SyncedToAccount) {
      copyPolicyContractData()
    }
  }

}
