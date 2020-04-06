package gw.lob.bop
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class BusinessOwnersCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : BusinessOwnersCov
  
  construct(owner : BusinessOwnersCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.BOPLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.BOPLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.BOPLine)
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.BOPLine.addToBOPLineCoverages( p0 as BusinessOwnersCov )
  }

  override function removeFromParent() : void
  {
    _owner.BOPLine.removeFromBOPLineCoverages( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }


}
