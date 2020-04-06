package gw.lob.wc
uses gw.lob.common.AbstractSegmentEvaluator

@Export
class WC_SegmentEvaluator extends AbstractSegmentEvaluator {

  construct(policyPeriod : PolicyPeriod) {
    super(policyPeriod)
  }

  override property get IsHighRisk() : boolean {
    return _policyPeriod.PrimaryLocation.State == "HI"
  }

}
