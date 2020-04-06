package gw.lob.multiline

@Export
class CPPQuotePage {

  /**
   * Determines CPP quote page length given a policy period.
   * Sums up the page length calculated for each policy line within the given policy period.
   * Default policy line is calculated based on {@link entity.Cost} * 3 + all {@link entity.Coverable} * 4.
   * CPLine is calculated based on all {@link entity.CPLocation} * 5 + all {@link entity.CPBuilding} * 1.
   * GLLine is calculated based on all {@link entity.GLExposure} * 2 + all {@link entity.PolicyLocation} (GL exposures' locations) * 5 + 9.
   *
   * @param period PolicyPeriod
   * @return An integer representing the page length of the CPP quote page
   *
  */
  static function cppQuotePageLength(period : PolicyPeriod) : int {
    var pagelength = 0
    for (line in period.VersionList.Lines.map( \ aline -> aline.AllVersions.last() ) ) {
      switch (line.PatternCode) {
        case "CPLine" :
          pagelength = pagelength + ((line as CPLine).CPLocations.Count * 5) + ((line as CPLine).CPLocations*.Buildings.Count * 1)
          break
        case "GLLine" :
          pagelength = pagelength + ((line as GLLine).Exposures.Count * 2) 
                  + ((line as GLLine).Exposures*.Location.Count * 5) + 9
          break
        default :
          pagelength = pagelength + (line.Costs.Count * 3) + (line.AllCoverables.Count * 4)
      }
    }
    return pagelength
  }
}
