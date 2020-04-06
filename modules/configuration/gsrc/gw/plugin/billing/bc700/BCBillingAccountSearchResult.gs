package gw.plugin.billing.bc700
uses gw.plugin.billing.BillingAccountSearchResult
uses wsi.remote.gw.webservice.bc.bc700.billingapi.types.complex.BCAccountSearchResult
uses java.lang.UnsupportedOperationException

@Export
class BCBillingAccountSearchResult implements BillingAccountSearchResult{
  var _soapObject : BCAccountSearchResult
  
  construct(soapObject : BCAccountSearchResult) {
    _soapObject = soapObject
  }
  
  override property get AccountNumber() : String {
    return _soapObject.AccountNumber
  }

  override property get AccountName() : String {
    return _soapObject.AccountName
  }

  override property get AccountNameKanji() : String {
    // This field is not supported in 7.XX and earlier.
    return null
  }

  override property get PrimaryPayer() : String {
    return _soapObject.PrimaryPayer
  }
}
