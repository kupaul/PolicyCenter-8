package gw.lob.ba
uses gw.coverage.ExclusionAdapterBase

@Export
class BAStateExclExclusionAdapter extends ExclusionAdapterBase  {
  
  var _owner : BAStateExcl
  construct(owner : BAStateExcl) {
    super(owner)
    _owner = owner
  }


  override property get CoverageState() : Jurisdiction {
    return _owner.BAJurisdiction.State
  }

  override property get OwningCoverable() : Coverable {
    return _owner.BAJurisdiction
  }

  override property get PolicyLine() : PolicyLine {
    return _owner.BAJurisdiction.BALine
  }

  override function removeFromParent() {
    _owner.BAJurisdiction.removeExclusionFromCoverable( _owner )
  }

  override function addToExclusionArray( p0 : Exclusion ) {
    _owner.BAJurisdiction.addToExclusions( p0 as BAStateExcl )
  }

}
