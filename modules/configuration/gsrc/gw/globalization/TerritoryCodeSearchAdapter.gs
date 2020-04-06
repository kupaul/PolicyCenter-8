package gw.globalization

uses gw.api.util.StateJurisdictionMappingUtil
uses gw.lob.common.TerritoryLookupCriteria

/**
 * Adapts a TerritoryLookupCriteria to work with AddressFillable-dependent components.
 */
@Export
class TerritoryCodeSearchAdapter extends UnsupportedAddressFillable {
  var _searchCriteria: TerritoryLookupCriteria
  var _ignoredPropertyBehavior = new IgnoredPropertyBehavior()

  construct(searchCriteria: TerritoryLookupCriteria) {
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

  override property set Country(country : Country) {
    _ignoredPropertyBehavior.setValue("Country")  // necessary for AddressAutocompleteUtil, but we don't need it
  }

  override property get PostalCode(): String {
    return _searchCriteria.PostalCode
  }

  override property set PostalCode(pc: String) {
    _searchCriteria.PostalCode = pc
  }

  override property get State(): State {
    return StateJurisdictionMappingUtil.getStateMappingForJurisdiction(_searchCriteria.State)
  }

  override property set State(st: State) {
    _searchCriteria.State = StateJurisdictionMappingUtil.getJurisdictionMappingForState(st)
  }
}
