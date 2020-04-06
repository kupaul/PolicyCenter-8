package gw.lob.ba.financials

@Export
class BAStateCovVehiclePIPCostMethodsImpl extends GenericBACostMethodsImpl<BAStateCovVehiclePIPCost>
{
  
  construct( owner : BAStateCovVehiclePIPCost )
  {
    super( owner )
  }

  override property get Coverage() : Coverage
  {
    return Cost.BAStateCov
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.Jurisdiction
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