package gw.lob.ba.financials

@Export
class BALineCovCostMethodsImpl extends GenericBACostMethodsImpl<BALineCovCost> {


  construct( owner : BALineCovCost) {
    super(owner)
  }
  
  override property get Coverage() : Coverage {
    return Cost.BusinessAutoCov
  }
  
  override property get OwningCoverable() : Coverable
  {
    return Cost.BusinessAutoLine
  }

  override property get Vehicle() : BusinessVehicle {
    return Cost.BusinessVehicle
  }
  
  override property get State() : Jurisdiction
  {
    return Cost.Jurisdiction.State
  }
}
