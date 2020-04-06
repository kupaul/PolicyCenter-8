package gw.lob.cp

uses gw.lob.common.LineSpecificLocationContainerBase
uses java.lang.Integer
uses java.util.ArrayList
uses gw.api.domain.LineSpecificLocation

@Export
class CPSpecificLocationContainer extends LineSpecificLocationContainerBase<CPLocation> {
  var _cpLine : CommercialPropertyLine
  
  construct(cpLine : CommercialPropertyLine) {
    super(cpLine)
    _cpLine = cpLine
  }

  override property get LineSpecificLocations() : LineSpecificLocation[] {
    return _cpLine.CPLocations
  }

  override function addToLineSpecificLocations(cpLocation : LineSpecificLocation ) {
    _cpLine.addToCPLocations(cpLocation as CPLocation)
  }

  override function removeFromLineSpecificLocations(cpLocation : LineSpecificLocation ) {
    var buildingNums = new ArrayList<Integer>()
    (cpLocation as CPLocation).Buildings.each(\ c -> {
      if (c.CurrentCPBlankets.HasElements) {
        buildingNums.add(c.Building.BuildingNum)
      }
    })
    if (buildingNums.HasElements) {
       throw new gw.api.util.DisplayableException(displaykey.Web.Policy.CP.Location.CannotRemoveLocationWithBlanketedBuilding(buildingNums.join(", ")))
    }
    _cpLine.removeFromCPLocations(cpLocation as CPLocation)
  }

  override property get Period() : PolicyPeriod {
    return _cpLine.Branch
  }

  override function addToLineSpecificLocations(accountLocation : AccountLocation) : LineSpecificLocation {
    var cpLocation = super.addToLineSpecificLocations(accountLocation)
    var castCPLocation = cpLocation as CPLocation
    // if the fixedId is Temporary, we made a brand new CPLocation - 
    // otherwise, we cloned a matching one from another slice and don't need to create Conditions and Exclusions
    if (castCPLocation.FixedId.Temporary) {
      castCPLocation.createCoveragesConditionsAndExclusions()
    }
    return cpLocation
  }

}
