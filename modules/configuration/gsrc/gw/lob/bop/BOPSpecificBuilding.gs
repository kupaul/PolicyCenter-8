package gw.lob.bop

uses gw.api.domain.LineSpecificBuilding

/**
 * {@link LineSpecificBuilding} for the Businessowners line of business.
 */
@Export
class BOPSpecificBuilding implements LineSpecificBuilding {
  var _bopBuilding : BOPBuilding
  
  construct(bopBuilding : BOPBuilding) {
    _bopBuilding = bopBuilding
  }
  
  override property get LocationBuilding() : Building {
    return _bopBuilding.Building
  }

  override property set LocationBuilding(building : Building) {
    _bopBuilding.Building = building
  }
}
