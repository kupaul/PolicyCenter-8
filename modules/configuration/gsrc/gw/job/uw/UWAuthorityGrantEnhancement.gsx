package gw.job.uw

uses gw.api.util.DisplayableException

enhancement UWAuthorityGrantEnhancement : entity.UWAuthorityGrant {

  /**
   * Does this grant authorize approvals for the given value?
   */
  function authorizes(issueValue : String) : boolean {
    return ComparatorWrapper.compare(issueValue, this.Value)
  }
  
  /**
   * Returns the appropriate wrapper around this grant's comparator.  If this
   * grant has no comparator (since the issue type doesn't allow for one), this
   * will return the Any comparator.
   */
  property get ComparatorWrapper() : UWIssueValueComparatorWrapper {
    return UWIssueValueComparatorWrapper.wrap( this.ComparisonType )  
  }

  /**
   * Returns the Type field converted to a displayable String.  This method is intended to be used within
   * the UI for displaying and editing authority profiles.
   */
  property get IssueTypeAsString() : String {
    return this.IssueType.DisplayName  
  }
  
  /**
   * The property setter will attempt to match the String passed in first by treating it as a typekey code,
   * then by searching for an issue by name, and lastly searching by description.  If the arg corresponds to
   * a code for a typekey that's already present, an exception will be thrown; otherwise, the Type property
   * will be set.  Next, we'll attempt to search by name; the search is a contains serach that's case-insensitive,
   * and existing issue types will be filtered out of the results.  If exactly one issue type matches, the
   * Type property will be set to it.  If multiple issue types match, an exception will be thrown.  If no issue types
   * match we'll proceed to searching by descriptiong, which works the same way as the search by name.  If
   * that search matches one item, the Type will be set, and if it matches 0 or many items an exception will be thrown.
   * This property is only intended to be used by the UI for editing authority profiles.
   */
  property set IssueTypeAsString(arg : String) {
    var existingTypes = this.UWAuthorityProfile.Grants.map(\g -> g.IssueType).toSet()
    
    var keyFromCode = UWIssueType.finder.findUWIssueTypeByCode( arg )
    if (keyFromCode != null) {
      if (existingTypes.contains( keyFromCode )) {
        throw new DisplayableException(displaykey.Admin.UWAuthorityGrantEnhancement.IssueTypeAsString.CodeAlreadyInUse( arg )) 
      } else {
        this.IssueType = keyFromCode  
      }
    } else {
      // Time to do a search
      var matchingTypes = UWIssueType.finder.findUWIssueTypesByNameAndDescriptionWithExclusions( arg, null, existingTypes )
      if (matchingTypes.size() == 1) {
        this.IssueType = matchingTypes[0]
      } else if (matchingTypes.size() > 1){
        throw new DisplayableException(displaykey.Admin.UWAuthorityGrantEnhancement.IssueTypeAsString.MultipleMatches( arg ))    
      } else { 
        matchingTypes = UWIssueType.finder.findUWIssueTypesByNameAndDescriptionWithExclusions( null, arg, existingTypes )
        if (matchingTypes.size() == 1) {
          this.IssueType = matchingTypes[0]
        } else if (matchingTypes.size() > 1){
          throw new DisplayableException(displaykey.Admin.UWAuthorityGrantEnhancement.IssueTypeAsString.MultipleMatches( arg ))
        } else if (matchingTypes.size() == 0) {
          throw new DisplayableException(displaykey.Admin.UWAuthorityGrantEnhancement.IssueTypeAsString.NoMatches( arg ))
        }
      }
    }
  }
  
}
