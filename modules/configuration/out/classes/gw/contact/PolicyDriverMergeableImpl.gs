package gw.contact

@Export
class PolicyDriverMergeableImpl extends PolicyContactRoleMergeableImpl {
  construct(mergeable : PolicyDriver) {
    super(mergeable)
  }

  override function performMerge(merged : PolicyContactRole) {
    super.performMerge(merged)

    mergeChildren(Survivor, merged,
            \ polDriver -> (polDriver as PolicyDriver).VehicleDrivers,
            \ vehDriver, polDriver -> {
              vehDriver.setFieldValueForChunk("PolicyDriver", polDriver,
                      vehDriver.SliceDate, vehDriver.getNextEventDate(vehDriver.SliceDate))
            })
  }
}