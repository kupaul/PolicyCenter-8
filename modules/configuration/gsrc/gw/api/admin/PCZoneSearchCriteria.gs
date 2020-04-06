package gw.api.admin

uses gw.api.system.PLDependenciesGateway
uses gw.api.util.DisplayableException
uses gw.api.util.LocaleUtil
uses gw.search.SearchCriteria

uses java.util.ArrayList
uses java.util.HashSet
uses java.util.List


/**
 * Enhanced search criteria for zones which further filters the search results.
 */
@Export
class PCZoneSearchCriteria extends SearchCriteria<Zone> {

  var _filterZoneType : ZoneType as FilterZoneType
  var _filterZoneName : String as FilterZoneName
  var _filterByCity : String as FilterByCity
  var _filterByCounty : String as FilterByCounty
  var _filterByZIP : String as FilterByZIP
  var _linkedZone : Zone as LinkedZone
  var _zoneType : ZoneType as ZoneType
  var _country : Country as Country
  
  /**
   * Constructor.
   * Initialize the geography to the default geography.
   */  
  construct() {
    if (!BaseAdminUtil.isDecentralizedAdminEnabled()) {
      Country = LocaleUtil.getUserDefaultCountry();
    }
  }
  
  
  /** 
   * Clears the filters of this search criteria.
   */
  function clearFilters() {
    FilterByCity = null
    FilterByCounty = null
    FilterByZIP = null
  }
  
  /**
   * Returns all the zone types relevant to the policy hold for the given country. This is used
   * to decide which zone types to show in the policy hold UI for building policy hold zones,
   * and hence determines which types of zone can be built using the UI.
   * <p>
   * The current implementation returns all the zone types that have a "granularity" specified
   * in the zone-config.xml file, in reverse granularity order (i.e. least specific first)
   *
   * @param country a non null country for which we need zone types
   * @return a non null list of zone types
   */  
  function getRelevantZoneTypesForCountry() : ArrayList<ZoneType> {
    if (Country == null) {
      throw new DisplayableException(displaykey.Web.Admin.PolicyHold.CountryNotDefined)
    }
    var all = PLDependenciesGateway.getZoneConfiguration().getZoneTypesOrderedByGranularity(Country)
    var result = new ArrayList<ZoneType>(all)
    result.reverse()
    result.remove(typekey.ZoneType.TC_COUNTRY)
    return result
  }

  override protected function doSearch() : Zone[] {
    FilterZoneName = null
    if (FilterZoneType == typekey.ZoneType.TC_CITY) {
      FilterZoneName = FilterByCity
    }
    if (FilterZoneType == typekey.ZoneType.TC_COUNTY) {
      FilterZoneName = FilterByCounty
    }
    if (FilterZoneType == typekey.ZoneType.TC_ZIP) {
      FilterZoneName = FilterByZIP
    }

    // use this.FilterZoneType and this.FilterZoneName to go one level deeper than this.LinkedZone
    if (LinkedZone != null and FilterZoneName != null) {
      var filteredLinkedZones = new HashSet<Zone>()
      // find zones that are linked to this.LinkedZone and is of type this.FilterZoneType and zone name starts with this.FilterZoneName
      // i.e. find counties that starts with a given name and are linked to a given state
      var filteredZones = Zone.finder.findZones(Country, LinkedZone.ZoneType, LinkedZone.Code, FilterZoneType, FilterZoneName)
      if (ZoneType == FilterZoneType) {
        filteredLinkedZones.addAll(filteredZones.toSet())
      } else {
        for (filteredZone in filteredZones) {

          filteredLinkedZones.addAll(Zone.finder.findZones(Country, filteredZone.ZoneType, filteredZone.Code, ZoneType).toSet())
        }
      }      
      return filteredLinkedZones.orderBy(\ z -> z.Code).toTypedArray()
    }
    
    if (LinkedZone != null and ZoneType <> LinkedZone.ZoneType) {
      var linkedZones = Zone.finder.findZones(Country, LinkedZone.ZoneType, LinkedZone.Code, ZoneType).toSet().orderBy(\ z -> z.Code)
      return linkedZones.toTypedArray()
    }
    
    var zones = Zone.finder.findZones(Country, ZoneType, null as String[]).toSet().orderBy(\ z -> z.Code)
    if (ZoneType <> LinkedZone.ZoneType) {
      return zones.toTypedArray()
    }
    var linkedZones = new ArrayList<Zone>()
    linkedZones.addAll(zones.where(\ z -> z.Code == LinkedZone.Code ))
    return linkedZones as entity.Zone[]
  }

  function getPossibleCountries() : List<Country> {
    var org = User.util.CurrentUser.Organization
    if (org == null) {
      org = User.util.UnrestrictedUser.Organization
    }
    return org.Countries
  }

  override protected property get HasMinimumSearchCriteria() : boolean {
    return MinimumSearchCriteriaMessage == null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    if (ZoneType == null) {
      return displaykey.Web.Admin.PolicyHold.RegionTypeMustBeSelected
    }
    if (Country == null) {
      return displaykey.Web.Admin.PolicyHold.CountryNotDefined
    }
    if (Country == typekey.Country.TC_US and ZoneType <> typekey.ZoneType.TC_STATE
        and LinkedZone == null) {
      return displaykey.Web.Admin.PolicyHold.NonStateRegionRequiresState
    }
    return null
  }

}
