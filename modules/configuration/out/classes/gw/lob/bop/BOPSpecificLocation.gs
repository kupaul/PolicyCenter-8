package gw.lob.bop

uses gw.lob.common.LineSpecificLocationBase
uses gw.api.domain.LineSpecificBuilding
uses gw.api.domain.LineSpecificLocation

/**
 * {@link LineSpecificLocation} for the Businessowners line of business.
 */
@Export
class BOPSpecificLocation extends LineSpecificLocationBase<BOPBuilding> {
  var _bopLocation : BOPLocation

  construct(bopLocation : BOPLocation) {
    _bopLocation = bopLocation
  }

  override property get LineSpecificBuildings() : LineSpecificBuilding[] {
    return _bopLocation.Buildings
  }

  override property get PolicyLocation() : PolicyLocation {
    return _bopLocation.Location
  }

  override property set PolicyLocation(location : PolicyLocation) {
    _bopLocation.Location = location
  }

  override function addToLineSpecificBuildings(bopBuilding : LineSpecificBuilding) {
    _bopLocation.addToBuildings(bopBuilding as BOPBuilding)
  }

  override function removeFromLineSpecificBuildings(bopBuilding : LineSpecificBuilding) {
    var castBopBuilding = bopBuilding as BOPBuilding
    var building = castBopBuilding.Building
    PolicyLocation.removeBuilding(building)
    _bopLocation.removeFromBuildings(castBopBuilding)
  }

  override property get Period() : PolicyPeriod {
    return _bopLocation.Branch
  }

  override function addToLineSpecificBuildings(building : Building) : LineSpecificBuilding {
    var bopBuilding = super.addToLineSpecificBuildings(building)
    (bopBuilding as BOPBuilding).createCoveragesConditionsAndExclusions()
    return bopBuilding
  }

  override property get TerritoryCode() : TerritoryCode {
    return _bopLocation.Location.TerritoryCodes.firstWhere(\ t -> t.PolicyLinePatternCode == _bopLocation.BOPLine.Pattern.Code)
  }

}
