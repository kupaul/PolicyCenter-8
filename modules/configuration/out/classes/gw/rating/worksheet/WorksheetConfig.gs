package gw.rating.worksheet

@Export
class WorksheetConfig {
  /**
   * If true, each WorksheetEntry in a Worksheet will include an attribute with the name "Timestamp"
   * @see(gw.rating.worksheet.domain.WorksheetEntry)
   */
  static property get IncludeTimestamps() : boolean {
    return false
  }

  /**
   * If true, each WorksheetEntry in a Worksheet will include pseudoCode in it's Comment attribute.
   * @see(gw.rating.worksheet.domain.WorksheetEntry@pseudoCode)
   */
  static property get IncludePseudoCodeAsComment() : boolean {
    return false
  }
}