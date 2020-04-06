package gw.globalization

uses gw.api.name.ContactNameFields

/**
 * Adapts an OrganizationSearchCriteria to work with ContactNameFields-dependent components.
 */
@Export
class OrganizationNameSearchAdapter implements ContactNameFields {

  var _criteria: entity.OrganizationSearchCriteria

  construct(org : OrganizationSearchCriteria) {
    _criteria = org
  }

  override property get Name() : String {
    return _criteria.Name
  }

  override property set Name(n : String) {
    _criteria.Name = n
  }

  override property get NameKanji() : String {
    return _criteria.NameKanji
  }

  override property set NameKanji(nk : String) {
    _criteria.NameKanji = nk
  }
}