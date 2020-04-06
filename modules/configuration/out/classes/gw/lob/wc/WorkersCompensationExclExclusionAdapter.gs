package gw.lob.wc
uses gw.coverage.ExclusionAdapterBase

@Export
class WorkersCompensationExclExclusionAdapter extends ExclusionAdapterBase {
  var _owner : WorkersCompExcl
  
  construct(owner : WorkersCompExcl) {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction {
    return(_owner.WCLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine {
    return(_owner.WCLine)
  }

  override property get OwningCoverable() : Coverable {
    return(_owner.WCLine)
  }

  override function addToExclusionArray( excl: Exclusion ) : void {
     _owner.WCLine.addToWCLineExclusions( excl as WorkersCompExcl ) 
  }

  override function removeFromParent() : void {
    _owner.WCLine.removeExclusionFromCoverable( _owner )
  }

}
