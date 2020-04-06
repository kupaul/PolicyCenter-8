package gw.lob.im.ar
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class IMAccountsRecPartCoverageAdapter extends CoverageAdapterBase
{
  var _owner : IMAccountsRecPartCov
  
  construct(owner : IMAccountsRecPartCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return _owner.IMAccountsRecPart.InlandMarineLine.BaseState
  }

  override property get PolicyLine() : PolicyLine
  {
    return _owner.IMAccountsRecPart.InlandMarineLine
  }

  override property get OwningCoverable() : Coverable
  {
    return _owner.IMAccountsRecPart
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.IMAccountsRecPart.addToIMAccountsRecPartCovs( p0 as IMAccountsRecPartCov )
  }

  override function removeFromParent() : void
  {
    _owner.IMAccountsRecPart.removeFromIMAccountsRecPartCovs( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}
