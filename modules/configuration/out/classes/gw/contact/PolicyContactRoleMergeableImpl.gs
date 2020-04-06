package gw.contact

uses gw.account.AbstractEffDatedMergeableImpl

@Export
class PolicyContactRoleMergeableImpl extends AbstractEffDatedMergeableImpl<PolicyContactRole> {
  construct(mergeable : PolicyContactRole) {
    super(mergeable)
  }

  override function mergeFields(merged : PolicyContactRole) : boolean {
    if (!merged.Branch.Locked) {
      // If the branch isn't locked but isn't editable, we need to invalidate the quote as part of the merge.
      if (!merged.Branch.OpenForEdit) {
        merged.Branch.markInvalidQuote()
      }

      // Do the actual merge
      performMerge(merged)
      return true
    } else {
      // Unfortunately, the branch is locked, which means we have to leave the duplicate.  In this case, we return
      // false to indicate the merge didn't happen.
      return false
    }
  }

  /**
   * Performs the actual merge work in the case where the policy period is not yet bound.
   *
   * @param merged Policy contact role to merge into the survivor.
   */
  function performMerge(merged : PolicyContactRole) {
    // Nothing to do for most PolicyContactRoles.
  }
}