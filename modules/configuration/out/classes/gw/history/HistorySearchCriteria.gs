package gw.history
uses java.util.Date
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.database.DBDateRange
uses gw.api.util.DisplayableException
uses java.util.ArrayList
uses gw.api.database.IQueryBeanResult
uses gw.search.EntitySearchCriteria
uses java.lang.IllegalStateException

@Export
class HistorySearchCriteria extends EntitySearchCriteria<History> {
  var _fromDate : Date as FromDate
  var _toDate : Date as ToDate
  var _user : User as User
  var _searchRelatedTo : Object as RelatedItem
  
  /**
   * Creates a query that returns History events matching all of the non-null search criteria
   * fields provided. In other words, the search criteria fields are and-ed together. An exception
   * is thrown if the FromDate and ToDate are both specified but the FromDate is later.
   */
  override protected function doSearch() : IQueryBeanResult<History> {
   
    var query = Query.make(History)  
      
    if (FromDate != null or ToDate != null) 
      query.compare("EventTimestamp", new DBDateRange(FromDate, ToDate, true));
      
    if (User != null) 
      query.compare("User", Relop.Equals, User);
  
    if (RelatedItem typeis Account) {
      query.compare("Account", Relop.Equals, RelatedItem);
    } else if (RelatedItem typeis Policy) {
      query.compareIn("PolicyTerm", RelatedItem.Periods*.PolicyTerm)
    } else if (RelatedItem typeis PolicyTerm) {
      query.compare("PolicyTerm", Relop.Equals, RelatedItem);
    } else if (RelatedItem typeis Job) {
      query.compare("Job", Relop.Equals, RelatedItem);
    } else if (RelatedItem typeis PolicyPeriod) {
      query.compare("PolicyPeriod", Relop.Equals, RelatedItem);
    } else
      throw new DisplayableException(displaykey.Web.History.RelatedToTypeNotSupported)
    
    return query.select()
  }


  function getRelatedToSearchCriteriaForAccount(acct : Account) : Object[] {
    var relatedToItems = new ArrayList<Object>()
    relatedToItems.add(acct)
    for (policy in Policy.finder.findLocalPoliciesByAccount(acct).orderBy(\ pol -> pol.CreateTime)) {
       relatedToItems.addAll(getRelatedToSearchCriteriaForPolicy(policy).toList())
    }
    return relatedToItems.toTypedArray()
  }

  function getRelatedToSearchCriteriaForPolicy(policy : Policy) : Object[] {
    var relatedToItems = new ArrayList<Object>()
    relatedToItems.add(policy)  //policy will get converted into policy terms when building the search criteria
    relatedToItems.addAll(policy.Jobs.sort(\ j1, j2 -> compareJobs(j1,j2)) as java.util.Collection<java.lang.Object>) // add the jobs for each policy
    return relatedToItems.toTypedArray()
  }
  
  function compareJobs(j1 : Job, j2 : Job) : boolean {
    if(j1.CreateTime < j2.CreateTime) {
      return true
    } else if(j1.CreateTime > j2.CreateTime) {
      return false
    } else {
      return (j1.DisplayType < j2.DisplayType)
    }
  }

  function getLevelDisplayString(value : Object) : String {
    if(value typeis Account) {
      return displaykey.Web.History.AccountLevelNote(value)
    } else if (value typeis Policy) {
      var period = entity.Policy.finder.findPolicyPeriodByPolicyAndAsOfDate(value, DateTime.Today)
      if (period == null) {
        period = value.Periods.last()
      }
      return displaykey.Web.History.PolicyLevel(period.PolicyNumber, value.Product.DisplayName)
    } else if (value typeis Job) {
      return getJobDisplayString(value)
    } else if (value typeis PolicyTerm) {
      return getTermDisplayString(value)
    } else {
      return displaykey.Web.History.UnknownLevel
    }
  }
    
  private static function getJobDisplayString(job : Job) : String {
    var effectiveDate = job.LatestPeriod.EditEffectiveDate
    var dateOrStatus = effectiveDate == null ? job.DisplayStatus : effectiveDate as String
    return displaykey.Web.History.JobLevel(job.DisplayType, job.JobNumber, dateOrStatus)
  }
  
   private static function getTermDisplayString(term : PolicyTerm) : String {
    return term.CreateTime as String
  }
  

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    if (RelatedItem == null) {
      return displaykey.Web.History.RelatedToIsNull
    }
    if (FromDate != null and ToDate != null and FromDate > ToDate) {
      return displaykey.Web.History.FromDateNotBeforeUntilDate
    }
    return null
  }

}
