package gw.lob.bop

uses gw.coverage.ExclusionAdapterBase

@Export
class BusinessOwnersExclExclusionAdapter extends ExclusionAdapterBase {
  var _owner : BusinessOwnersExcl
  
  construct(owner : BusinessOwnersExcl) {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction {
    return(_owner.BOPLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine {
    return(_owner.BOPLine)
  }

  override property get OwningCoverable() : Coverable {
    return(_owner.BOPLine)
  }

  override function addToExclusionArray( excl: Exclusion ) : void {
     _owner.BOPLine.addToBOPLineExclusions( excl as BusinessOwnersExcl ) 
  }

  override function removeFromParent() : void {
    _owner.BOPLine.removeExclusionFromCoverable( _owner )
  }

}
