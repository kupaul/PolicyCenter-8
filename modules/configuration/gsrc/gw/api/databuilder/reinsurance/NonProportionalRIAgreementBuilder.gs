package gw.api.databuilder.reinsurance
uses java.math.BigDecimal

@Export
abstract class NonProportionalRIAgreementBuilder<T extends NonProportionalRIAgreement, B extends NonProportionalRIAgreementBuilder> extends RIAgreementBuilder<T, B> {

  construct() {
    super(T)
    withAttachmentIndexed(true)
    withLimitIndexed(true)
    withCalculateCededPremium(false)
    withGNPSubtotal(GNPSubtotalType.TC_GROSSPREMIUM)
    withCedingRate(25)
  }

  final function withAttachmentIndexed(value : Boolean) : B {
    set(NonProportionalRIAgreement.Type.TypeInfo.getProperty("AttachmentIndexed"), value)
    return this as B
  }

  final function withLimitIndexed(value : Boolean) : B{
    set(NonProportionalRIAgreement.Type.TypeInfo.getProperty("LimitIndexed"), value)
    return this as B
  }
  
  final function withCalculateCededPremium(value : Boolean) : B{
    set(NonProportionalRIAgreement.Type.TypeInfo.getProperty("CalculateCededPremium"), value)
    return this as B
  }
  
  final function withGNPSubtotal(value : GNPSubtotalType) : B{
    set(NonProportionalRIAgreement.Type.TypeInfo.getProperty("GNPSubtotal"), value)
    return this as B
  }
  
  final function withCedingRate(value : BigDecimal) : B{
    set(NonProportionalRIAgreement.Type.TypeInfo.getProperty("CedingRate"), value)
    return this as B
  }

}
