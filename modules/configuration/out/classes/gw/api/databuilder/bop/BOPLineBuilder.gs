package gw.api.databuilder.bop

uses gw.api.builder.PolicyLineBuilder
uses gw.api.builder.CoverageBuilder
uses gw.api.builder.PolicyConditionBuilder
uses gw.api.builder.ExclusionBuilder
uses gw.api.util.CurrencyUtil

@Export
class BOPLineBuilder extends PolicyLineBuilder<BusinessOwnersLine, BOPLineBuilder> {

  construct() {
    super(BusinessOwnersLine)
    withSmallBusinessType( "apartment" )
  }

  function withCoverage(coverageBuilder : CoverageBuilder) : BOPLineBuilder {
    addArrayElement(BusinessOwnersLine.Type.TypeInfo.getProperty("BOPLineCoverages"), coverageBuilder)
    return this
  }

  function withPolicyCondition(policyConditionBuilder : PolicyConditionBuilder) : BOPLineBuilder {
    addArrayElement(BusinessOwnersLine.Type.TypeInfo.getProperty("BOPLineConditions"), policyConditionBuilder)
    return this
  }
  
  function withExclusion(exclusionBuilder : ExclusionBuilder) : BOPLineBuilder {
    addArrayElement(BusinessOwnersLine.Type.TypeInfo.getProperty("BOPLineExclusions"), exclusionBuilder)
    return this
  }

  // uses addArrayElement to ensure that there is only 1 BOPLocation
  function withOnlyBOPLocation(bopLocationBuilder : BOPLocationBuilder) : BOPLineBuilder {
    addArrayElement(BusinessOwnersLine.Type.TypeInfo.getProperty("BOPLocations"), bopLocationBuilder)
    return this
  }

  function withBOPLocation(bopLocationBuilder : BOPLocationBuilder) : BOPLineBuilder {
    addAdditiveArrayElement(BusinessOwnersLine.Type.TypeInfo.getProperty("BOPLocations"), bopLocationBuilder)
    return this
  }

  function withBlanketType(type : BlanketType) : BOPLineBuilder {
    set(BusinessOwnersLine.Type.TypeInfo.getProperty("BlanketType"), type)    
    return this
  }

  final function withSmallBusinessType(type : SmallBusinessType) : BOPLineBuilder {
  set(BusinessOwnersLine.Type.TypeInfo.getProperty("SmallBusinessType"), type)
  return this
  }

  final function withCurrency(currency : Currency) : BOPLineBuilder {
    set(BusinessOwnersLine#PreferredCoverageCurrency, currency)
    return this
  }
}
