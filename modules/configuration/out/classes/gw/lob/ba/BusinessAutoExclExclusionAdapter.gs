package gw.lob.ba

uses gw.coverage.ExclusionAdapterBase

@Export
class BusinessAutoExclExclusionAdapter extends ExclusionAdapterBase {
  var _owner : BusinessAutoExcl
  
  construct(owner : BusinessAutoExcl) {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction {
    return(_owner.BALine.BaseState)
  }

  override property get PolicyLine() : PolicyLine {
    return(_owner.BALine)
  }

  override property get OwningCoverable() : Coverable {
    return(_owner.BALine)
  }

  override function addToExclusionArray( excl: Exclusion ) : void {
     _owner.BALine.addToBALineExclusions( excl as BusinessAutoExcl ) 
  }

  override function removeFromParent() : void {
    _owner.BALine.removeExclusionFromCoverable( _owner )
  }

}
