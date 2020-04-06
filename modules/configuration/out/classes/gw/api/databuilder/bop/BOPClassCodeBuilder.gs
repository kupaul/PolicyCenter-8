package gw.api.databuilder.bop

uses gw.api.databuilder.DataBuilder
uses java.util.Date
uses org.apache.commons.lang.RandomStringUtils

@Export
class BOPClassCodeBuilder extends DataBuilder<BOPClassCode, BOPClassCodeBuilder> {

  construct() {
    super(BOPClassCode)
    withCode(RandomStringUtils.randomAlphanumeric(5))
    withEffectiveDate("1/1/2000" as Date)
  }

  function withBOPPropertyRateNumber(value : String) : BOPClassCodeBuilder {
    set(BOPClassCode.Type.TypeInfo.getProperty("BOPPropertyRateNumber"), value)
    return this
  }

  function withBOPLiabilityClassGroup(value : String) : BOPClassCodeBuilder {
    set(BOPClassCode.Type.TypeInfo.getProperty("BOPLiabilityClassGroup"), value)
    return this
  }

  function withClassification(classification : String) : BOPClassCodeBuilder {
    set(BOPClassCode.Type.TypeInfo.getProperty("Classification"), classification)
    return this
  }

  function withClassIndicator(indicator : String) : BOPClassCodeBuilder {
    set(BOPClassCode.Type.TypeInfo.getProperty("ClassIndicator"), indicator)
    return this
  }

  final function withCode(code : String) : BOPClassCodeBuilder {
    set(BOPClassCode.Type.TypeInfo.getProperty("Code"), code)
    return this
  }

  final function withEffectiveDate(effDate : Date) : BOPClassCodeBuilder {
    set(BOPClassCode.Type.TypeInfo.getProperty("EffectiveDate"), effDate)
    return this
  }

  function withExpirationDate(expDate : Date) : BOPClassCodeBuilder {
    set(BOPClassCode.Type.TypeInfo.getProperty("ExpirationDate"), expDate)
    return this
  }

  function withBasis(basis : ClassCodeBasis) : BOPClassCodeBuilder {
    set(BOPClassCode.Type.TypeInfo.getProperty("Basis"), basis)
    return this
  }
}
