package gw.systables

uses gw.api.util.DisplayableException
uses java.util.Date
uses gw.lob.common.TaxLocationQueryBuilder
uses gw.api.database.IQueryBeanResult

enhancement TaxLocationEnhancement : TaxLocation {

  /** 
   * Finds tax locations based on the given search criteria. 
   * 
   * @return an array of TaxLocations for the given criteria
   */
  @Deprecated("Deprecated in PolicyCenter 8.0.  Use gw.lob.common.TaxLocationSearchCriteria.gs for UI functionality or gw.lob.common.TaxLocationQueryBuilder.gs for domain instead.")
  static function executeSearch(criteria: TaxLocationSearchCriteria): TaxLocation[] {
    var qp = new TaxLocationQueryBuilder()
      .withCodeStarting(criteria.Code)
      .withCityStarting(criteria.City)
      .withCountyContained(criteria.County)
      .withDescriptionContained(criteria.Description)
      .withEffectiveOnDate(criteria.EffectiveOnDate)
      .withTaxLocationPrefix(criteria.TLPrefix)
      .withState(criteria.State)
      .build().select() as IQueryBeanResult<TaxLocation>
    return qp.toTypedArray()
  }

  /**
   * Finds a tax location based on the given tax location code, state, and effective on date. 
   * 
   * @return the tax location for the given criteria 
   */
  @Deprecated("Deprecated in PolicyCenter 8.0.  Use gw.lob.common.TaxLocationSearchCriteria.gs for UI functionality or gw.lob.common.TaxLocationQueryBuilder.gs for domain instead.")
  static function executeSearch(code: String, state: Jurisdiction, EffectiveOnDate: Date): TaxLocation {
    if (code == null) {
      return null
    } else {
      var locs = new TaxLocationQueryBuilder()
          .withCodeStarting(code)
          .withState(state)
          .withEffectiveOnDate(EffectiveOnDate)
          .build().select() as IQueryBeanResult<TaxLocation>
      if (locs.Count == 1) {
        return locs.FirstResult
      } else {
        throw new DisplayableException(displaykey.TaxLocation.Search.Error.InvalidCode(code, state.Description))
      }
    }
  }
}
