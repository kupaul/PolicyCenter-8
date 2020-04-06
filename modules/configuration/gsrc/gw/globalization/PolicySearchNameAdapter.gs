package gw.globalization

/**
 * Adapts a PolicySearchCriteria to work with PersonNameFields-dependent components.
 */
@Export
class PolicySearchNameAdapter extends UnsupportedPersonNameFields {

  var _searchCriteria : PolicySearchCriteria

  construct(searchCriteria : PolicySearchCriteria) {
    _searchCriteria = searchCriteria
  }

  override property get FirstName(): String {
    return _searchCriteria.NameCriteria.FirstName
  }

  override property set FirstName(value: String) {
    _searchCriteria.NameCriteria.FirstName = value
  }

  override property get LastName(): String {
    return _searchCriteria.NameCriteria.LastName
  }

  override property set LastName(value: String) {
    _searchCriteria.NameCriteria.LastName = value
  }

  override property get FirstNameKanji(): String {
    return _searchCriteria.NameCriteria.FirstNameKanji
  }

  override property set FirstNameKanji(value: String) {
    _searchCriteria.NameCriteria.FirstNameKanji = value
  }

  override property get LastNameKanji(): String {
    return _searchCriteria.NameCriteria.LastNameKanji
  }

  override property set LastNameKanji(value: String) {
    _searchCriteria.NameCriteria.LastNameKanji = value
  }

  //Company Name
  override property get Name(): String {
    return _searchCriteria.NameCriteria.CompanyName
  }

  //Company Name
  override property set Name(value: String) {
    _searchCriteria.NameCriteria.CompanyName = value
  }

  // Kanji Company Name
  override property get NameKanji(): String {
    return _searchCriteria.NameCriteria.CompanyNameKanji
  }

  // Kanji Company Name
  override property set NameKanji(value: String) {
    _searchCriteria.NameCriteria.CompanyNameKanji = value
  }
}