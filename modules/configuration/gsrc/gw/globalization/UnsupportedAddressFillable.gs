package gw.globalization

uses gw.api.address.AddressFillableExtension

/**
 * Base implementation of AddressFillableExtension that treats all properties
 * as unsupported.
 */
@Export
abstract class UnsupportedAddressFillable implements AddressFillableExtension {

  protected var _unsupportedBehavior : UnsupportedPropertyBehavior = new UnsupportedPropertyBehavior(this.IntrinsicType)

  override property get AddressLine1() : String {
    return _unsupportedBehavior.getValue<String>()
  }
  override property set AddressLine1(p0 : String) {
    _unsupportedBehavior.setValue("AddressLine1")
  }

  override property get AddressLine2() : String {
    return _unsupportedBehavior.getValue<String>()
  }
  override property set AddressLine2(p0 : String) {
    _unsupportedBehavior.setValue("AddressLine2")
  }

  override property get AddressLine1Kanji() : String {
    return _unsupportedBehavior.getValue<String>()
  }
  override property set AddressLine1Kanji(p0 : String) {
    _unsupportedBehavior.setValue("AddressLine1Kanji")
  }

  override property get AddressLine2Kanji() : String {
    return _unsupportedBehavior.getValue<String>()
  }
  override property set AddressLine2Kanji(p0 : String) {
    _unsupportedBehavior.setValue("AddressLine2Kanji")
  }

  override property get AddressLine3() : String {
    return _unsupportedBehavior.getValue<String>()
  }
  override property set AddressLine3(p0 : String) {
    _unsupportedBehavior.setValue("AddressLine3")
  }

  override property get CityKanji(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set CityKanji(value: String) {
    _unsupportedBehavior.setValue("CityKanji")
  }

  override property get City(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set City(value: String) {
    _unsupportedBehavior.setValue("City")
  }

  override property get Country(): gw.pl.geodata.zone.typekey.Country {
    return _unsupportedBehavior.getValue<gw.pl.geodata.zone.typekey.Country>()
  }

  override property set Country(value: gw.pl.geodata.zone.typekey.Country) {
    _unsupportedBehavior.setValue("Country")
  }

  override property get County(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set County(value: String) {
    _unsupportedBehavior.setValue("County")
  }

  override property get PostalCode(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set PostalCode(value: String) {
    _unsupportedBehavior.setValue("PostalCode")
  }

  override property get State(): gw.pl.geodata.zone.typekey.State {
    return _unsupportedBehavior.getValue<gw.pl.geodata.zone.typekey.State>()
  }

  override property set State(value: gw.pl.geodata.zone.typekey.State) {
    _unsupportedBehavior.setValue("State")
  }

  override property get CEDEX(): Boolean {
    return _unsupportedBehavior.getValue<Boolean>()
  }
  override property set CEDEX(p0: java.lang.Boolean) {
    _unsupportedBehavior.setValue("CEDEX")
  }

  override property get CEDEXBureau() : String {
    return _unsupportedBehavior.getValue<String>()
  }
  override property set CEDEXBureau(p0 : String) {
    _unsupportedBehavior.setValue("CEDEXBureau")
  }
}

