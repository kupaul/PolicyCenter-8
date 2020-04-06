package gw.lob.bop
uses gw.coverage.ConditionAdapterBase

@Export
class BusinessOwnersCondConditionAdapter extends ConditionAdapterBase {
  var _owner : BusinessOwnersCond
  
  construct(owner : BusinessOwnersCond)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.BOPLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.BOPLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.BOPLine)
  }

  override function addToConditionArray( condition: PolicyCondition ) : void
  {
     _owner.BOPLine.addToBOPLineConditions( condition as BusinessOwnersCond ) 
  }

  override function removeFromParent() : void
  {
    _owner.BOPLine.removeConditionFromCoverable( _owner )
  }

}
