package gw.plugin.productmodel.impl

@Export
class RefDateLookupCriteria {
  var _state : Jurisdiction as State
  var _policyLinePatternCode : String as PolicyLinePatternCode
  var _productCode : String as ProductCode
  var _uwCompanyCode : typekey.UWCompanyCode as UWCompanyCode
}
