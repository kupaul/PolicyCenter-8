package gw.contact

@Export
class WCLaborContactMergeableImpl extends PolicyContactRoleMergeableImpl {
  construct(mergeable : WCLaborContact) {
    super(mergeable)
  }

  override function performMerge(merged : PolicyContactRole) {
    super.performMerge(merged)

    mergeChildren(Survivor, merged,
            \ laborContact -> (laborContact as WCLaborContact).Details,
            \ detail, laborContact -> {
              detail.setFieldValueForChunk("WCLaborContact", laborContact,
                      detail.SliceDate, detail.getNextEventDate(detail.SliceDate))
            })
  }
}