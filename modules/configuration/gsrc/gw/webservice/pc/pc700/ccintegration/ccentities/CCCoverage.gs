package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.util.ArrayList
uses java.util.Date
uses gw.api.financials.CurrencyAmount

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCCoverage {

  var _PolicySystemID : String as PolicySystemID
  var _deductible : CurrencyAmount as Deductible
  var _effDate : Date as EffectiveDate
  var _expDate : Date as ExpirationDate
  var _exposureLimit : CurrencyAmount as ExposureLimit
  var _incidentLimit : CurrencyAmount as IncidentLimit
  var _notes : String as Notes

  // typekeys in CC
  var _limitsIndicator : String as LimitsIndicator
  var _state : String as State
  var _type : String as Type   // CoverageType

  // arrays
  var _covTerms = new ArrayList<CCCovTerm>()

  construct() {
  }

  property get CovTerms() : CCCovTerm[] {
    return _covTerms as CCCovTerm[]
  }

  function addToCovTerms( covTerm : CCCovTerm ) : void {
    _covTerms.add( covTerm )
  }
}
