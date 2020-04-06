package gw.lob.ba

uses gw.coverage.ConditionAdapterBase

@Export
class BAStateCondConditionAdapter extends ConditionAdapterBase {
  
  var _owner : BAStateCond
  construct(owner : BAStateCond) {
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
    _owner.BAJurisdiction.removeFromConditions( _owner )
  }

  override function addToConditionArray( p0 : PolicyCondition ) {
    _owner.BAJurisdiction.addToConditions( p0 as BAStateCond )
  }

}
