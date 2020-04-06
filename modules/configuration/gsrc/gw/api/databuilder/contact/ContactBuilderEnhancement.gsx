package gw.api.databuilder.contact
uses gw.api.databuilder.ContactBuilder
uses java.math.BigDecimal

enhancement ContactBuilderEnhancement<T extends Contact, B extends ContactBuilder<T, B>> : gw.api.databuilder.ContactBuilder<T, B> {
  
  public function withTaxStatus(status : TaxStatus) : B {
    this.set(Contact.Type.TypeInfo.getProperty( "TaxStatus" ), status)
    return this as B
  }
  
  public function withWithholdingRate(rate : BigDecimal) : B {
    this.set(Contact.Type.TypeInfo.getProperty( "WithholdingRate" ), rate)
    return this as B
  }
}
