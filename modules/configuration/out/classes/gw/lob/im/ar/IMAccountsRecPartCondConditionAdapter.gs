package gw.lob.im.ar
uses gw.coverage.ConditionAdapterBase

@Export
class IMAccountsRecPartCondConditionAdapter extends ConditionAdapterBase
{
  var _owner : IMAccountsRecPartCond
  
  construct(owner : IMAccountsRecPartCond )
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.IMAccountsRecPart.InlandMarineLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.IMAccountsRecPart.InlandMarineLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.IMAccountsRecPart)
  }

  override function addToConditionArray( condition: PolicyCondition ) : void
  {
     _owner.IMAccountsRecPart.addToIMAccountsRecPartConditions( condition as IMAccountsRecPartCond ) 
  }

  override function removeFromParent() : void
  {
    _owner.IMAccountsRecPart.removeConditionFromCoverable( _owner )
  }
}
