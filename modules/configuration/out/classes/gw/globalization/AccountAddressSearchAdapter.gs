package gw.globalization

uses gw.account.AccountSearchCriteria

/**
 * Adapts an AccountSearchCriteria to work with AddressFillable-dependent components.
 */
@Export
class AccountAddressSearchAdapter extends UnsupportedAddressFillable {

  var _searchCriteria : AccountSearchCriteria

  construct(searchCriteria : AccountSearchCriteria) {
     _searchCriteria = searchCriteria
  }

  override property get AddressLine1() : String {
    return _searchCriteria.AddressLine1
  }
  override property set AddressLine1(addr1 : String) {
    _searchCriteria.AddressLine1 = addr1
  }

  override property get AddressLine1Kanji() : String {
    return _searchCriteria.AddressLine1Kanji
  }

  override property set AddressLine1Kanji(addr1Kanji : String) {
    _searchCriteria.AddressLine1Kanji = addr1Kanji
  }

  override property get AddressLine2() : String {
    return _searchCriteria.AddressLine2
  }
  override property set AddressLine2(addr2 : String) {
    _searchCriteria.AddressLine2 = addr2
  }

  override property get AddressLine2Kanji() : String {
    return _searchCriteria.AddressLine2Kanji
  }
  override property set AddressLine2Kanji(addr2Kanji : String) {
    _searchCriteria.AddressLine2Kanji = addr2Kanji
  }

  override property get City() : String {
    return _searchCriteria.City
  }
  override property set City(c : String) {
    _searchCriteria.City = c
  }

  override property get CityKanji() : String {
    return _searchCriteria.CityKanji
  }
  override property set CityKanji(c : String) {
    _searchCriteria.CityKanji = c
  }

  override property get Country() : Country {
    return _searchCriteria.Country
  }
  override property set Country(c : Country) {
    _searchCriteria.Country = c
  }

  override property get County() : String {
    return _searchCriteria.County
  }
  override property set County(cnty : String) {
    _searchCriteria.County = cnty
  }

  override property get PostalCode() : String {
    return _searchCriteria.PostalCode
  }
  override property set PostalCode(pc : String) {
    _searchCriteria.PostalCode = pc
  }

  override property get State(): State {
    return _searchCriteria.State
  }
  override property set State(st : State) {
    _searchCriteria.State = st
  }
}
