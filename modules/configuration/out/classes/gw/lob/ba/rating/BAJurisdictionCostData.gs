package gw.lob.ba.rating
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.BAJurisdictionVersionList
uses java.util.Date
uses gw.financials.PolicyPeriodFXRateCache

@Export
/**
* This Cost Data is only used for State taxes and Short rate cancel premiums
*/
class BAJurisdictionCostData extends BACostData<BAJurisdictionCost> {
  
  protected var _jurisdiction : BAJurisdiction
  protected var _costType : BAJurisdictionCostType
  
  construct(effDate : Date, expDate : Date, ratedOrderArg : BARatedOrderType, jurisdiction : BAJurisdiction, costTypeArg : BAJurisdictionCostType, rateAmountTypeArg : RateAmountType, chargePatternArg : ChargePattern) {
    super(effDate, expDate, ratedOrderArg, jurisdiction, null)
    init(jurisdiction, costTypeArg, rateAmountTypeArg, chargePatternArg)
  }
  
  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, ratedOrderArg : BARatedOrderType, jurisdiction : BAJurisdiction, costTypeArg : BAJurisdictionCostType, rateAmountTypeArg : RateAmountType, chargePatternArg : ChargePattern) {
    super(effDate, expDate, c, rateCache, ratedOrderArg, jurisdiction, null)
    init(jurisdiction, costTypeArg, rateAmountTypeArg, chargePatternArg)
  }
  
  private function init(jurisdiction : BAJurisdiction, costTypeArg : BAJurisdictionCostType, rateAmountTypeArg : RateAmountType, chargePatternArg : ChargePattern) {
    _jurisdiction = jurisdiction
    _costType = costTypeArg
    RateAmountType = rateAmountTypeArg
    ChargePattern = chargePatternArg
}

  override function setSpecificFieldsOnCost(line : BusinessAutoLine, cost : BAJurisdictionCost) {
    super.setSpecificFieldsOnCost( line, cost )
    cost.BAJurisdictionCostType = _costType
  }

  override function getVersionedCosts(line : BusinessAutoLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var jurisdictionVL = EffDatedUtil.createVersionList( line.Branch, _jurisdiction.FixedId ) as BAJurisdictionVersionList
    return jurisdictionVL.Costs.where( \ vl -> vl.AllVersions.first().BAJurisdictionCostType == _costType ).toList()
  }

  protected override property get KeyValues() : List<Object> {
    return {_jurisdiction, _costType}
  }

}
