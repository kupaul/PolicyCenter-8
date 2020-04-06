package gw.lob.bop
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class BOPLocationCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : BOPLocationCov
  
  construct(owner : BOPLocationCov)
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
    return(_owner.BOPLocation.PolicyLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.BOPLocation)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.BOPLocation.addToCoverages( p0 as BOPLocationCov )
  }

  override function removeFromParent() : void
  {
    // Do nothing is correct
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BOPLocation.PolicyLocation)
  }

}
