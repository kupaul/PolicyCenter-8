package gw.billing
uses gw.plugin.billing.BillingPaymentInstrument

enhancement BillingInvoiceStreamEnhancement : entity.BillingInvoiceStream {
  
  property get Automatic() : boolean{
    return this.PaymentMethod <> TC_RESPONSIVE
  }
  
  property set Automatic(value : boolean){
    if(value){
      var instrument = this.PolicyPeriod.AvailablePaymentInstruments.first()
      this.PaymentMethod = instrument.PaymentMethod
      this.PaymentInstrumentID = instrument.PublicID
    }else{
      this.PaymentMethod = TC_RESPONSIVE
    }
  }

  property set PaymentInstrument(value : BillingPaymentInstrument){
    this.PaymentInstrumentID = value.PublicID
    this.PaymentMethod = value.PaymentMethod
  }
}
