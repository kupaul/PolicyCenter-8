package gw.contact

/**
 * Concrete implementation that handles PolicyContactRoles's account syncing behavior.
 */
@Export
class PolicyContactRoleAccountSyncableImpl extends AbstractPolicyContactRoleAccountSyncableImpl<PolicyContactRole> {
 
  construct(accountSyncable : PolicyContactRole) {
    super(accountSyncable)
  }

}
