package gw.lob.cp.rating

uses gw.financials.PolicyPeriodFXRateCache

@Export
class CPBuildingCovGroup1CostData extends CPBuildingCovCostData<CPBuildingCovGrp1Cost>
{
  construct(effDate : DateTime, expDate : DateTime, covID : Key, stateArg : Jurisdiction) {
    super(effDate, expDate, covID, stateArg)
  }

  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache, covID : Key, stateArg : Jurisdiction) {
    super(effDate, expDate, c, rateCache, covID, stateArg)
  }

  construct(cost : CPBuildingCovGrp1Cost) {
    super(cost)
  }

  construct(cost : CPBuildingCovGrp1Cost, rateCache : PolicyPeriodFXRateCache) {
    super(cost, rateCache)
  }

  override function setSpecificFieldsOnCost(line : CommercialPropertyLine, cost : CPBuildingCovGrp1Cost) {
    super.setSpecificFieldsOnCost(line, cost)
  }

  override function toString() : String {
    return super.toString() + " Coverage : Group I"  // no need for i18n
  }
}
