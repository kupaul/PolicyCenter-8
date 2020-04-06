package gw.lob.cp
uses gw.coverage.ConditionAdapterBase

@Export
class CommercialPropertyCondConditionAdapter extends ConditionAdapterBase {
  var _owner : CommercialPropertyCond
  
  construct(owner : CommercialPropertyCond)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.CPLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.CPLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.CPLine)
  }

  override function addToConditionArray( condition: PolicyCondition ) : void
  {
     _owner.CPLine.addToCPLineConditions( condition as CommercialPropertyCond ) 
  }

  override function removeFromParent() : void
  {
    _owner.CPLine.removeConditionFromCoverable( _owner )
  }

}
