package gw.lob.ba
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class BusinessAutoCovCoverageAdapter extends CoverageAdapterBase {
  
  var _owner : BusinessAutoCov
  
  construct(owner:BusinessAutoCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return _owner.BALine.BaseState
  }

  override property get PolicyLine() : PolicyLine
  {
    return _owner.BALine
  }

  override property get OwningCoverable() : Coverable
  {
    return _owner.BALine
  }
  
  override function addToCoverageArray( p0: Coverage ) : void
  {
     _owner.BALine.addToBALineCoverages( p0 as BusinessAutoCov )
  }

  override function removeFromParent() : void
  {
    _owner.BALine.removeFromBALineCoverages( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}
