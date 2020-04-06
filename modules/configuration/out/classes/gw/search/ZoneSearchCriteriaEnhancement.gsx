package gw.search

enhancement ZoneSearchCriteriaEnhancement : gw.api.admin.ZoneSearchCriteria {
  @Deprecated("Replaced by gw.api.admin.PCZoneSearchCriteria#getPossibleCountries() in PolicyCenter 8.0.") 
  function getPossibleCountries() : List<Country> {
    var org = User.util.CurrentUser.Organization
    if (org == null) {
      org = User.util.UnrestrictedUser.Organization
    }
    return org.Countries
  }
}
