package gw.lob.common
uses gw.lang.Export
uses entity.RiskClass
uses java.lang.String
uses gw.search.EntityQueryBuilder
uses gw.api.database.ISelectQueryBuilder
uses gw.search.StringColumnRestrictor

/**
 * Class that constructs select query builder for RiskClass entity.
 */
@Export
class RiskClassQueryBuilder extends EntityQueryBuilder<RiskClass> {
  var _coveragePatternCode : String
  var _description : String
  var _descriptionRestrictor : StringColumnRestrictor
  var _policyLinePatternCode : String

  /**
   * Restricts the query to RiskClasses where their coverage pattern code matches the specified coverage pattern code.
   * @param coveragePatternCode the coverage pattern code to match with
   * @return instance of this class
   */
  function withCoveragePatternCode(coveragePatternCode : String) : RiskClassQueryBuilder {
    _coveragePatternCode = coveragePatternCode
    return this
  }
  
  /**
   * Restricts the query to RiskClasses where their description contains the specified description.
   * @param description the description to match with
   * @return instance of this class
   * @see #withDescription(java.lang.String)
   */
  function withDescriptionContained(description : String) : RiskClassQueryBuilder {
    _description = description
    _descriptionRestrictor = ContainsIgnoringCase
    return this
  }
  
  /**
   * Restricts the query to RiskClasses where their description exactly matches the specified description.
   * @param description the description to match with
   * @return instance of this class
   * @see #withDescriptionContained(java.lang.String)
   */
  function withDescription(description : String) : RiskClassQueryBuilder {
    _description = description
    _descriptionRestrictor = EqualsIgnoringCase
    return this
  }

  /**
   * Restricts the query to RiskClasses where their policy line pattern code matches the specified pattern code.
   * @param policyLinePatternCode the policy line pattern code to match with
   * @return instance of this class
   */
  function withPolicyLinePatternCode(policyLinePatternCode : String) : RiskClassQueryBuilder {
    _policyLinePatternCode = policyLinePatternCode
    return this
  }

  override protected function doRestrictQuery(selectQueryBuilder : ISelectQueryBuilder) {
    if (_policyLinePatternCode != null) {
      selectQueryBuilder.compare("PolicyLinePatternCode", Equals, _policyLinePatternCode)
    }
    if (_description != null) {
      _descriptionRestrictor.restrict(selectQueryBuilder, "Description", _description)
    }
    if (_coveragePatternCode != null) {
      selectQueryBuilder.compare("CoveragePatternCode", Equals, _coveragePatternCode)
    }
  }

}
