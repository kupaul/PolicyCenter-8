package gw.plugin.billing.bc800

uses gw.plugin.billing.BillingInvoiceStreamInfo
uses wsi.remote.gw.webservice.bc.bc800.billingapi.types.complex.InvoiceStreamInfo
uses java.lang.SuppressWarnings
uses gw.api.system.PCLoggerCategory
uses gw.plugin.billing.BillingUtilityMethods

@Export
class BCBillingInvoiceStreamInfo implements BillingInvoiceStreamInfo {

  var _publicID : String as PublicID
  var _days : String as Days
  var _description : String as Description
  var _interval : BillingPeriodicity as Interval
  var _dueDateBilling : Boolean as DueDateBilling
  var _paymentMethod : AccountPaymentMethod as PaymentMethod
  var _paymentInstrumentName : String as PaymentInstrumentName

  construct(soapObject : InvoiceStreamInfo) {
    _publicID = soapObject.PublicID
    _days = soapObject.Days
    _description = soapObject.Description
    _interval = soapObject.Interval.GosuValue
    _dueDateBilling = soapObject.DueDateBilling
    _paymentInstrumentName = soapObject.PaymentInstrumentRecord.DisplayName
    var paymentMethodValue = soapObject.PaymentInstrumentRecord.PaymentMethod.GosuValue
    _paymentMethod = BillingUtilityMethods.convertPaymentMethodToAccountPaymentMethod(paymentMethodValue)
  }
}
