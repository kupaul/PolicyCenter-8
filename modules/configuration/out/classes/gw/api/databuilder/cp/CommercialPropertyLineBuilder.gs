package gw.api.databuilder.cp
uses gw.api.builder.PolicyLineBuilder
uses gw.api.builder.CoverageBuilder
uses gw.api.util.CurrencyUtil

@Export
class CommercialPropertyLineBuilder extends PolicyLineBuilder<CommercialPropertyLine, CommercialPropertyLineBuilder> {
  
  construct() {
    super(CommercialPropertyLine)
  }

  function withCPLocation(cpLocationBuilder : CPLocationBuilder) : CommercialPropertyLineBuilder {
    addArrayElement(CommercialPropertyLine.Type.TypeInfo.getProperty("CPLocations"), cpLocationBuilder)
    return this
  }

  function withCoverage(coverageBuilder : CoverageBuilder) : CommercialPropertyLineBuilder {
    addArrayElement(CommercialPropertyLine.Type.TypeInfo.getProperty("CPLineCoverages"), coverageBuilder)
    return this
  }

  function withRateModifier(modifierBuilder : CPModifierBuilder) : CommercialPropertyLineBuilder {
    addArrayElement(CommercialPropertyLine.Type.TypeInfo.getProperty("CPModifiers"), modifierBuilder) 
    return this
  }

  function withBlanket(blanketBuilder: CPBlanketBuilder) : CommercialPropertyLineBuilder{
    addArrayElement(CommercialPropertyLine.Type.TypeInfo.getProperty("CPBlankets"),blanketBuilder)
    return this
  }

  function withCurrency(currency : Currency) : CommercialPropertyLineBuilder {
    set(CommercialPropertyLine#PreferredCoverageCurrency, currency)
    return this
  }
}