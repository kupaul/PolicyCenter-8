package gw.lob.cp
uses entity.CPBuildingCov
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class CPBuildingCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : CPBuildingCov
  
  construct(owner : CPBuildingCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return null // This is correct
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.CPBuilding.PolicyLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.CPBuilding)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.CPBuilding.addToCoverages( p0 as CPBuildingCov )
  }

  override function removeFromParent() : void
  {
    // Do nothing is correct
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.CPBuilding.CPLocation.PolicyLocation)
  }

}
