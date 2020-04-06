package gw.account

uses java.lang.IllegalArgumentException

@Export
class AccountContactMergeableImpl extends AbstractMergeableImpl<AccountContact> {
  construct(mergeable : AccountContact) {
    super(mergeable)
  }

  override function checkSanity(merged : AccountContact) {
    if (!Survivor.ContactType.equals(merged.ContactType)) {
      throw new IllegalArgumentException(displaykey.Java.AccountContact.Error.MergedAccountContactNotSameContactType(merged,
              merged.ContactType, Survivor, Survivor.ContactType))
    }
  }

  /**
   * Merges this AccountContact with the passed in account contact.  The passed in contact is considered to be the
   * "merged" contact, while this AccountContact is the survivor.  After the merge:
   * <ul>
   *  <li>If the <code>merged</code> account contact was the AccountHolder, this AccountContact will be the AccountHolder and Active</li>
   *  <li>All {@link AccountContactRole}s from the <code>merged</code> account contact without a corresponding role on this AccountContact
   * will be moved to this AccountContact</li>
   *  <li>Any {@link PolicyContactRole} pointing to an AccountContactRole on the
   * <code>merged</code> account contact that has a duplicate on this AccountContact will be re-linked to the role on this AccountContact
   * and merged</li>
   *  <li>The <code>merged</code> account contact will be removed (deleted)</li>
   * </ul>
   *
   * @param merged the AccountContact to merge into this AccountContact
   */
  override function mergeFields(merged : AccountContact) : boolean {
    // if the merged account contact was the AccountHolder, make sure the survivor is Active
    if (merged.hasRole(TC_ACCOUNTHOLDER)) {
      Survivor.Active = true
    }

    mergeChildren(Survivor, merged,
            \ parent -> parent.Roles,
            \ child, parent -> {child.AccountContact = parent})
    return true
  }
}