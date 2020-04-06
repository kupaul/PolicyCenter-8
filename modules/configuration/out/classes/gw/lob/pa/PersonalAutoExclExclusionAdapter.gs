package gw.lob.pa
uses gw.coverage.ExclusionAdapterBase

@Export
class PersonalAutoExclExclusionAdapter extends ExclusionAdapterBase {
  var _owner : PersonalAutoExcl
  
  construct(owner : PersonalAutoExcl) {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction {
    return(_owner.PALine.BaseState)
  }

  override property get PolicyLine() : PolicyLine {
    return(_owner.PALine)
  }

  override property get OwningCoverable() : Coverable {
    return(_owner.PALine)
  }

  override function addToExclusionArray( excl: Exclusion ) : void {
     _owner.PALine.addToPALineExclusions( excl as PersonalAutoExcl ) 
  }

  override function removeFromParent() : void {
    _owner.PALine.removeExclusionFromCoverable( _owner )
  }

}
