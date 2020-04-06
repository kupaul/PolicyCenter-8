package gw.lob.bop
uses entity.BOPBuildingCov
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class BOPBuildingCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : BOPBuildingCov
  
  construct(owner : BOPBuildingCov)
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
    return(_owner.BOPBuilding.PolicyLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.BOPBuilding)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.BOPBuilding.addToCoverages( p0 as BOPBuildingCov )
  }

  override function removeFromParent() : void
  {
    // Do nothing is correct
  }
  
  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BOPBuilding.LocationBuilding.PolicyLocation)
  }

}
