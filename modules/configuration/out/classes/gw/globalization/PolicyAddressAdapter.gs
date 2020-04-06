package gw.globalization

/**
 * Adapts a PolicyAddress to work with AddressFillable-dependent components.
 */
@Export
class PolicyAddressAdapter extends UnsupportedAddressFillable {

  var _policyAddress: PolicyAddress

  construct(policyAddress: PolicyAddress) {
    _policyAddress = policyAddress
  }

  override property get AddressLine1(): java.lang.String {
    return _policyAddress.AddressLine1
  }

  override property set AddressLine1(value: java.lang.String) {
    _policyAddress.AddressLine1 = value
  }

  override property get AddressLine2(): java.lang.String {
    return _policyAddress.AddressLine2
  }

  override property set AddressLine2(value: java.lang.String) {
    _policyAddress.AddressLine2 = value
  }

  override property get AddressLine3(): java.lang.String {
    return _policyAddress.AddressLine3
  }

  override property set AddressLine3(value: java.lang.String) {
    _policyAddress.AddressLine3 = value
  }

  override property get City(): java.lang.String {
    return _policyAddress.City
  }

  override property set City(value: java.lang.String) {
    _policyAddress.City = value
  }

  override property get Country(): gw.pl.geodata.zone.typekey.Country {
    return _policyAddress.Country
  }

  override property set Country(value: gw.pl.geodata.zone.typekey.Country) {
    _policyAddress.Country = value
  }

  override property get County(): java.lang.String {
    return _policyAddress.County
  }

  override property set County(value: java.lang.String) {
    _policyAddress.County = value
  }

  override property get PostalCode(): java.lang.String {
    return _policyAddress.PostalCode
  }

  override property set PostalCode(value: java.lang.String) {
    _policyAddress.PostalCode = value
  }

  override property get State(): gw.pl.geodata.zone.typekey.State {
    return _policyAddress.State
  }

  override property set State(value: gw.pl.geodata.zone.typekey.State) {
    _policyAddress.State = value
  }

  override property get AddressLine1Kanji(): java.lang.String {
    return _policyAddress.AddressLine1Kanji
  }

  override property set AddressLine1Kanji(value: java.lang.String) {
    _policyAddress.AddressLine1Kanji = value
  }

  override property get AddressLine2Kanji(): java.lang.String {
    return _policyAddress.AddressLine2Kanji
  }

  override property set AddressLine2Kanji(value: java.lang.String) {
    _policyAddress.AddressLine2Kanji = value
  }

  override property get CityKanji(): java.lang.String {
    return _policyAddress.CityKanji
  }

  override property set CityKanji(value: java.lang.String) {
    _policyAddress.CityKanji = value
  }

  override property get CEDEX(): java.lang.Boolean {
    return _policyAddress.CEDEX
  }

  override property set CEDEX(value: java.lang.Boolean) {
    _policyAddress.CEDEX = value
  }

  override property get CEDEXBureau(): java.lang.String {
    return _policyAddress.CEDEXBureau
  }

  override property set CEDEXBureau(value: java.lang.String) {
    _policyAddress.CEDEXBureau = value
  }

}

