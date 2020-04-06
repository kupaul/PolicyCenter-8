package gw.lob.im

uses gw.lob.common.LineSpecificLocationBase
uses gw.api.domain.LineSpecificBuilding
uses gw.api.domain.LineSpecificLocation

/**
 * {@link LineSpecificLocation} for the Inland Marine line of business.
 */
@Export
class IMSpecificLocation extends LineSpecificLocationBase<IMBuilding> {
  var _imLocation : IMLocation

  construct(imLocation : IMLocation) {
    _imLocation = imLocation
  }

  override property get LineSpecificBuildings() : LineSpecificBuilding[] {
    return _imLocation.Buildings
  }

  override property get PolicyLocation() : PolicyLocation {
    return _imLocation.Location
  }

  override property set PolicyLocation(location : PolicyLocation) {
    _imLocation.Location = location
  }

  override function addToLineSpecificBuildings(imBuilding : LineSpecificBuilding) {
    _imLocation.addToBuildings(imBuilding as IMBuilding)
  }

  override function removeFromLineSpecificBuildings(imBuilding : LineSpecificBuilding) {
    //cascade deletion of AccountReceivables that reference deleted IMBuilding
    var accPart = this.Period.IMLine.IMAccountsRecPart
    if( accPart.IMAccountsReceivables != null) {
      var arToDelete = accPart.IMAccountsReceivables.where(\ ar -> ar.IMBuilding.FixedId == (imBuilding as IMBuilding).FixedId)
      arToDelete.each(\ ar -> accPart.removeIMAccountsRecAndCoverage( ar ))
    }
    _imLocation.removeFromBuildings(imBuilding as IMBuilding)
  }

  override property get Period() : PolicyPeriod {
    return _imLocation.Branch
  }

  override property get TerritoryCode() : TerritoryCode {
    return _imLocation.Location.TerritoryCodes.firstWhere(\ t -> t.PolicyLinePatternCode == _imLocation.IMLine.Pattern.Code)
  }

}
