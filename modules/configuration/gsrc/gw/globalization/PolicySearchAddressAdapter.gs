package gw.globalization

/**
 * Adapts a PolicySearchCriteria to work with AddressFillable-dependent components.
 */
@Export
class PolicySearchAddressAdapter extends UnsupportedAddressFillable {

  var _searchCriteria : PolicySearchCriteria
  var _ignoredPropertyBehavior = new IgnoredPropertyBehavior()

  construct(searchCriteria: PolicySearchCriteria) {
    _searchCriteria = searchCriteria
  }

  override property get City() : String {
    return _searchCriteria.PrimaryInsuredCity
  }
  override property set City(c : String) {
    _searchCriteria.PrimaryInsuredCity = c
  }

  override property get CityKanji(): java.lang.String {
    return _searchCriteria.PrimaryInsuredCityKanji
  }
  override property set CityKanji(value: java.lang.String) {
    _searchCriteria.PrimaryInsuredCityKanji = value
  }

  override property set County(county : String) {
    _ignoredPropertyBehavior.setValue("County")  // necessary for AddressAutocompleteUtil, but we don't need it
  }

  override property get Country() : Country {
    return _searchCriteria.PrimaryInsuredCountry
  }
  override property set Country(c : Country) {
    _searchCriteria.PrimaryInsuredCountry = c
  }

  override property get PostalCode() : String {
    return _searchCriteria.PrimaryInsuredPostalCode
  }
  override property set PostalCode(pc : String) {
    _searchCriteria.PrimaryInsuredPostalCode = pc
  }

  override property get State(): State {
    return _searchCriteria.PrimaryInsuredState
  }
  override property set State(st : State) {
    _searchCriteria.PrimaryInsuredState = st
  }

}
