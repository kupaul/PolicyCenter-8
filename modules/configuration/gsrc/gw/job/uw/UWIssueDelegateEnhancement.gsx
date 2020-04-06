package gw.job.uw

uses gw.api.util.LocaleUtil

/**
 * Enhancement methods common to UWIssue and UWReferralReason
 */
enhancement UWIssueDelegateEnhancement : entity.UWIssueDelegate {
  
  function canBeApprovedBy(authorityProfiles : UWAuthorityProfile[]) : boolean {
    return valueCanBeApprovedBy(authorityProfiles, this.Value)
  }

  function valueCanBeApprovedBy(authorityProfiles : UWAuthorityProfile[], value : String) : boolean {
    var applicableGrants =  authorityProfiles.flatMap(
        \ profile -> profile.Grants.where( \ grant -> grant.IssueType == this.IssueType))
    return applicableGrants.hasMatch( \ grant -> grant.authorizes(value))
  }

  property get FormattedValue() : String {
    return this.IssueType.formatValue(this.Value)
  }

  property get FormattedValueAsCondition() : String {
    return this.IssueType.formatValueAsCondition(this.Value)
  }

  /**
   * Set all localized variants of the ShortDescription and LongDescription
   *    for this issue delegate by evaluating the specified blocks in the
   *    context of each localization defined by the system.
   */
  function setDescriptions(shortDescription : block() : String,
      longDescription : block() : String) {
    //FIXME: This is not cool....
    var allLanguages = LocaleUtil.getAllLanguages()
    if ( allLanguages.Count == 1 ) {
      this.setDescriptions(shortDescription(), longDescription())
    } else {
      for ( var language in allLanguages.map(\ l -> LocaleUtil.toLanguage(l)) ) {
       
        LocaleUtil.runAsCurrentLocaleAndLanguage(language, language,
           \ -> { this.setDescriptions(shortDescription(), longDescription()) })
      }
    }
  }

  /**
   * Set the ShortDescription and LongDescription for this issue delegate.
   *
   * Note:  This sets the values for the localized context beneath which
   * this is currently executing.  The caller must ensure that those values
   * are appropriate for that locale (i.e., are localized for that locale.)
   */
  function setDescriptions(shortDescription : String, longDescription : String) {
    this.ShortDescription = shortDescription
    this.LongDescription = longDescription
  }
}
