package gw.contact

uses java.lang.IllegalStateException

/**
 * An implementation of the {@link Mergeable} that throws an {@link IllegalStateException}
 * when called because it is not possible to merge a singleton role (a role that cannot
 * exist more than once on a policy)
 */
@Export
class SingletonPolicyContactRoleMergeableImpl  extends PolicyContactRoleMergeableImpl {
  construct(mergeable : PolicyContactRole ) {
    super(mergeable)
  }

  override function checkSanity(merged : PolicyContactRole) {
    throw new IllegalStateException(displaykey.Merge.Error.SingletonRole(typeof Survivor))
  }

  override function performMerge(merged : PolicyContactRole) {
    throw new IllegalStateException(displaykey.Merge.Error.SingletonRole(typeof Survivor))
  }
}
