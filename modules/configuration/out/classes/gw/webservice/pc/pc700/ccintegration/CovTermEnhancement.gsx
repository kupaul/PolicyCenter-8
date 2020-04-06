package gw.webservice.pc.pc700.ccintegration
uses java.lang.StringBuilder

@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.CovTermEnhancement instead")
enhancement CovTermEnhancement : gw.api.domain.covterm.CovTerm {
  /**
   * Unique external id for CC.
   */
  @Deprecated("Deprecated in PolicyCenter 8.0.  Enhancements should not be used for API code since API code is versioned and can have multiple copies, which isn't allowed for enhancements.")
  property get TypeIDString() : String{
    var idString = new StringBuilder()
    idString.append(this.Clause.TypeIDString).append(".").append(this.PatternCode)
    return idString.toString()
  }
}
