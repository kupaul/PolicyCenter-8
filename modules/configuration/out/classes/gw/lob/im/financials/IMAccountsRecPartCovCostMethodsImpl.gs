package gw.lob.im.financials

@Export
class IMAccountsRecPartCovCostMethodsImpl extends GenericIMCostMethodsImpl<IMAccountsRecPartCovCost> {

  construct(owner : IMAccountsRecPartCovCost) {
    super(owner)
  }

  override property get Coverage() : Coverage {
    return Cost.IMAccountsRecPartCov
  }

  override property get OwningCoverable() : Coverable {
    return Cost.IMAccountsRecPart
  }

  override property get State() : Jurisdiction {
    return Cost.IMAccountsRecPart.InlandMarineLine.BaseState
  }
}
