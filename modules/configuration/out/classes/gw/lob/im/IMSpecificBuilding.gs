package gw.lob.im

uses gw.api.domain.LineSpecificBuilding

/**
 * {@link LineSpecificBuilding} for the Inland Marine line of business.
 */
@Export
class IMSpecificBuilding implements LineSpecificBuilding {
  var _imBuilding : IMBuilding
  
  construct(imBuilding : IMBuilding) {
    _imBuilding = imBuilding
  }
  
  override property get LocationBuilding() : Building {
    return _imBuilding.Building
  }

  override property set LocationBuilding(building : Building) {
    _imBuilding.Building = building
  }
}
