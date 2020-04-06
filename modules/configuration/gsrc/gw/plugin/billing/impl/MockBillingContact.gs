package gw.plugin.billing.impl
uses gw.plugin.billing.BillingContactInfo

@Export
class MockBillingContact implements BillingContactInfo{

  construct() {
  }
  
  var _Name : String as Name
  var _Address : String as Address
  var _Phone : String as Phone
}
