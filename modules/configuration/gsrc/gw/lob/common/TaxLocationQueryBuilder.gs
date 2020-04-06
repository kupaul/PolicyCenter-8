package gw.lob.common
uses gw.search.EntityQueryBuilder
uses gw.api.database.ISelectQueryBuilder
uses gw.api.effdate.EffDatedFinderUtil
uses gw.search.StringColumnRestrictor

/**
 * Class that constructs select query builder for TaxLocation entity.
 */
@Export
class TaxLocationQueryBuilder extends EntityQueryBuilder<TaxLocation> {
  var _code : String
  var _codeRestrictor : StringColumnRestrictor
  var _description : String
  var _city : String
  var _state : Jurisdiction
  var _county : String
  var _taxLocationPrefix : String
  var _effectiveOnDate : DateTime

  /**
   * Restricts the query to only those tax locations where their code starting with the specified code.
   * @param code the tax location code to match with
   * @return instance of this class
   * @see #withCode(java.lang.String)
   */
  function withCodeStarting(code : String) : TaxLocationQueryBuilder {
    _code = code
    _codeRestrictor = StartsWithIgnoringCase
    return this
  }

  /**
   * Restricts the query to only those tax locations where their code matching with the specified code.
   * @param code the tax location code to match with
   * @return instance of this class
   * @see #withCodeStarting(java.lang.String)
   */
  function withCode(code : String) : TaxLocationQueryBuilder {
    _code = code
    _codeRestrictor = Equals
    return this
  }

  /**
   * Restricts the query to only those tax locations where their description contains the specified description.
   * @param description the description to match with
   * @return instance of this class
   */
  function withDescriptionContained(description : String) : TaxLocationQueryBuilder {
    _description = description
    return this
  }

  /**
   * Restricts the query to only those tax locations where their city name starting with the city specified.
   * @param city the city to match with
   * @return instance of this class
   */
  function withCityStarting(city : String) : TaxLocationQueryBuilder {
    _city = city
    return this
  }

  /**
   * Restricts the query to only those tax locations where their state matches with the jurisdiction specified.
   * @param jurisdiction the jurisdiction to match with
   * @return instance of this class
   */
  function withState(jurisdiction : Jurisdiction) : TaxLocationQueryBuilder {
    _state = jurisdiction
    return this
  }

  /**
   * Restricts the query to only those tax locations where their county name contains the specified county.
   * @param county the county to match with
   * @return instance of this class
   */
  function withCountyContained(county : String) : TaxLocationQueryBuilder {
    _county = county
    return this
  }

  /**
   * Restricts the query to only those tax locations where their prefix matches with the specified tax location prefix.
   * @param prefix the tax location prefix to match with
   * @return instance of this class
   */
  function withTaxLocationPrefix(prefix : String) : TaxLocationQueryBuilder {
    _taxLocationPrefix = prefix
    return this
  }

  /**
   * Restricts the query to only those tax locations which are effective as of the specified date.
   * @param effectiveOnDate the date tax location should be effective on
   * @return instance of this class
   */
  function withEffectiveOnDate(effectiveOnDate : DateTime) : TaxLocationQueryBuilder {
    _effectiveOnDate = effectiveOnDate
    return this
  }

  override protected function doRestrictQuery(selectQueryBuilder : ISelectQueryBuilder) {
    if (_code != null) {
      _codeRestrictor.restrict(selectQueryBuilder, TaxLocation#Code.PropertyInfo.Name, _code)
    }
    if (_description != null) {
      selectQueryBuilder.contains(TaxLocation#Description.PropertyInfo.Name, _description, true) 
    }
    if (_city != null) {
      selectQueryBuilder.startsWith(TaxLocation#City.PropertyInfo.Name, _city, true)  
    }
    if (_state != null) {
      selectQueryBuilder.compare(TaxLocation#State.PropertyInfo.Name, Equals, _state)
    }
    if (_county != null) {
      selectQueryBuilder.contains(TaxLocation#County.PropertyInfo.Name, _county, true) 
    }
    if (_taxLocationPrefix != null) {
      selectQueryBuilder.compare(TaxLocation#TLPrefix.PropertyInfo.Name, Equals, _taxLocationPrefix)  
    }
    if (_effectiveOnDate != null) {
      EffDatedFinderUtil.addRestrictionsForEffectiveOnDate(selectQueryBuilder, _effectiveOnDate)
    }
  }

}
