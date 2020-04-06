package gw.webservice.pc.pc700.ccintegration.ccentities
uses java.util.ArrayList

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCLocationBasedRU extends CCRiskUnit
{
  var _building : CCBuilding as Building
  var _policyLocation : CCPolicyLocation as PolicyLocation
  var _lienholders = new ArrayList<CCPropertyOwner>()

  construct()
  {
  }

  property get Lienholders() : CCPropertyOwner[]
  {
    return _lienholders as CCPropertyOwner[]
  }

  function addToLienholders(lienholder : CCPropertyOwner) : void
  {
    _lienholders.add(lienholder)
  }

}
