package gw.lob.im.contractorsequip
uses gw.coverage.ConditionAdapterBase

@Export
class ContractorsEquipPartCondConditionAdapter extends ConditionAdapterBase {
  var _owner : ContrEquipPartCond
  
  construct(owner : ContrEquipPartCond)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return(_owner.ContractorsEquipPart.InlandMarineLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine
  {
    return(_owner.ContractorsEquipPart.InlandMarineLine)
  }

  override property get OwningCoverable() : Coverable
  {
    return(_owner.ContractorsEquipPart)
  }

  override function addToConditionArray( condition: PolicyCondition ) : void
  {
     _owner.ContractorsEquipPart.addToContrEquipPartConditions( condition as ContrEquipPartCond ) 
  }

  override function removeFromParent() : void
  {
    _owner.ContractorsEquipPart.removeConditionFromCoverable( _owner )
  }

}
