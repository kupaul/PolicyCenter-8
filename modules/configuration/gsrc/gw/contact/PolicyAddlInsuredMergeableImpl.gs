package gw.contact

@Export
class PolicyAddlInsuredMergeableImpl extends PolicyContactRoleMergeableImpl {
  construct(mergeable : PolicyAddlInsured) {
    super(mergeable)
  }

  override function performMerge(merged : PolicyContactRole) {
    super.performMerge(merged)

    // PolicyAddlInsuredDetail will be merged based on type
    mergeChildren(Survivor, merged,
            \ parent -> (parent as PolicyAddlInsured).PolicyAdditionalInsuredDetails, 
            \ child, parent -> {
              child.setFieldValueForChunk("PolicyAddlInsured", parent,
                                          child.SliceDate, child.getNextEventDate(child.SliceDate))
            })

    // costs will not be merged.
    // this is OK because the quote is invalidated; they should be cleared
    // and properly regenerated when the quote is reissued
  }
}
