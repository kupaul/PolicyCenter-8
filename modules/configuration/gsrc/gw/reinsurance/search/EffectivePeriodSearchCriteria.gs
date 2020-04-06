package gw.reinsurance.search

uses gw.api.database.Query
uses gw.api.database.Relop
uses java.io.Serializable
uses java.util.Date
uses gw.api.util.DateUtil

@Export
class EffectivePeriodSearchCriteria implements Serializable {
  
  var _periodType : ContractEffectivePeriod
  var _from : Date as From
  var _to : Date as To
  
  construct() {
    PeriodType = TC_COMINGYEAR
  }
  
  property get PeriodType() : ContractEffectivePeriod {
    return _periodType
  }

  property set PeriodType(value : ContractEffectivePeriod) {
    _periodType = value
    switch(PeriodType) {
      case TC_COMINGYEAR: 
        From = Date.Today
        To = Date.Today.addYears(1).addDays(-1)
        break
      case TC_LASTYEAR: 
        From = Date.Today.addYears(-1)
        To = Date.Yesterday
        break
      default:
        From = null
        To = null 
        break
    }
  }

  function addSearchCriteria(q : Query ) {
    if (From <> null) {
      q.compare("EffectiveDate", Relop.GreaterThanOrEquals, From)
    }
    if (To <> null) {
      q.compare("EffectiveDate", Relop.LessThanOrEquals, DateUtil.endOfDay(To))
    }
  }
}
