package gw.plugin.billing.bc700

uses wsi.remote.gw.webservice.bc.bc700.billingsummaryapi.types.complex.PCInvoiceInfo
uses gw.plugin.billing.BillingInvoiceInfo
uses java.util.Date
uses gw.pl.currency.MonetaryAmount

@Export
class BCInvoiceInfoWrapper implements BillingInvoiceInfo{
  var _soapObject : PCInvoiceInfo

  construct(soapObject : PCInvoiceInfo) {
    _soapObject = soapObject
  }

  override property get Amount() : MonetaryAmount {
    if (_soapObject.Amount == null) return null
    return _soapObject.Amount.ofDefaultCurrency()
  }

  override property get Billed() : MonetaryAmount {
    if (_soapObject.Billed == null) return null
    return _soapObject.Billed.ofDefaultCurrency()
  }

  override property get InvoiceDate() : Date {
    return _soapObject.InvoiceDate
  }

  override property get InvoiceDueDate() : Date {
    return _soapObject.InvoiceDueDate
  }

  override property get InvoiceNumber() : String {
    return _soapObject.InvoiceNumber
  }

  override property get Paid() : MonetaryAmount {
    if (_soapObject.Paid == null) return null
    return _soapObject.Paid.ofDefaultCurrency()
  }

  override property get PaidStatus() : String {
    return _soapObject.PaidStatus
  }

  override property get PastDue() : MonetaryAmount {
    if (_soapObject.PastDue == null) return null
    return _soapObject.PastDue.ofDefaultCurrency()
  }

  override property get Status() : String {
    return _soapObject.Status
  }

  override property get Unpaid() : MonetaryAmount {
    if (_soapObject.Unpaid == null) return null
    return _soapObject.Unpaid.ofDefaultCurrency()
  }

  override property get InvoiceStream() : String {
    return _soapObject.InvoiceStream
  }
}
