package gw.lob.im.financials

@Export
class ContrEquipCovCostMethodsImpl extends GenericIMCostMethodsImpl<ContrEquipCovCost> {

  construct(owner : ContrEquipCovCost) {
    super(owner)
  }

  override property get Coverage() : Coverage {
    return Cost.ContractorsEquipCov 
  }

  override property get OwningCoverable() : Coverable {
    return Cost.ContractorsEquipCov.ContractorsEquipment
  }

  override property get State() : Jurisdiction {
    return Cost.ContractorsEquipPart.InlandMarineLine.BaseState 
  }
}
