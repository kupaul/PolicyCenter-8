package gw.globalization

uses gw.api.name.ContactNameFields

/**
 * Adapts an UserSearchCriteria to work with ContactNameFields-dependent components.
 */
@Export
class GroupNameToUserSearchAdapter implements ContactNameFields {

  var _criteria: entity.UserSearchCriteria

  construct(criteria : UserSearchCriteria) {
    _criteria = criteria
  }

  override property get Name(): java.lang.String {
    return _criteria.GroupName
  }

  override property set Name(theName : String) {
    _criteria.GroupName = theName
  }

  override property get NameKanji(): java.lang.String {
    return _criteria.GroupNameKanji
  }

  override property set NameKanji(theNameKanji : String) {
    _criteria.GroupNameKanji = theNameKanji
  }
}