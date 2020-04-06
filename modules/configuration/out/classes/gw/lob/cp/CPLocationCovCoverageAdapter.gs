package gw.lob.cp
uses entity.CPLocationCov
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class CPLocationCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : CPLocationCov
  
  construct(owner : CPLocationCov)
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
    return(_owner.CPLocation.PolicyLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.CPLocation)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.CPLocation.addToCoverages( p0 as CPLocationCov )
  }

  override function removeFromParent() : void
  {
    // Do nothing is correct
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.CPLocation.PolicyLocation)
  }

}
