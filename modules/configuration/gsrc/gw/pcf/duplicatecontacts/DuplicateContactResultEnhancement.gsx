package gw.pcf.duplicatecontacts

uses gw.plugin.contact.DuplicateContactResult

enhancement DuplicateContactResultEnhancement : DuplicateContactResult {
  
  property get MatchType() : String {
    return this.ExactMatch
        ? displaykey.Web.DuplicateContactsPopup.MatchType.Exact
        : displaykey.Web.DuplicateContactsPopup.MatchType.Potential
  }
}
