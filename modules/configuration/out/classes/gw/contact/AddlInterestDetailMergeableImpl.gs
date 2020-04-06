package gw.contact

uses gw.account.AbstractEffDatedMergeableImpl

@Export
class AddlInterestDetailMergeableImpl<T extends AddlInterestDetail> extends AbstractEffDatedMergeableImpl<T> {
  construct(mergeable : T) {
    super(mergeable)
  }

  override function mergeFields(merged : T) : boolean {
    var nextEventDate = Survivor.getNextEventDate(Survivor.SliceDate)
    Survivor.setFieldValueForChunk("CertRequired",
                                   Survivor.CertRequired or merged.CertRequired,
                                   Survivor.SliceDate, nextEventDate)
    return true
  }
}