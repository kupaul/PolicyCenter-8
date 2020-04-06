package gw.lob.wc

uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class WorkersCompCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : WorkersCompCov  
  
  construct(owner : WorkersCompCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.WCLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.WCLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.WCLine)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.WCLine.addToWCLineCoverages( p0 as WorkersCompCov )
  }

  override function removeFromParent() : void
  {
    _owner.WCLine.removeFromWCLineCoverages( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}
