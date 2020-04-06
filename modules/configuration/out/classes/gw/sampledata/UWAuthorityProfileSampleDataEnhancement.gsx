package gw.sampledata

enhancement UWAuthorityProfileSampleDataEnhancement : entity.UWAuthorityProfile {
  
  function inheritGrantsFrom(other : UWAuthorityProfile) : UWAuthorityProfile {
    var myGrantIssueTypes = this.Grants.map(\ grant -> grant.IssueType.Code).toSet()
    var grantsToAdd = other.Grants.where( \ theirGrant -> not myGrantIssueTypes.contains(theirGrant.IssueType.Code))
    for (grant in grantsToAdd) {
      var copy = new UWAuthorityGrant(this){
        :ApproveAnyValue = grant.ApproveAnyValue,
        :IssueType = grant.IssueType,
        :Value = grant.Value
      }
      this.addToGrants(copy)
    }
    return this
  }

}
