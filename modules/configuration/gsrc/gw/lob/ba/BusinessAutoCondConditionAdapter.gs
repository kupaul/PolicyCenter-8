package gw.lob.ba

uses gw.coverage.ConditionAdapterBase

@Export
class BusinessAutoCondConditionAdapter extends ConditionAdapterBase {
  var _owner : BusinessAutoCond
  
  construct(owner : BusinessAutoCond)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.BALine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.BALine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.BALine)
  }

  override function addToConditionArray( condition: PolicyCondition ) : void
  {
     _owner.BALine.addToBALineConditions( condition as BusinessAutoCond ) 
  }

  override function removeFromParent() : void
  {
    _owner.BALine.removeConditionFromCoverable( _owner )
  }

}
