package gw.address

/**
 * Interface defining non-street level address properties.
 */
@Export
interface AddressArea {
  
  property get City() : String
  property set City(value : String)

  property get CityKanji() : String
  property set CityKanji(value : String)

  property get Country() : Country
  property set Country(value : Country)
  
  property get County() : String
  property set County(value : String)
  
  property get PostalCode() : String
  property set PostalCode(value : String)
  
  property get State() : State
  property set State(value : State)
  
}
