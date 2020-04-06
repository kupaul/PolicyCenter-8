package gw.lob.cp

uses gw.api.domain.LineSpecificBuilding

/**
 * {@link LineSpecificBuilding} for the Commercial Property line of business.
 */
@Export
class CPSpecificBuilding implements LineSpecificBuilding {
  var _cpBuilding : CPBuilding
  
  construct(cpBuilding : CPBuilding) {
    _cpBuilding = cpBuilding
  }
  
  override property get LocationBuilding() : Building {
    return _cpBuilding.Building
  }

  override property set LocationBuilding(building : Building) {
    _cpBuilding.Building = building
  }
}
