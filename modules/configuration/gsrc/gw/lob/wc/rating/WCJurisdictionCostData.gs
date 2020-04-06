package gw.lob.wc.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.WCJurisdictionVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
class WCJurisdictionCostData extends WCCostData<WCJurisdictionCost> {
  
  private var _step : WCRatingStepExt as Step 
  private var _jurisdictionID : Key
  private var _state : Jurisdiction as readonly State

  construct(effDate : Date, expDate : Date, jurisdictionID : Key, stateArg : Jurisdiction, stepArg : WCRatingStepExt) {
    super(effDate, expDate)  
    assertKeyType(jurisdictionID, WCJurisdiction)
    init(jurisdictionID, stateArg, stepArg)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, jurisdictionID : Key, stateArg : Jurisdiction, stepArg : WCRatingStepExt) {
    super(effDate, expDate, c, rateCache)
    assertKeyType(jurisdictionID, WCJurisdiction)
    init(jurisdictionID, stateArg, stepArg)
  }

  private function init(jurisdictionID : Key, stateArg : Jurisdiction, stepArg : WCRatingStepExt) {
    _jurisdictionID = jurisdictionID
    _state = stateArg
    _step = stepArg
    RateAmountType = _step.amountType
  }

  override function setSpecificFieldsOnCost(line : WorkersCompLine, cost : WCJurisdictionCost) {
    super.setSpecificFieldsOnCost( line, cost )
    cost = cost.Unsliced
    cost.setFieldValue("WCJurisdiction", _jurisdictionID)
    cost.WCJurisdictionCostType = _step.aggCostType
    cost.CalcOrder      = _step.calcOrder
    // try to set ChargePattern to match RateAmountType for billing integration
    cost.ChargePattern  = (_step.amountType == typekey.RateAmountType.TC_TAXSURCHARGE ? 
        "Taxes" as ChargePattern : "Premium" as ChargePattern)
    cost.StatCode       = Step.classcode
  }

  override function getVersionedCosts(line : WorkersCompLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var jurisdictionVL = EffDatedUtil.createVersionList( line.Branch, _jurisdictionID ) as WCJurisdictionVersionList
    return jurisdictionVL.Costs.where( \ costVL -> matchesStep(costVL.AllVersions.first())).toList()
  }

  private function matchesStep(cost : WCJurisdictionCost) : boolean {
    return cost.WCJurisdictionCostType == _step.aggCostType &&
           cost.CalcOrder == _step.calcOrder &&
           cost.RateAmountType == _step.amountType &&
           cost.StatCode == _step.classcode  
  }
  
  override property get KeyValues() : List<Object> {
    return {_step, _jurisdictionID}  
  }
}
