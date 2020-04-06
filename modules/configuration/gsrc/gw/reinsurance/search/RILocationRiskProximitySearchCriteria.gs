package gw.reinsurance.search

uses gw.api.database.Query
uses gw.api.database.Table
uses java.lang.IllegalArgumentException
uses java.util.Date
uses java.util.Map
uses gw.api.util.DateUtil
uses gw.policylocation.PolicyLocationSearchCriteria
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Relop
uses com.guidewire.pl.domain.geodata.proximitysearch.ProximitySearchWithWideningRadius
uses gw.api.system.PLConfigParameters
uses gw.search.EntitySearchCriteria
uses com.guidewire.pl.system.database.query2.impl.ColumnRefInternal

@Export
class RILocationRiskProximitySearchCriteria extends EntitySearchCriteria<LocationRisk> {

  private var _locSearchCriteria : PolicyLocationSearchCriteria as LocSearchCriteria

  var _effDate : Date
  var _covGroup : typekey.RICoverageGroupType as CoverageGroup
  var _locationRisk : LocationRisk
  
  construct() {
    _locSearchCriteria = new PolicyLocationSearchCriteria()
    _locSearchCriteria.LOBs = {}
    _locSearchCriteria.IncludeInProcessNewSubmissions = false
    EffectiveDate = Date.Today
  }
  
  property get EffectiveDate() : Date {
    return _effDate
  }
  
  property set EffectiveDate(date : Date) {
    _effDate = DateUtil.endOfDay(date)
  }
  
  property get LocationRiskCenter() : LocationRisk {
    return _locationRisk
  }
  
  property set LocationRiskCenter(lr : LocationRisk) {
    _locationRisk = lr
    _locSearchCriteria.CenterOfSearch = lr.AccountLocation
  }
  
  @Throws(IllegalArgumentException,
              "If <code>LOBs</code> is empty, or any of <code>LocationRiskCenter</code>, <code>CoverageGroup</code>, <code>Radius</code>, or "
              + "<code>UnitOfDistance</code> is <code>null</code>.")
  public function findLocationRisks() : LocationRisk[] {
    return doSearch().toList().cast(LocationRisk).toTypedArray()
  }

  /**
   * Performs a search based on this PolicyLocationSearchCriteria's settings.
   * <p/>
   * The search criteria settings will cause the resulting query to include locations as follows:
   * <ol>
   * <li>Locations related to policy periods that have a policy line with a pattern in <code>LOBs</code>.</li>
   * <li>If <code>IncludeInForceBoundPeriods</code> is true, locations related to any bound, in force policies.</li>
   * <li>If <code>IncludeInProcessNewSubmissions</code> is true, locations related to any open submission jobs.</li>
   * <li>If <code>LimitToSameAccount</code> is true, only locations related to the CenterOfSearch's account.</li>
   * <li>Locations within <code>Radius</code> distance (in terms of <code>UnitOfDistance</code> units) from <code>CenterOfSearch</code>.</li>
   * </ol>
   */
  @Throws(IllegalArgumentException,
              "If neither <code>IncludeInForceBoundPeriods</code> nor <code>IncludeInProcessNewSubmissions</code> is <code>true</code>, "
              + "<code>LOBs</code> is empty, any of <code>CenterOfSearch</code>, <code>Radius</code>, or "
              + "<code>UnitOfDistance</code> is <code>null</code>, or <code>CenterOfSearch</code> is not associated with any "
              + "Account (when <code>LimitToSameAccount</code> is <code>true</code>) or not sufficiently geocoded for the search.")
  override protected function doSearch() : IQueryBeanResult<LocationRisk> {
    var q = prepareQuery({})
    var table = q.join("AccountLocation")
    var centerOfSearch = _locSearchCriteria.CenterOfSearch.SpatialPoint


    var narrowestRadius = ProximitySearchWithWideningRadius.findNarrowestRadius(q, (table.getColumnRef("SpatialPoint")) as ColumnRefInternal,
        "LocationRisk.AccountLocation.SpatialPoint",
        centerOfSearch, _locSearchCriteria.UnitOfDistance, _locSearchCriteria.Radius, PLConfigParameters.ProximityRadiusSearchDefaultMaxResultCount.Value)
    q.withinDistance(table.getColumnRef("SpatialPoint"), "LocationRisk.AccountLocation.SpatialPoint", 
                     centerOfSearch, narrowestRadius, _locSearchCriteria.UnitOfDistance)
    return q.select()
  }
  
  //
  // PROTECTED FUNCTIONS
  //
  protected function prepareQuery(joinTables : Map<String, Table>) : Query<LocationRisk> {
    var query = Query.make(LocationRisk)
    query.and(\ locRiskRes -> {
      if (CoverageGroup != null) {
        locRiskRes.subselect("RiskNumber", CompareIn, Reinsurable, "RiskNumber")
                    .compare("CoverageGroup", Equals, CoverageGroup)
      }

      locRiskRes.or(\ effDateOr -> {
        effDateOr.compare("EffectiveDate", Equals, null)
        effDateOr.compare("EffectiveDate", LessThanOrEquals, _effDate)
      })
      
      locRiskRes.or(\ expDateOr -> {
        expDateOr.compare("ExpirationDate", Equals, null)
        expDateOr.compare("ExpirationDate", GreaterThan, _effDate)
      })
      
      locRiskRes.compare("Fixed", Relop.NotEquals, LocationRiskCenter.FixedId)
      
      _locSearchCriteria.applyPolicyLocationRestrictions(locRiskRes, joinTables)
    })

    addCombinedRiskRestrictions(joinTables)
    return query.withLogSQL(true)
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //  

  private function addCombinedRiskRestrictions(joinTables : Map<String, Table>) {
    var periodTable = joinTables["BranchValue"]
    periodTable.and(\ restriction -> {
      restriction.compare("MostRecentModel", Equals, true)
      restriction.compare("PeriodStart", LessThanOrEquals, EffectiveDate)
      restriction.compare("PeriodEnd", GreaterThan, EffectiveDate)
      restriction.or(\ orRes -> {
        orRes.compare("CancellationDate", Equals, null)
        orRes.compare("CancellationDate", GreaterThan, EffectiveDate)
      })
    })
  }

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }

}
