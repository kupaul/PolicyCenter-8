package gw.lob.ba.financials

@Export
class BusinessVehicleCovCostMethodsImpl extends GenericBACostMethodsImpl<BusinessVehicleCovCost>
{
  
  construct(owner : BusinessVehicleCovCost)
  {
    super( owner )
  }

  override property get Coverage() : Coverage
  {
    return Cost.BusinessVehicleCov
  }

  override property get OwningCoverable() : Coverable
  {
    return  Cost.BusinessVehicle
  }

  override property get Vehicle() : BusinessVehicle
  {
    return Cost.BusinessVehicle
  }

  override property get State() : Jurisdiction
  {
    return Cost.Jurisdiction.State
  }
}
