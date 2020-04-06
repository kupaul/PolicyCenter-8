package gw.job.uw

uses gw.api.database.Query

enhancement UWAuthorityProfileEnhancement : entity.UWAuthorityProfile {

  /**
   * Creates a new UWAuthorityProfile with the same set of grants as this profile.  The
   * name and description will be null on the cloned grant, and the clone will be created in
   * this grant's bundle.
   */
  function cloneProfile() : UWAuthorityProfile {
    var clonedProfile = new UWAuthorityProfile(this)
    for (grant in this.Grants) {
      var clonedGrant = new UWAuthorityGrant(this){
        :IssueType = grant.IssueType,
        :ApproveAnyValue = grant.ApproveAnyValue,
        :Value = grant.Value
      }
      clonedProfile.addToGrants( clonedGrant )  
    }
    return clonedProfile  
  }

  /**
   * Deletes this UWAuthorityProfile.
   */
  function delete() {
    gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
      var q = Query.make( UserAuthorityProfile )
      q.compare( "UWAuthorityProfile", Equals, this )
      for (userAuthProfile in q.select().toList()) {
        var user = bundle.add(userAuthProfile.User)
        user.removeFromUserAuthorityProfiles(userAuthProfile)
      }
      bundle.delete(this)
    })
  }
}
