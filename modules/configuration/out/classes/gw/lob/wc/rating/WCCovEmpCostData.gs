package gw.lob.wc.rating
uses java.util.Date
uses gw.api.effdate.EffDatedUtil
uses entity.windowed.WCCoveredEmployeeVersionList
uses gw.financials.PolicyPeriodFXRateCache

@Export
class WCCovEmpCostData extends WCCostData<WCCovEmpCost> {
  private var _empID : Key as readonly EmpID
  private var _covID : Key
  private var _state : Jurisdiction as readonly State

  construct(effDate : Date, expDate : Date, empIDArg : Key, covID : Key, stateArg : Jurisdiction) {
    super(effDate, expDate)
    assertKeyType(empIDArg, WCCoveredEmployee)
    assertKeyType(covID, WorkersCompCov)
    init(empIDArg, covID, stateArg)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, empIDArg : Key, covID : Key, stateArg : Jurisdiction) {
    super(effDate, expDate, c, rateCache)
    assertKeyType(empIDArg, WCCoveredEmployee)
    assertKeyType(covID, WorkersCompCov)
    init(empIDArg, covID, stateArg)
  }

  private function init(empIDArg : Key, covID : Key, stateArg : Jurisdiction) {
    _empID = empIDArg
    _covID = covID
    _state = stateArg 
  }

  override function setSpecificFieldsOnCost(line : WorkersCompLine, cost : WCCovEmpCost) {
    super.setSpecificFieldsOnCost( line, cost )
    cost.setFieldValue("WCCoveredEmployee", _empID)
    cost.setFieldValue("WorkersCompCov", _covID)
    cost.CalcOrder = 0           // Order isn't important for manual rates
  }

  override function getVersionedCosts(line : WorkersCompLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    var empVL = EffDatedUtil.createVersionList( line.Branch, _empID ) as WCCoveredEmployeeVersionList
    return empVL.Costs
  }

  override property get KeyValues() : List<Object> {
    return {_empID}  
  }
}
