package gw.plugin.billing.bc700
uses gw.plugin.billing.BillingPaymentInfo
uses wsi.remote.gw.webservice.bc.bc700.billingsummaryapi.types.complex.AccountBillingSettings
uses wsi.remote.gw.webservice.bc.bc700.billingsummaryapi.enums.PaymentMethod

@Export
class BCAccountBillingSettingsWrapper implements BillingPaymentInfo{
  var _soapObject : AccountBillingSettings
  
  construct(soapObject : AccountBillingSettings) {
    _soapObject = soapObject
  }

  override property get InvoiceDeliveryMethod() : InvoiceDeliveryMethod {
    return _soapObject.InvoiceDeliveryMethod
  }

  override property set InvoiceDeliveryMethod(value : InvoiceDeliveryMethod) {
    _soapObject.InvoiceDeliveryMethod = value.Code
  }

  override property get PaymentMethod() : AccountPaymentMethod {
    return _soapObject.PaymentInstrumentRecord.PaymentMethod.GosuValue
  }

  override property set PaymentMethod(value : AccountPaymentMethod) {
    _soapObject.PaymentInstrumentRecord.PaymentMethod = wsi.remote.gw.webservice.bc.bc700.billingsummaryapi.enums.PaymentMethod.valueOf(value.Code)
  }

}
