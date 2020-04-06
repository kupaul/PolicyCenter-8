package gw.lob.gl
uses gw.coverage.ExclusionAdapterBase

@Export
class GeneralLiabilityExclExclusionAdapter extends ExclusionAdapterBase {
  var _owner : GeneralLiabilityExcl
  
  construct(owner : GeneralLiabilityExcl) {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction {
    return(_owner.GLLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine {
    return(_owner.GLLine)
  }

  override property get OwningCoverable() : Coverable {
    return(_owner.GLLine)
  }

  override function addToExclusionArray( excl: Exclusion ) : void {
     _owner.GLLine.addToGLLineExclusions( excl as GeneralLiabilityExcl ) 
  }

  override function removeFromParent() : void {
    _owner.GLLine.removeExclusionFromCoverable( _owner )
  }

}
