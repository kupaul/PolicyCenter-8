package gw.plugin.billing.bc800

uses gw.plugin.billing.BillingAccountSearchResult
uses wsi.remote.gw.webservice.bc.bc800.billingapi.types.complex.BCAccountSearchResult

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
    return _soapObject.AccountNameKanji
  }

  override property get PrimaryPayer() : String {
    return _soapObject.PrimaryPayer
  }
}
