package gw.admin

enhancement GroupSearchCriteriaEnhancement : GroupSearchCriteria
{

  /** This is the minimally acceptable information for a query
  */
  property get MinimumCriteriaForSearch() : boolean {  
    return this.Organization != null
      or this.GroupName != null
      or this.GroupNameKanji != null
      or this.GroupType != null 
      or this.Organization != null 
      or this.ParentGroup != null
      or this.ProducerCode != null
      or this.BranchSearch
  }

  /* This will check that the minimally acceptable information has been supplied
  * and perform the query
  * otherwize it will throw an exception
  */
  function validateAndSearch() : GroupQuery {
    if (this.MinimumCriteriaForSearch) {
      return this.performSearch()
   }
   throw new gw.api.util.DisplayableException(displaykey.Web.GroupSearch.NotEnoughInfo)
  }

  static function createBranchSearchCriteria() : GroupSearchCriteria {
    return createCriteria().asBranchSearch()
  }

  static function createCriteria() : GroupSearchCriteria {
    var rtn = new GroupSearchCriteria()
    if (User.util.CurrentUser.ExternalUser) {
      rtn.Organization = User.util.CurrentUser.Organization
    }
    rtn.ExcludeRootGroup = true
    return rtn
  }
}
