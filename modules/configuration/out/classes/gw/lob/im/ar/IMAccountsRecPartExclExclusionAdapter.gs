package gw.lob.im.ar
uses gw.coverage.ExclusionAdapterBase

@Export
class IMAccountsRecPartExclExclusionAdapter extends ExclusionAdapterBase {
  var _owner : IMAccountsRecPartExcl
  
  construct(owner : IMAccountsRecPartExcl) {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction {
    return(_owner.IMAccountsRecPart.InlandMarineLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine {
    return(_owner.IMAccountsRecPart.InlandMarineLine)
  }

  override property get OwningCoverable() : Coverable {
    return(_owner.IMAccountsRecPart)
  }

  override function addToExclusionArray( excl: Exclusion ) : void {
     _owner.IMAccountsRecPart.addToIMAccountsRecPartExclusions( excl as IMAccountsRecPartExcl ) 
  }

  override function removeFromParent() : void {
    _owner.IMAccountsRecPart.removeExclusionFromCoverable( _owner )
  }

}
