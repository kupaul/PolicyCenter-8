package gw.lob.im.contractorsequip
uses gw.coverage.CoverageAdapterBase
uses gw.api.reinsurance.ReinsurableCoverable

@Export
class ContractorsEquipmentCoverageAdapter extends CoverageAdapterBase
{
  var _owner : ContractorsEquipCov
  
  construct(owner : ContractorsEquipCov)
  {
    super(owner)
    _owner = owner
  }

  override property get CoverageState() : Jurisdiction
  {
    return PolicyLine.BaseState
  }

  override property get PolicyLine() : PolicyLine
  {
    return _owner.ContractorsEquipment.ContractorsEquipPart.InlandMarineLine
  }

  override property get OwningCoverable() : Coverable
  {
    return _owner.ContractorsEquipment
  }

  override function addToCoverageArray( p0: Coverage ) : void
  {
    _owner.ContractorsEquipment.addToCoverages( p0 as ContractorsEquipCov )
  }

  override function removeFromParent() : void
  {
    _owner.ContractorsEquipment.removeFromCoverages( _owner )
  }

  override property get ReinsurableCoverable() : ReinsurableCoverable {
    return typeSafeReinsurableCoverable(_owner.BranchValue)
  }

}