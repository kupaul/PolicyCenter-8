package gw.contact

@Export
class PolicyNamedInsuredMergeableImpl extends PolicyContactRoleMergeableImpl {
  construct(mergeable : PolicyNamedInsured) {
    super(mergeable)
  }

  override function performMerge(merged : PolicyContactRole) {
    super.performMerge(merged)

    mergeChildren(Survivor, merged,
            \ polNI -> (polNI as PolicyNamedInsured).LocationNamedInsureds,
            \ locNI, polNI -> {
              locNI.setFieldValueForChunk("NamedInsured", polNI,
                                          locNI.SliceDate, locNI.getNextEventDate(locNI.SliceDate))
            })
  }
}