package gw.lob.im.financials

@Export
class IMAccountsRecCovCostMethodsImpl extends GenericIMCostMethodsImpl<IMAccountsRecCovCost> {

  construct(owner : IMAccountsRecCovCost) {
    super(owner)
  }

  override property get Coverage() : Coverage {
    return Cost.IMAccountsRecCov 
  }

  override property get OwningCoverable() : Coverable {
    return Cost.IMAccountsRecCov.IMAccountsReceivable
  }

  override property get State() : Jurisdiction {
    return Cost.IMAccountsRecPart.InlandMarineLine.BaseState
  }
  
  override property get Location() : PolicyLocation {
    return Cost.IMAccountsRecCov.IMAccountsReceivable.IMBuilding.IMLocation.Location
  }
}
