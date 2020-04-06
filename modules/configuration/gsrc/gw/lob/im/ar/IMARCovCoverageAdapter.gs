package gw.lob.im.ar
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable
uses gw.api.util.JurisdictionMappingUtil

@Export
class IMARCovCoverageAdapter extends CoverageAdapterBase
{

  var _owner : entity.IMAccountsRecCov
  
  construct( owner : entity.IMAccountsRecCov)
  {
    super(owner)
    _owner = owner
  }
  
  override property get CoverageState() : Jurisdiction
  {
    return JurisdictionMappingUtil.getJurisdiction(_owner.IMAccountsReceivable.IMBuilding.Building.PolicyLocation)
  }

  override property get PolicyLine() : PolicyLine
  {
    return _owner.IMAccountsReceivable.IMAccountsRecPart.InlandMarineLine
  }

  override property get OwningCoverable() : Coverable
  {
    return _owner.IMAccountsReceivable
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.IMAccountsReceivable.addToCoverages( p0 as entity.IMAccountsRecCov )
  }

  override function removeFromParent() : void
  {
    _owner.IMAccountsReceivable.removeFromCoverages( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}
