package gw.lob.cp

uses gw.coverage.ExclusionAdapterBase

@Export
class CommercialPropertyExclExclusionAdapter extends ExclusionAdapterBase {
  var _owner : CommercialPropertyExcl
  
  construct(owner : CommercialPropertyExcl) {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction {
    return(_owner.CPLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine {
    return(_owner.CPLine)
  }

  override property get OwningCoverable() : Coverable {
    return(_owner.CPLine)
  }

  override function addToExclusionArray( excl: Exclusion ) : void {
     _owner.CPLine.addToCPLineExclusions( excl as CommercialPropertyExcl ) 
  }

  override function removeFromParent() : void {
    _owner.CPLine.removeExclusionFromCoverable( _owner )
  }

}
