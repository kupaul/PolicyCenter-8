package gw.admin

enhancement ProducerCodeSearchCriteriaEnhancement : ProducerCodeSearchCriteria {
    /** This is the minimally acceptable information for a query
  */
  property get MinimumCriteriaForSearch() : boolean {
    return  this.Branch != null or
            this.BranchCode != null or
            this.Code != null or
            this.Description != null or
            this.ParentCode != null or
            this.Producer != null or
            this.ProducerUser != null or
            this.State != null or
            this.Status != null or
            this.MissingPrefUW or
            this.StatusUse != null or
            this.PrefUW != null
  }

  /* This will check that the minimally acceptable information has been supplied
  * and perform the query
  * otherwise it will throw an exception
  */
  function validateAndSearch() : ProducerCodeQuery {
    if (this.MinimumCriteriaForSearch) {
      return this.performSearch()
   }
   throw new gw.api.util.DisplayableException(displaykey.Web.ProducerCodeSearch.NotEnoughInfo)
  }

  static function createCriteria(org : Organization) : ProducerCodeSearchCriteria {
    var c = new ProducerCodeSearchCriteria()
    if ( (!User.util.CurrentUser.ExternalUser) && (!perm.System.userviewall)) {
      c.FilterByUserSecurityZones = true
    }
    if (User.util.CurrentUser.ExternalUser) {
      c.Producer = User.util.CurrentUser.Organization
    } else if ( ( org != null ) and !org.Carrier ) {
      c.Producer = org
    }
    return c
  }

}
