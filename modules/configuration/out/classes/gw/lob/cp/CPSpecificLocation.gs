package gw.lob.cp

uses gw.lob.common.LineSpecificLocationBase
uses gw.api.domain.LineSpecificBuilding
uses gw.api.domain.LineSpecificLocation

/**
 * {@link LineSpecificLocation} for the Commercial Property line of business.
 */
@Export
class CPSpecificLocation extends LineSpecificLocationBase<CPBuilding> {
  var _cpLocation : CPLocation

  construct(cpLocation : CPLocation) {
    _cpLocation = cpLocation
  }

  override property get LineSpecificBuildings() : LineSpecificBuilding[] {
    return _cpLocation.Buildings
  }

  override property get PolicyLocation() : PolicyLocation {
    return _cpLocation.Location
  }

  override property set PolicyLocation(location : PolicyLocation) {
    _cpLocation.Location = location
  }

  override function addToLineSpecificBuildings(cpBuilding : LineSpecificBuilding) {
    _cpLocation.addToBuildings(cpBuilding as CPBuilding)
  }

  override function removeFromLineSpecificBuildings(cpBuilding : LineSpecificBuilding) {
    var castCPBuilding = cpBuilding as CPBuilding
    if (castCPBuilding.CurrentCPBlankets.HasElements) {
      throw new gw.api.util.DisplayableException(displaykey.Web.Policy.CP.Location.Building.CannotRemoveBuildingWithBlanket)
    }
    _cpLocation.removeFromBuildings(castCPBuilding)
  }

  override property get Period() : PolicyPeriod {
    return _cpLocation.Branch
  }

  override function addToLineSpecificBuildings(building : Building) : LineSpecificBuilding {
    var cpBuilding = super.addToLineSpecificBuildings(building)
    (cpBuilding as CPBuilding).createCoveragesConditionsAndExclusions()
    return cpBuilding
  }

  override property get TerritoryCode() : TerritoryCode {
    return _cpLocation.Location.TerritoryCodes.firstWhere(\ t -> t.PolicyLinePatternCode == _cpLocation.CPLine.PatternCode)
  }

}
