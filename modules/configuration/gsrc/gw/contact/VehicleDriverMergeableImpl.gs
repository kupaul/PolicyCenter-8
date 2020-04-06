package gw.contact

uses gw.account.AbstractEffDatedMergeableImpl

@Export
class VehicleDriverMergeableImpl extends AbstractEffDatedMergeableImpl<VehicleDriver> {
  construct(mergeable : VehicleDriver) {
    super(mergeable)
  }

  override function mergeFields(merged : VehicleDriver) : boolean {
    var sliceDate = Survivor.SliceDate
    var nextEventDate = Survivor.getNextEventDate(sliceDate)

    Survivor.setFieldValueForChunk("PercentageDriven",
            Survivor.PercentageDriven + merged.PercentageDriven,
            sliceDate, nextEventDate)

    // We always return true here because we assume this will only ever be called from
    // a parent PolicyDriver's mergeable implementation.  Thus, the checks to ensure
    // the branch isn't bound / quote invalidation have already run by the time this
    // will get called.
    return true
  }
}
