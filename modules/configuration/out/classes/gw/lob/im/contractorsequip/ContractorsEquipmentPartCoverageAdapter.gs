package gw.lob.im.contractorsequip
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class ContractorsEquipmentPartCoverageAdapter extends CoverageAdapterBase
{
  var _owner : ContrEquipPartCov
  
  construct(owner : ContrEquipPartCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return _owner.ContractorsEquipPart.InlandMarineLine.BaseState
  }

  override property get PolicyLine() : PolicyLine
  {
    return _owner.ContractorsEquipPart.InlandMarineLine
  }

  override property get OwningCoverable() : Coverable
  {
    return _owner.ContractorsEquipPart
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.ContractorsEquipPart.addToContrEquipPartCovs( p0 as ContrEquipPartCov )
  }

  override function removeFromParent() : void
  {
    _owner.ContractorsEquipPart.removeFromContrEquipPartCovs( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}
