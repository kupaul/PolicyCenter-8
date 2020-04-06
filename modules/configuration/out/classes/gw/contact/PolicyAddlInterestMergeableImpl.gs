package gw.contact

@Export
class PolicyAddlInterestMergeableImpl extends PolicyContactRoleMergeableImpl {
  construct(mergeable : PolicyAddlInterest) {
    super(mergeable)
  }

  override function performMerge(merged : PolicyContactRole) {
    super.performMerge(merged)

    // a PolicyAddlInterest has children which are AdditionalInterestDetail subtypes
    mergeChildren(Survivor, merged,
            \ parent -> (parent as PolicyAddlInterest).AdditionalInterestDetails,
            \ child, parent -> {
              child.setFieldValueForChunk("PolicyAddlInterest", parent,
                            child.SliceDate, child.getNextEventDate(child.SliceDate))
            })
  }
}