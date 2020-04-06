package gw.lob.im.sign
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable
uses gw.api.util.JurisdictionMappingUtil

@Export
class IMSignCovCoverageAdapter extends CoverageAdapterBase
{
  var _owner : entity.IMSignCov
  
  construct( owner : entity.IMSignCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return JurisdictionMappingUtil.getJurisdiction(_owner.IMSign.IMLocation.Location)
  }

  override property get PolicyLine() : PolicyLine
  {
    return _owner.IMSign.IMSignPart.InlandMarineLine
  }

  override property get OwningCoverable() : Coverable
  {
    return _owner.IMSign
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.IMSign.addToCoverages( p0 as IMSignCov )
  }

  override function removeFromParent() : void
  {
    _owner.IMSign.removeFromCoverages( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}
