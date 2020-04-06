package gw.lob.cp.rating

uses gw.financials.PolicyPeriodFXRateCache

@Export
class CPStateTaxCostData extends CPCostData<CPStateTaxCost>
{
  private var _state : Jurisdiction as State
  
  construct(effDate : DateTime, expDate : DateTime, stateArg : Jurisdiction) {
    super(effDate, expDate)
    _state = stateArg
    RateAmountType = "TaxSurcharge"
    ChargePattern = "Taxes"
  }

  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache, stateArg : Jurisdiction) {
    super(effDate, expDate, c, rateCache)
    _state = stateArg
    RateAmountType = "TaxSurcharge"
    ChargePattern = "Taxes"
  }

  override function toString() : String {
    return _state.DisplayName + " State Tax"  // no need for i18n
  }

  override property get KeyValues() : List<Object> {
    return {_state}  
  }

  override function getVersionedCosts( line: CommercialPropertyLine ) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    return line.VersionList.CPCosts.where(\c -> {
      var firstVersion = c.AllVersions.first()
      return firstVersion typeis CPStateTaxCost and firstVersion.State == State
    }).toList()
  }

  override function setSpecificFieldsOnCost( line: CommercialPropertyLine, cost: CPStateTaxCost ) : void {
    super.setSpecificFieldsOnCost(line, cost)
    cost.TaxState = State
  }

}
