package gw.reinsurance.risk
uses gw.api.reinsurance.MergeableAdapter

@Export
class RIRiskMergeableAdapter extends AbstractMergeableAdapter<RIRisk>{

  construct(owner : RIRisk) {
    super(owner)
  }

  override function getValuesToCompare(owner : RIRisk) : Object[] {
    return {owner.GrossRetention,
            owner.LossDateAttachmentProgram,
            owner.ProbableMaxLossPct, 
            owner.ProbableMaxLossReason, 
            owner.PolicyAttachments, 
            owner.LocationRiskGroup,
            owner.TotalInsuredValue}
  }

  override function getIds(owner : RIRisk) : Object[] {
    return {owner.VersionList.RiskNumber}
  }

  override function copyFromPreviousTerm(previousTerm : MergeableAdapter) {
    var casted = previousTerm as RIRisk
    _owner.ProbableMaxLossPct = casted.ProbableMaxLossPct
    _owner.ProbableMaxLossReason = casted.ProbableMaxLossReason
    _owner.LocationRiskGroup = casted.LocationRiskGroup
    _owner.GrossRetention = casted.GrossRetention
    _owner.PolicyAttachmentProgram = casted.PolicyAttachmentProgram
    _owner.LossDateAttachmentProgram = casted.LossDateAttachmentProgram
  }
}
