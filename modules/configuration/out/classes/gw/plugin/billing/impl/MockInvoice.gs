package gw.plugin.billing.impl

uses gw.plugin.billing.BillingInvoiceInfo
uses java.util.Date
uses gw.pl.currency.MonetaryAmount

@Export
class MockInvoice implements BillingInvoiceInfo
{
  construct()
  {
  }
  
  var _invoiceNumber : String as InvoiceNumber
  var _status : String as Status
  var _paidStatus : String as PaidStatus
  var _Amount : MonetaryAmount as Amount
  var _Billed : MonetaryAmount as Billed
  var _Paid : MonetaryAmount as Paid
  var _Unpaid : MonetaryAmount as Unpaid
  var _PastDue : MonetaryAmount as PastDue
  var _InvoiceDate : Date as InvoiceDate
  var _InvoiceDueDate : Date as InvoiceDueDate
  var _InvoiceStream : String as InvoiceStream
}
