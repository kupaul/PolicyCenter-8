package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.util.ArrayList

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCRiskUnit
{
  var _classCode : CCClassCode as ClassCode
  var _ruNumber : int as RUNumber
  var _PolicySystemID : String as PolicySystemID
  var _coverages = new ArrayList<CCRUCoverage>()
  var _desc : String as Description

  construct()
  {
  }

  property get Coverages() : CCRUCoverage[]
  {
    return _coverages as CCRUCoverage[]
  }

  function addToCoverages(ruCoverage : CCRUCoverage) : void
  {
    _coverages.add(ruCoverage)
  }

}
