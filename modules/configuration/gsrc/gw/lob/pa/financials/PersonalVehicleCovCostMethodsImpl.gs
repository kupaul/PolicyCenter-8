package gw.lob.pa.financials

@Export
class PersonalVehicleCovCostMethodsImpl extends GenericPACostMethodsImpl<PersonalVehicleCovCost>
{
  
  construct( owner : PersonalVehicleCovCost )
  {
    super( owner )
  }

  override property get Coverage() : Coverage
  {
    return Cost.PersonalVehicleCov
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.PersonalVehicleCov.PersonalVehicle
  }

   override property get Vehicle() : PersonalVehicle
  {
    return Cost.PersonalVehicleCov.PersonalVehicle
  }
}
