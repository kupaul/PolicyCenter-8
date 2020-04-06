package gw.globalization

/**
 * Adapts a ContactSearchCriteria to work with PersonNameFields-dependent components.
 */
@Export
class ContactSearchCriteriaNameAdapter extends UnsupportedPersonNameFields {

  var _criteria : ContactSearchCriteria

  construct(criteria : ContactSearchCriteria) {
    this._criteria = criteria
  }

  override property get FirstName(): java.lang.String {
    return _criteria.FirstName
  }

  override property set FirstName(value: java.lang.String) {
    _criteria.FirstName = value
  }

  override property get LastName(): java.lang.String {
    return _criteria.Keyword
  }

  override property set LastName(value: java.lang.String) {
    _criteria.Keyword = value
  }

  override property get Name() : String {
    return _criteria.Keyword
  }

  override property set Name(value : String) {
    _criteria.Keyword = value
  }

  override property get FirstNameKanji(): java.lang.String {
    return _criteria.FirstNameKanji
  }

  override property set FirstNameKanji(value: java.lang.String) {
    _criteria.FirstNameKanji = value
  }

  override property get LastNameKanji(): java.lang.String {
    return _criteria.KeywordKanji
  }

  override property set LastNameKanji(value: java.lang.String) {
    _criteria.KeywordKanji = value
  }

  override property get NameKanji() : String {
    return _criteria.KeywordKanji
  }

  override property set NameKanji(value : String) {
    _criteria.KeywordKanji = value
  }
}