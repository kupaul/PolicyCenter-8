package gw.lob.common
uses gw.api.database.IQueryBeanResult
uses gw.search.EntitySearchCriteria

/**
 * A search criteria used for searching TaxLocation via the UI.
 */
@Export
class TaxLocationSearchCriteria extends EntitySearchCriteria<TaxLocation> {
  var _code : String as Code
  var _description : String as Description
  var _city : String as City
  var _state : Jurisdiction as State
  var _county : String as County
  var _taxLocationPrefix : String as TaxLocationPrefix
  var _effectiveOnDate : DateTime as EffectiveOnDate

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }

  override function doSearch() : IQueryBeanResult {
    return new TaxLocationQueryBuilder()
      .withCodeStarting(_code)
      .withDescriptionContained(_description)
      .withCityStarting(_city)
      .withState(_state)
      .withCountyContained(_county)
      .withTaxLocationPrefix(_taxLocationPrefix)
      .withEffectiveOnDate(_effectiveOnDate)
      .build().select()
  }


}
