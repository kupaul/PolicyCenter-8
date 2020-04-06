package gw.globalization

@Export
class AffinityGroupContactFields extends UnsupportedPersonNameFields {

  var _affinityGroup : AffinityGroup

  construct(affinityGroup : AffinityGroup) {
    _affinityGroup = affinityGroup
  }

  override property get FirstName(): String {
    return _affinityGroup.PrimaryContactFirstName
  }

  override property set FirstName(value: String) {
    _affinityGroup.PrimaryContactFirstName = value
  }

  override property get LastName(): String {
    return _affinityGroup.PrimaryContactLastName
  }

  override property set LastName(value: String) {
    _affinityGroup.PrimaryContactLastName = value
  }

  override property get FirstNameKanji(): String {
    return _affinityGroup.FirstNameKanji
  }

  override property set FirstNameKanji(value: String) {
    _affinityGroup.FirstNameKanji = value
  }

  override property get LastNameKanji(): String {
    return _affinityGroup.LastNameKanji
  }

  override property set LastNameKanji(value: String) {
    _affinityGroup.LastNameKanji = value
  }

}