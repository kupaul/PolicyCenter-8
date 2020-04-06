package gw.lob.wc

uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class WCStateCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : WCStateCov
  
  construct(owner : WCStateCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.WCJurisdiction.State)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.WCJurisdiction.WCLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.WCJurisdiction)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.WCJurisdiction.addToCoverages( p0 as WCStateCov )
  }

  override function removeFromParent() : void
  {
    _owner.WCJurisdiction.removeFromCoverages( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}
