package gw.reinsurance.risk
uses gw.api.reinsurance.MergeableAdapter

@Export
class RIPolicyAttachmentMergeableAdapter extends AbstractMergeableAdapter<RIPolicyAttachment>{

  construct(owner : RIPolicyAttachment) {
    super(owner)
  }

  override function getValuesToCompare(owner : RIPolicyAttachment) : Object[] {
    return {owner.Agreement.AgreementNumber, owner.Program.Name, owner.InclusionType}
  }

  override function getIds(owner : RIPolicyAttachment) : Object[] {
    return {owner.Agreement}
  }

  override function copyFromPreviousTerm(previousTerm : MergeableAdapter) {
    var casted = previousTerm as RIPolicyAttachment
    var inclusion = casted.InclusionType
    _owner.Agreement.updateInclusion(_owner.Risk, inclusion)
  }

}
