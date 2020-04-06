package gw.lob.common

@Export
abstract class AbstractSegmentEvaluator implements SegmentEvaluator {

  protected var _policyPeriod : PolicyPeriod
  
  construct(policyPeriod : PolicyPeriod) {
    _policyPeriod = policyPeriod
  }

  override property get IsHighRisk() : boolean {
    return false
  }

  override property get IsMediumRisk() : boolean {
    return false
  }
  
}
