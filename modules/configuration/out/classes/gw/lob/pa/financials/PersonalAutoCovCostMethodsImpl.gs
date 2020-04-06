package gw.lob.pa.financials

@Export
class PersonalAutoCovCostMethodsImpl extends GenericPACostMethodsImpl<PersonalAutoCovCost>
{
  
  construct( owner : PersonalAutoCovCost )
  {
    super( owner )
  }

  override property get Coverage() : Coverage
  {
    return Cost.PersonalAutoCov
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.PersonalAutoLine
  }

  override property get Vehicle() : PersonalVehicle
  {
    return Cost.PersonalVehicle
  }
}
