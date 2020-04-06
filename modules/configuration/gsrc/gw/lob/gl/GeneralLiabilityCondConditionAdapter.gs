package gw.lob.gl
uses gw.coverage.ConditionAdapterBase

@Export
class GeneralLiabilityCondConditionAdapter extends ConditionAdapterBase {
  var _owner : GeneralLiabilityCond
  
  construct(owner : GeneralLiabilityCond)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.GLLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.GLLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.GLLine)
  }

  override function addToConditionArray( condition: PolicyCondition ) : void
  {
     _owner.GLLine.addToGLLineConditions( condition as GeneralLiabilityCond ) 
  }

  override function removeFromParent() : void
  {
    _owner.GLLine.removeConditionFromCoverable( _owner )
  }

}
