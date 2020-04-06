package gw.lob.common

@Export
class DefaultSegmentEvaluator extends AbstractSegmentEvaluator {

  construct(policyPeriod : PolicyPeriod) {
    super(policyPeriod)
  }

  override property get IsHighRisk() : boolean {
    return _policyPeriod.PreQualRiskPointSum > 500
  }

   override property get IsMediumRisk() : boolean {
     return _policyPeriod.PreQualRiskPointSum > 200 and _policyPeriod.PreQualRiskPointSum <= 500
   }

}
