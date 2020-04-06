package gw.policylocation

uses gw.api.database.IQueryBeanResult
uses gw.api.database.InOperation
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.database.Table
uses gw.api.system.PCConfigParameters
uses gw.api.productmodel.PolicyLinePattern
uses java.lang.IllegalArgumentException
uses java.lang.Integer
uses java.util.Set
uses java.util.Map
uses gw.api.database.Restriction
uses com.guidewire.pl.system.locale.PLDisplayKeys
uses com.guidewire.pl.domain.geodata.proximitysearch.ProximitySearchWithWideningRadius
uses gw.api.system.PLConfigParameters
uses gw.search.EntitySearchCriteria
uses com.guidewire.pl.system.database.query2.impl.ColumnRefInternal

@Export
class PolicyLocationSearchCriteria extends EntitySearchCriteria<PolicyLocation> {
  
  var _includeBoundPeriods : boolean as IncludeInForceBoundPeriods
  var _includeInProcessSubs : boolean as IncludeInProcessNewSubmissions
  var _sameAccount : boolean as LimitToSameAccount
  var _radius : Integer as Radius
  var _unit : typekey.UnitOfDistance as UnitOfDistance
  var _center : AccountLocation as CenterOfSearch
  var _lobs : Set<PolicyLinePattern>

  construct() {
    IncludeInForceBoundPeriods = true
    IncludeInProcessNewSubmissions = true
    LimitToSameAccount = false
    Radius = PCConfigParameters.DefaultProximitySearchRadius.Value
    UnitOfDistance = PCConfigParameters.DefaultProximitySearchUnitOfDistance.Value
    LOBs = {"BOPLine"}
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
  override protected function doSearch() : IQueryBeanResult {
    var query = Query.make(PolicyLocation)

    // Filter by policy period type / line of business.
    addPolicyPeriodRestrictions(query)

    // Filter by account / proximity.
    var locTable = addAccountLocationRestriction(query)
    if (locTable == null) {
      locTable = query.join("AccountLocation")
    }
    
    // assert address has been successfully geocoded
    if ( !CenterOfSearch.isSuccessfullyGeocoded() ) {
      throw new IllegalArgumentException( PLDisplayKeys.Java_ProximitySearch_Error_NonGeocodedCenter.localize() );  
    }

    var narrowestRadius = ProximitySearchWithWideningRadius.findNarrowestRadius(query, (locTable.getColumnRef("SpatialPoint")) as ColumnRefInternal, "PolicyLocation.AccountLocation.SpatialPoint",
        CenterOfSearch.SpatialPoint, this.UnitOfDistance, this.Radius, PLConfigParameters.ProximityRadiusSearchDefaultMaxResultCount.Value)
    query.withinDistance(locTable.getColumnRef("SpatialPoint"), "PolicyLocation.AccountLocation.SpatialPoint", 
        CenterOfSearch.SpatialPoint, narrowestRadius, this.UnitOfDistance)
    return query.select()
  }
  
  property get LOBs() : PolicyLinePattern[] {
    return _lobs.toTypedArray().sort()
  }
  
  property set LOBs(lobArray : PolicyLinePattern[]) {
    _lobs = lobArray.toSet()
  }
  
  public function addLob(lob : String) {
    _lobs.add(lob)
  }
  
  public function removeLob(lob : String) {
    _lobs.remove(lob)
  }
  
  //
  // PROTECTED FUNCTIONS
  //
  protected function prepareQuery(joinTables : Map<String, Table>) : Query<PolicyLocation> {
    if (this.Radius == null) {
      throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.NullArgument(displaykey.Java.ProximitySearch.Argument.Radius))
    }
    var query = Query.make(PolicyLocation)
    query.and(\ res -> {
      applyPolicyLocationRestrictions(res, joinTables)
    })
    return query
  }

  public function applyPolicyLocationRestrictions(res : Restriction, joinTables : Map<String, Table>) {
    addPolicyPeriodAndLOBRestrictions(res, joinTables)
    addAccountLocationRestrictions(res)
  }

  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  
  private function addPolicyPeriodRestrictions(query : Query<PolicyLocation>) {
    // The query must consist of in force bound policies, in process new submissions, or both (but not neither).
    var inForceBound = this.IncludeInForceBoundPeriods
    var inProcessSubs = this.IncludeInProcessNewSubmissions
    if (!inForceBound && !inProcessSubs) {
      throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.PolicyLocation.NoPeriodTypeSelected)
    }

    // The query should contain at least 1 line of business.
    var lobTypes = this.LOBs
    if (lobTypes.IsEmpty) {
      throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.PolicyLocation.EmptyLOBs)
    }

    var periodTable = query.join("BranchValue")
    periodTable.and(\ andRes -> {
      // Add line of business restriction.
      var lineTable = andRes.subselect("ID", InOperation.CompareIn, PolicyLine, "BranchValue")
      lineTable.compareIn("PatternCode", this.LOBs.map(\ lobType -> lobType.Code))

      // Add policy period type restrictions.
      andRes.or(\ orRes -> {
        if (inForceBound) {
          orRes.and(\ res -> {
            res.compare("ModelNumber", Relop.NotEquals, null)  // Bound
            res.compare("MostRecentModel", Relop.Equals, true) // In Force
          })
        }
        if (inProcessSubs) {
          orRes.and(\ res -> {
            // Filter down to just submissions.
            var jobTable = res.subselect("Job", InOperation.CompareIn, Job, "ID")
            jobTable.cast(Submission)

            // Filter down to just open jobs.
            res.compareIn("Status", PolicyPeriod.statuses.OpenPeriodStatusSet.toTypedArray())
          })
        }
      })
    })
  }

  private function addAccountLocationRestriction(query : Query<PolicyLocation>) : Table<PolicyLocation> {
    // This restriction is only applicable if SameAccountOnly is true.
    if (this.LimitToSameAccount) {
      var center = this.CenterOfSearch
      if (center == null) {
        throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.NullArgument(displaykey.Java.ProximitySearch.Argument.Center))
      }

      var account = center.Account
      if (account == null) {
        throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.PolicyLocation.NullCenter)
      }

      // Restrict on the same account only.
      var locTable = query.join("AccountLocation")
      var acctTable = locTable.join("Account")
      acctTable.compare("ID", Relop.Equals, account.ID)
      return locTable
    } else {
      return null
    }
  }  
  
  private function addPolicyPeriodAndLOBRestrictions(restriction : Restriction, joinTables : Map<String, Table>) {
    if (!IncludeInForceBoundPeriods && !IncludeInProcessNewSubmissions) {
      throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.PolicyLocation.NoPeriodTypeSelected)
    }
    if (_lobs.Empty) {
      throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.PolicyLocation.EmptyLOBs)
    }
    var periodTable = joinTables["BranchValue"]
    if (periodTable == null) {
      periodTable = restriction.join("BranchValue")
      joinTables["BranchValue"] = periodTable
    }
    periodTable.and(\ andRes -> {
      
      // Add line of business restriction.
      var lineTable = andRes.subselect("ID", InOperation.CompareIn, PolicyLine, "BranchValue")
      lineTable.compareIn("PatternCode", LOBs.map(\ p -> p.Code))

      // Add policy period type restrictions.
      andRes.or(\ orRes -> {
        if (IncludeInForceBoundPeriods) {
          orRes.and(\ res -> {
            res.compare("MostRecentModel", Relop.Equals, true) // In Force
            res.compare("ModelNumber", Relop.NotEquals, null)  // Bound
          })
        }
        if (IncludeInProcessNewSubmissions) {
          orRes.and(\ res -> {
            // Filter down to just submissions.
            var jobTable = res.subselect("Job", InOperation.CompareIn, Job, "ID")
            jobTable.cast(Submission)

            // Filter down to just open jobs.
            var openStatuses = com.guidewire.pc.domain.policy.period.impl.PolicyPeriodImpl.statuses.getOpenPeriodStatusSet()
            res.compareIn("Status", openStatuses.toArray(new PolicyPeriodStatus[openStatuses.size()]))
          })
        }
      })
    })
  }

  private function addAccountLocationRestrictions(restriction : Restriction) {
    // This restriction is only applicable if SameAccountOnly is true.
    if (LimitToSameAccount) {
      if (CenterOfSearch == null) {
        throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.NullArgument(displaykey.Java.ProximitySearch.Argument.Center))
      }

      var account = CenterOfSearch.Account
      if (account == null) {
        throw new IllegalArgumentException(displaykey.Java.ProximitySearch.Error.PolicyLocation.NullCenter)
      }

      // Restrict on the same account only.
      var locTable = restriction.join("AccountLocation")
      var acctTable = locTable.join("Account")
      acctTable.compare("ID", Relop.Equals, account.ID)
    }
  }

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    if (this.Radius == null) {
      return displaykey.Java.ProximitySearch.Error.NullArgument(displaykey.Java.ProximitySearch.Argument.Radius)
    }
    if ( CenterOfSearch == null ) {
       return PLDisplayKeys.Java_ProximitySearch_Error_NullArgument.localize( { PLDisplayKeys.Java_ProximitySearch_Argument_Center.localize() } )
    }
    return null
  }

}
