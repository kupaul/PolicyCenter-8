package gw.api.databuilder.reinsurance

uses gw.api.databuilder.UniqueKeyGenerator
uses gw.api.databuilder.reinsurance.RIAgreementBuilder
uses gw.pl.currency.MonetaryAmount
uses gw.api.util.CurrencyUtil

uses java.lang.IllegalArgumentException
uses java.math.BigDecimal
uses java.util.Date

@Export
class RIProgramBuilder extends RIContractBuilder<RIProgram, RIProgramBuilder> {

  construct() {
    super(RIProgram)
    withCurrency(CurrencyUtil.getDefaultCurrency())
    withName(UniqueKeyGenerator.get().nextKey())
    withStatus(TC_ACTIVE)
    withEffectiveDate(Date.Today)
    withExpirationDate(Date.Today.addYears(1))
    withCoverageGroup(TC_PROPERTY)
    withTargetMaxRetention(500000bd)
    withRequiresRecalculation(false)
  }

  final function withCoverageGroup(groupType : RICoverageGroupType) : RIProgramBuilder {
    var value = new ProgramCoverageGroupBuilder(groupType)
    addArrayElement(RIProgram.Type.TypeInfo.getProperty("RICoverageGroups"), value)
    return this
  }

  final function withOnlyCoverageGroup(groupType : RICoverageGroupType) : RIProgramBuilder {
    removePopulator(RIProgram.Type.TypeInfo.getProperty("RICoverageGroups"))
    withCoverageGroup(groupType)
    return this
  }

  final function withOnlyCoverageGroups(groupTypes : RICoverageGroupType[]) : RIProgramBuilder {
    removePopulator(RIProgram.Type.TypeInfo.getProperty("RICoverageGroups"))
    groupTypes.each(\ r -> {
      withCoverageGroup(r)
    })
    return this
  }

  final function withTreaty(agreementBuilder : RIAgreementBuilder) : RIProgramBuilder{
    if(Facultative.Type.isAssignableFrom(agreementBuilder.Type)){
      throw new IllegalArgumentException("Could not associate Facultative to a Program.")
    }
    withProgramTreaty(new ProgramTreatyBuilder().withAgreement(agreementBuilder))
    return this
  }

  final function withTreaty(treaty : RIAgreement) : RIProgramBuilder{
    if(treaty typeis Facultative){
      throw new IllegalArgumentException("Could not associate Facultative to a Program.")
    }
    withProgramTreaty(new ProgramTreatyBuilder().withAgreement(treaty))
    return this
  }

  private function withProgramTreaty(value : ProgramTreatyBuilder){
    addAdditiveArrayElement(RIProgram.Type.TypeInfo.getProperty("ProgramTreaties"),
      value)
  }

  final function withTargetMaxRetention(amount : MonetaryAmount) : RIProgramBuilder{
    set(RIProgram.Type.TypeInfo.getProperty("TargetMaxRetention"), amount)
    return this
  }

  final function withTargetMaxRetention(amount : BigDecimal) : RIProgramBuilder{
    setMonetaryAmountPropertyAmount(RIProgram.Type.TypeInfo.getProperty("TargetMaxRetention"), amount)
    return this
  }

  final function withSingleRiskMaximum(amount : MonetaryAmount) : RIProgramBuilder{
    set(RIProgram.Type.TypeInfo.getProperty("SingleRiskMaximum"), amount)
    return this
  }

  final function withSingleRiskMaximum(amount : BigDecimal) : RIProgramBuilder{
    setMonetaryAmountPropertyAmount(RIProgram.Type.TypeInfo.getProperty("SingleRiskMaximum"), amount)
    return this
  }

  final function withRequiresRecalculation(reqRecalc : boolean) : RIProgramBuilder{
    set(RIProgram.Type.TypeInfo.getProperty("RequiresRecalculation"), reqRecalc)
    return this
  }
}
