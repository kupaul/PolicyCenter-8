package gw.api.databuilder.gl

uses gw.api.databuilder.DataBuilder
uses java.util.Date
uses org.apache.commons.lang.RandomStringUtils

@Export
class GLClassCodeBuilder extends DataBuilder<GLClassCode, GLClassCodeBuilder> {

  construct() {
    super(GLClassCode)
    withCode(RandomStringUtils.randomAlphanumeric(5))
    withEffectiveDate(Date.createDateInstance(1, 1, 2000))
  }

  final  function withCode(code : String) : GLClassCodeBuilder {
    set(GLClassCode.Type.TypeInfo.getProperty("Code"), code)
    return this
  }

  final function withEffectiveDate(effDate : Date) : GLClassCodeBuilder {
    set(GLClassCode.Type.TypeInfo.getProperty("EffectiveDate"), effDate)
    return this
  }

  function withExpirationDate(expDate : Date) : GLClassCodeBuilder {
    set(GLClassCode.Type.TypeInfo.getProperty("ExpirationDate"), expDate)
    return this
  }

  function withClassification(value : String) : GLClassCodeBuilder {
    set(GLClassCode.Type.TypeInfo.getProperty("Classification"), value)
    return this
  }

  function withBasis(basis : ClassCodeBasis) : GLClassCodeBuilder {
    set(GLClassCode.Type.TypeInfo.getProperty("Basis"), basis)
    return this
  }
}