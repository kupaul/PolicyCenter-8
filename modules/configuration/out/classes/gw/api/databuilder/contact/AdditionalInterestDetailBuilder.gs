package gw.api.databuilder.contact

uses gw.api.databuilder.DataBuilder

/**
 * @author gclarke
 */
@Export
abstract class AdditionalInterestDetailBuilder<T extends AddlInterestDetail, B extends AdditionalInterestDetailBuilder<T, B>> extends DataBuilder<T, B> {
  
  construct(type : Type) {
    super(type)
  }

  function withAdditionalInterestType(type : AdditionalInterestType) : B {
    set(AddlInterestDetail.Type.TypeInfo.getProperty("ADDITIONALINTERESTTYPE"), type)
    return this as B
  }

  function withContractNumber(contractNumber : String) : B {
    set(AddlInterestDetail.Type.TypeInfo.getProperty("CONTRACTNUMBER"), contractNumber)
    return this as B
  }
  
  function asCertificateRequired(certRequired : boolean) : B {
    set(AddlInterestDetail.Type.TypeInfo.getProperty("CERTREQUIRED"), certRequired)
    return this as B
  }
}
