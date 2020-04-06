package gw.plugin.billing.impl
uses gw.plugin.billing.BillingInvoiceStreamInfo

@Export
class MockBillingInvoiceStreamInfo implements BillingInvoiceStreamInfo{
  var _publicId : String as PublicID
  var _Interval : BillingPeriodicity as Interval
  var _Days : String as Days
  var _DueDateBilling : Boolean as DueDateBilling
  var _Description : String as Description
  var _PaymentMethod : AccountPaymentMethod as PaymentMethod
  var _PaymentInstrumentName : String as PaymentInstrumentName
  
  construct() {
  }

}
