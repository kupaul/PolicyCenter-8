package gw.admin.affinitygroup

uses gw.api.name.ContactNameFields

/**
 * Adapts a AffinityGroupSearchCriteria to work with ContactNameFields-dependent components.
 */
@Export
class AffinityGroupSearchCriteriaAdapter implements ContactNameFields {

  var _criteria: AffinityGroupSearchCriteria

  construct(searchCriteria : AffinityGroupSearchCriteria) {
    _criteria = searchCriteria
  }

  override property get Name(): String {
    return _criteria.AffinityGroupName
  }

  override property set Name(value: String) {
    _criteria.AffinityGroupName = value
  }

  override property get NameKanji(): String {
    return _criteria.AffinityGroupNameKanji
  }

  override property set NameKanji(value: String) {
    _criteria.AffinityGroupNameKanji = value
  }
}
