package gw.api.databuilder.gl
uses gw.api.builder.PolicyLineBuilder
uses gw.api.builder.CoverageBuilder
uses gw.api.builder.PolicyConditionBuilder
uses gw.api.builder.ExclusionBuilder
uses gw.api.util.CurrencyUtil

@Export
class GeneralLiabilityLineBuilder extends PolicyLineBuilder<GeneralLiabilityLine, GeneralLiabilityLineBuilder> {

  construct() {
    super(GeneralLiabilityLine)
    withGLCoverageForm( GLCoverageFormType.TC_OCCURRENCE )
  }
  
  function withRateModifier(modifierBuilder : GLModifierBuilder) : GeneralLiabilityLineBuilder {
    addArrayElement(GeneralLiabilityLine.Type.TypeInfo.getProperty("GLModifiers"), modifierBuilder) 
    return this
  }

  function withCoverage(coverageBuilder : CoverageBuilder) : GeneralLiabilityLineBuilder {
    addArrayElement(GeneralLiabilityLine.Type.TypeInfo.getProperty("GLLineCoverages"), coverageBuilder)
    return this
  }

  function withPolicyCondition(policyConditionBuilder : PolicyConditionBuilder) : GeneralLiabilityLineBuilder {
    addArrayElement(GeneralLiabilityLine.Type.TypeInfo.getProperty("GLLineConditions"), policyConditionBuilder)
    return this
  }
  
  function withExclusion(exclusionBuilder : ExclusionBuilder) : GeneralLiabilityLineBuilder {
    addArrayElement(GeneralLiabilityLine.Type.TypeInfo.getProperty("GLLineExclusions"), exclusionBuilder)
    return this
  }

  function withExposure(exposureBuilder : GLExposureBuilder) : GeneralLiabilityLineBuilder {
    addArrayElement(GeneralLiabilityLine.Type.TypeInfo.getProperty("Exposures"), exposureBuilder)
    return this
  }

  final function withGLCoverageForm(GLCoverageFormType : GLCoverageFormType) : GeneralLiabilityLineBuilder{
    set( GeneralLiabilityLine.Type.TypeInfo.getProperty("GLCoverageForm"), GLCoverageFormType )
    return this
  }

  function withCurrency(currency : Currency) : GeneralLiabilityLineBuilder {
    set(GeneralLiabilityLine#PreferredCoverageCurrency, currency)
    return this
  }
}
