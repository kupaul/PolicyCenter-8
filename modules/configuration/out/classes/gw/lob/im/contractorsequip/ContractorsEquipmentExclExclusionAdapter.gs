package gw.lob.im.contractorsequip
uses gw.api.domain.ExclusionAdapter
uses gw.coverage.ExclusionAdapterBase

@Export
class ContractorsEquipmentExclExclusionAdapter extends ExclusionAdapterBase
{
  var _owner : ContrEquipPartExcl
  
  construct(owner : ContrEquipPartExcl) {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction {
    return(_owner.ContractorsEquipPart.InlandMarineLine.BaseState)
  }

  override property get PolicyLine() : PolicyLine {
    return(_owner.ContractorsEquipPart.InlandMarineLine)
  }

  override property get OwningCoverable() : Coverable {
    return(_owner.ContractorsEquipPart)
  }

  override function addToExclusionArray( excl: Exclusion ) : void {
     _owner.ContractorsEquipPart.addToContrEquipPartExclusions( excl as ContrEquipPartExcl ) 
  }

  override function removeFromParent() : void {
    _owner.ContractorsEquipPart.removeFromContrEquipPartExclusions( _owner )
  }
}
