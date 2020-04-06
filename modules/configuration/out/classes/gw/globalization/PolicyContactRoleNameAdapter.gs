package gw.globalization

/**
 * Adapts a PolicyContactRole to work with PersonNameFields-dependent components.
 */
@Export
class PolicyContactRoleNameAdapter extends UnsupportedPersonNameFields {

  var _policyContactRole : PolicyContactRole

  construct(policyContactRole : PolicyContactRole) {
    _policyContactRole = policyContactRole
  }

  override property get FirstName(): String {
    return _policyContactRole.FirstName
  }

  override property set FirstName(value: String) {
    _policyContactRole.FirstName = value
  }

  override property get Particle(): String {
    return _policyContactRole.Particle
  }

  override property set Particle(value: String) {
    _policyContactRole.Particle = value
  }

  override property get LastName(): String {
    return _policyContactRole.LastName
  }

  override property set LastName(value: String) {
    _policyContactRole.LastName = value
  }

  override property get FirstNameKanji(): String {
    return _policyContactRole.FirstNameKanji
  }

  override property set FirstNameKanji(value: String) {
    _policyContactRole.FirstNameKanji = value
  }

  override property get LastNameKanji(): String {
    return _policyContactRole.LastNameKanji
  }

  override property set LastNameKanji(value: String) {
    _policyContactRole.LastNameKanji = value
  }

  //Company Name
  override property get Name(): String {
    return _policyContactRole.CompanyName
  }

  //Company Name
  override property set Name(value: String) {
    _policyContactRole.CompanyName = value
  }

  //Company Name Kanji
  override property get NameKanji(): String {
    return _policyContactRole.CompanyNameKanji
  }

  //Company Name Kanji
  override property set NameKanji(value: String) {
    _policyContactRole.CompanyNameKanji = value
  }
}