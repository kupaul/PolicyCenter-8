package gw.lob.pa
uses gw.coverage.ConditionAdapterBase

@Export
class PersonalAutoCondConditionAdapter extends ConditionAdapterBase {
  var _owner : PersonalAutoCond
  
  construct(owner : PersonalAutoCond)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.PALine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.PALine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.PALine)
  }

  override function addToConditionArray( condition: PolicyCondition ) : void
  {
     _owner.PALine.addToPALineConditions( condition as PersonalAutoCond ) 
  }

  override function removeFromParent() : void
  {
    _owner.PALine.removeConditionFromCoverable( _owner )
  }

}
