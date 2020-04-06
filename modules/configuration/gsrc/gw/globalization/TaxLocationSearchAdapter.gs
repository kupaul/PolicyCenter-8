package gw.globalization

uses gw.api.util.StateJurisdictionMappingUtil
uses gw.lob.common.TaxLocationSearchCriteria

/**
 * Adapts a TaxLocationSearchCriteria to work with AddressFillable-dependent components.
 */
@Export
class TaxLocationSearchAdapter extends UnsupportedAddressFillable {

  var _searchCriteria: TaxLocationSearchCriteria

  construct(searchCriteria: TaxLocationSearchCriteria) {
    _searchCriteria = searchCriteria
  }

  override property get City(): String {
    return _searchCriteria.City
  }
  override property set City(c: String) {
    _searchCriteria.City = c
  }

  override property get County(): String {
    return _searchCriteria.County
  }
  override property set County(cn: String) {
    _searchCriteria.County = cn
  }

  override property get State(): State {
    return StateJurisdictionMappingUtil.getStateMappingForJurisdiction(_searchCriteria.State)
  }
  override property set State(st: State) {
    _searchCriteria.State = StateJurisdictionMappingUtil.getJurisdictionMappingForState(st)
  }
}
