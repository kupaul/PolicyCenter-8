package gw.lob.wc
uses gw.coverage.ConditionAdapterBase

@Export
class WorkersCompensationCondConditionAdapter extends ConditionAdapterBase {
  var _owner : WorkersCompCond
  
  construct(owner : WorkersCompCond)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.WCLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.WCLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.WCLine)
  }

  override function addToConditionArray( condition: PolicyCondition ) : void
  {
     _owner.WCLine.addToWCLineConditions( condition as WorkersCompCond ) 
  }

  override function removeFromParent() : void
  {
    _owner.WCLine.removeConditionFromCoverable( _owner )
  }

}
