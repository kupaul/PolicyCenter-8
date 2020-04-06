package gw.plugin.billing.bc700
uses gw.plugin.billing.BillingInvoiceStreamInfo
uses wsi.remote.gw.webservice.bc.bc700.billingapi.types.complex.InvoiceStreamInfo

@Export
class BCBillingInvoiceStreamInfo implements BillingInvoiceStreamInfo{
  var _soapObject : InvoiceStreamInfo
  
  construct(soapObject : InvoiceStreamInfo) {
    _soapObject = soapObject
  }

  override property get PublicID() : String {
    return _soapObject.PublicID
  }

  override property get Days() : String {
    return _soapObject.Days
  }

  override property get Description() : String {
    return _soapObject.Description
  }

  override property get Interval() : BillingPeriodicity {
    return _soapObject.Interval.GosuValue
  }

  override property get DueDateBilling() : Boolean {
    return _soapObject.DueDateBilling
  }

  override property get PaymentMethod() : AccountPaymentMethod {
    return _soapObject.PaymentInstrumentRecord.PaymentMethod.GosuValue
  }
  
  override property get PaymentInstrumentName() : String{
    return _soapObject.PaymentInstrumentRecord.DisplayName
  }
  

}
