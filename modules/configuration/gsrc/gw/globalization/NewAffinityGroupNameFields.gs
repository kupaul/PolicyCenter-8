package gw.globalization

uses gw.api.name.ContactNameFields

@Export
class NewAffinityGroupNameFields implements ContactNameFields {

  var _affinityGroup : AffinityGroup

  construct(affinityGroup : AffinityGroup) {
    _affinityGroup = affinityGroup
  }

  override property get Name(): String {
    return _affinityGroup.Name
  }

  override property set Name(value: String) {
    _affinityGroup.Name = value
  }

  override property get NameKanji(): String {
    return _affinityGroup.NameKanji
  }

  override property set NameKanji(value: String) {
    _affinityGroup.NameKanji = value
  }
}