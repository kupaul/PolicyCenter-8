package gw.lob.ba

uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class BAStateCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : BAStateCov
  construct(owner : BAStateCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.BAJurisdiction.State)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.BAJurisdiction.BALine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.BAJurisdiction)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
     _owner.BAJurisdiction.addToCoverages( p0 as BAStateCov ) 
  }

  override function removeFromParent() : void
  {
    _owner.BAJurisdiction.removeCoverageFromCoverable( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}
