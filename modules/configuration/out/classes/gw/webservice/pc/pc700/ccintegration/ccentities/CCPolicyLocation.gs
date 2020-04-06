package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.util.ArrayList

@gw.xml.ws.annotation.WsiExportable( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/ccintegration/ccentities/CCPolicyLocation" )
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
final class CCPolicyLocation
{
  var _PolicySystemID : String as PolicySystemID
  var _address : CCAddress as Address
  var _locationNumber : String as LocationNumber
  var _notes : String as Notes
  var _primaryLocation : boolean as PrimaryLocation

  var _highValueItems = new ArrayList<CCPropertyItem>()
  var _lienholders = new ArrayList<CCPropertyOwner>()
  var _buildings = new ArrayList<CCBuilding>()

  construct()
  {
  }

  property get HighValueItems() : CCPropertyItem[]
  {
    return _highValueItems as CCPropertyItem[]
  }

  function addToHighValueItems(highValueItem : CCPropertyItem) : void
  {
    _highValueItems.add(highValueItem)
  }

  property get Lienholders() : CCPropertyOwner[]
  {
    return _lienholders as CCPropertyOwner[]
  }

  function addToLienholders(lienholder : CCPropertyOwner) : void
  {
    _lienholders.add(lienholder)
  }

  property get Buildings() : CCBuilding[]
  {
    return _buildings as CCBuilding[]
  }

  function addToBuildings(building : CCBuilding) : void
  {
    _buildings.add(building)
  }
}
