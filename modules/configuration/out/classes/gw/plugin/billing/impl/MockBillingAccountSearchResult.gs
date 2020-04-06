package gw.plugin.billing.impl
uses gw.plugin.billing.BillingAccountSearchResult

@Export
class MockBillingAccountSearchResult implements BillingAccountSearchResult{
  public var _AccountNumber : String as AccountNumber
  public var _AccountName : String as AccountName
  public var _AccountNameKanji : String as AccountNameKanji
  public var _PrimaryPayer : String as PrimaryPayer
  
  construct() {

  }

}
