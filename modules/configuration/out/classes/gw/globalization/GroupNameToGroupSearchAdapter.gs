package gw.globalization

uses gw.api.name.ContactNameFields

/**
 * Adapts a GroupSearchCriteria to work with ContactNameFields-dependent components.
 */
@Export
class GroupNameToGroupSearchAdapter implements ContactNameFields {

  var _criteria: entity.GroupSearchCriteria

  construct(grp : GroupSearchCriteria) {
    _criteria = grp
  }

  override property get Name(): java.lang.String {
    return _criteria.GroupName
  }

  override property set Name(n : String) {
    _criteria.GroupName = n
  }

  override property get NameKanji(): java.lang.String {
    return _criteria.GroupNameKanji
  }

  override property set NameKanji(nk : String) {
    _criteria.GroupNameKanji = nk
  }
}