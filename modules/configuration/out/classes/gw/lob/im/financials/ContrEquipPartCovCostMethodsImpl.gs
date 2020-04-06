package gw.lob.im.financials

@Export
class ContrEquipPartCovCostMethodsImpl extends GenericIMCostMethodsImpl<ContrEquipPartCovCost> {

  construct(owner : ContrEquipPartCovCost) {
    super(owner)
  }

  override property get Coverage() : Coverage {
    return Cost.ContrEquipPartCov
  }

  override property get OwningCoverable() : Coverable {
    return Cost.ContractorsEquipPart
  }

  override property get State() : Jurisdiction {
    return Cost.ContractorsEquipPart.InlandMarineLine.BaseState
  }
}
