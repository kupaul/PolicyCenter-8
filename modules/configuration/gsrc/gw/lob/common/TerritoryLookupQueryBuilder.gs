package gw.lob.common
uses gw.api.database.ISelectQueryBuilder
uses java.util.Date
uses gw.api.effdate.EffDatedFinderUtil
uses gw.search.EntityQueryBuilder

/**
 * Class that constructs select query builder for DBTerritory entity and adds restrictions(where clause).
 */
@Export
class TerritoryLookupQueryBuilder extends EntityQueryBuilder<DBTerritory> {
  var _city : String
  var _county : String
  var _postalCode : String
  var _code : String
  var _description : String
  var _policyLinePatternCode : String
  var _effectiveOnDate : Date  
  var _state : Jurisdiction

  /**
   * Restricts the query to those territories where their city starting with the specified city
   * or territories with no city.
   * @param city the territory code to match with
   * @return instance of this class
   */
  function withCity(city : String) : TerritoryLookupQueryBuilder {
    _city = city
    return this
  }

  /**
   * Restricts the query to territories where their county name contains the specified county name.
   * @param county the county name to match with
   * @return instance of this class
   */
  function withCounty(county : String) : TerritoryLookupQueryBuilder {
    _county = county
    return this
  }

  /**
   * Restricts the query to only those territories where their postal code starting with the specified postal code
   * or territories with no postal code.
   * @param postalCode the territory postal code to match with
   * @return instance of this class
   */
  function withPostalCode(postalCode : String) : TerritoryLookupQueryBuilder {
    _postalCode = postalCode
    return this
  }

  /**
   * Restricts the query to only those territories where their code starting with the specified code.
   * @param code the territory code to match with
   * @return instance of this class
   */
  function withCode(code : String) : TerritoryLookupQueryBuilder {
    _code = code
    return this
  }

  /**
   * Restricts the query to territories where their description contains the specified description.
   * @param description the description to match with
   * @return instance of this class
   */
  function withDescription(description : String) : TerritoryLookupQueryBuilder {
    _description = description
    return this
  }

  /**
   * Restricts the query to territories where their policy line pattern code matches the specified pattern code.
   * @param policyLinePatternCode the policy line pattern code to match with
   * @return instance of this class
   */
  function withPolicyLinePatternCode(policyLinePatternCode : String) : TerritoryLookupQueryBuilder {
    _policyLinePatternCode = policyLinePatternCode
    return this
  }
  /**
   * Restricts the query to only those territories which are effective as of the specified date.
   * @param effectiveOnDate the date territory should be effective on
   * @return instance of this class
   */
  function withEffectiveOnDate(effectiveOnDate : Date) : TerritoryLookupQueryBuilder {
    _effectiveOnDate = effectiveOnDate
    return this
  }

  /**
   * Restricts the query to only those territories where their state matches with the state/jurisdiction specified.
   * @param state the state to match with
   * @return instance of this class
   */
  function withState(state : Jurisdiction) : TerritoryLookupQueryBuilder {
    _state = state
    return this
  }
      
  override protected function doRestrictQuery(selectQueryBuilder : ISelectQueryBuilder) {
    if (_state != null) {
      selectQueryBuilder.compare("State", Equals, _state)
    }
    if (_policyLinePatternCode != null) {
      selectQueryBuilder.compare("PolicyLinePatternCode", Equals, _policyLinePatternCode)
    }
    if (_effectiveOnDate != null) {
      EffDatedFinderUtil.addRestrictionsForEffectiveOnDate(selectQueryBuilder, _effectiveOnDate)
    }
    if (_county != null) {
      selectQueryBuilder.contains("County", _county, true)
    }
    if (_description != null) {
      selectQueryBuilder.contains("Description", _description, true)
    }
    if (_city != null and _postalCode != null) {
      selectQueryBuilder.and(\ andRestriction -> andRestriction
        .or(\ cityRestriction -> {
          cityRestriction.startsWith("City", _city, true)
          cityRestriction.compare("City", Equals, null)
        })
        .or(\ postalCodeRestriction -> {
          postalCodeRestriction.startsWith("PostalCode", _postalCode, true)
          postalCodeRestriction.compare("PostalCode", Equals, null)    
        })
      )
    } else if (_city != null) {
      selectQueryBuilder.or(\ restriction -> {
        restriction.startsWith("City", _city, true)
        restriction.compare("City", Equals, null)
      })
    } else if (_postalCode != null) {
      selectQueryBuilder.or(\ restriction -> {
        restriction.startsWith("PostalCode", _postalCode, true)
        restriction.compare("PostalCode", Equals, null)
      })
    }
    if (_code != null) {
      selectQueryBuilder.startsWith("Code", _code, true)
    }
  }
  
}
