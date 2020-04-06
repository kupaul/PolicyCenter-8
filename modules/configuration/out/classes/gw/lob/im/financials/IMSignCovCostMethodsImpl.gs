package gw.lob.im.financials

@Export
class IMSignCovCostMethodsImpl extends GenericIMCostMethodsImpl<IMSignCovCost> {

  construct(owner : IMSignCovCost) {
    super(owner)
  }

  override property get Coverage() : Coverage {
    return Cost.IMSignCov
  }

  override property get OwningCoverable() : Coverable {
    return Cost.IMSignCov.IMSign
  }

  override property get State() : Jurisdiction {
    return Cost.IMSignPart.InlandMarineLine.BaseState
  }
  
  override property get Location() : PolicyLocation {
    return Cost.IMSignCov.IMSign.IMLocation.Location
  }
}
