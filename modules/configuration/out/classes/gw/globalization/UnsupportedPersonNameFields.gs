package gw.globalization

uses gw.api.name.PersonNameFields

/**
 * Base implementation of PersonNameFields that treats all properties
 * as unsupported.
 */
@Export
class UnsupportedPersonNameFields implements PersonNameFields {

  var _unsupportedBehavior : UnsupportedPropertyBehavior

  construct() {
    _unsupportedBehavior = new UnsupportedPropertyBehavior(this.IntrinsicType)
  }

  override property get FirstName(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set FirstName(value: String) {
    _unsupportedBehavior.setValue("FirstName")
  }

  override property get MiddleName(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set MiddleName(value: String) {
    _unsupportedBehavior.setValue("MiddleName")
  }

  override property get Particle(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set Particle(value: String) {
    _unsupportedBehavior.setValue("Particle")
  }

  override property get LastName(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set LastName(value: String) {
    _unsupportedBehavior.setValue("LastName")
  }

  override property get Prefix(): typekey.NamePrefix {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set Prefix(value: typekey.NamePrefix) {
    _unsupportedBehavior.setValue("Prefix")
  }

  override property get Suffix(): typekey.NameSuffix {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set Suffix(value: typekey.NameSuffix) {
    _unsupportedBehavior.setValue("Suffix")
  }

  override property get FirstNameKanji(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set FirstNameKanji(value: String) {
    _unsupportedBehavior.setValue("FirstNameKanji")
  }

  override property get LastNameKanji(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set LastNameKanji(value: String) {
    _unsupportedBehavior.setValue("LastNameKanji")
  }

  override property get Name(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set Name(value: String) {
    _unsupportedBehavior.setValue("Name")
  }

  override property get NameKanji(): String {
    return _unsupportedBehavior.getValue<String>()
  }

  override property set NameKanji(value: String) {
    _unsupportedBehavior.setValue("NameKanji")
  }

}