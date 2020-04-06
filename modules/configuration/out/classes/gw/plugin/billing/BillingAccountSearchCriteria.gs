package gw.plugin.billing
uses gw.plugin.Plugins
uses gw.search.SearchCriteria

/**
 * Extension of the Java interface which is created in order to define it in the Java plugin
 * interface.
 */
@Export
class BillingAccountSearchCriteria extends SearchCriteria<BillingAccountSearchResult> implements BillingAccountSearchCriteriaJava {
  /**
   * The account number search criteria
   */
  var _accountNumber : String as AccountNumber
  /**
   * The account name search criteria
   */
  var _accountName : String as AccountName
  var _accountNameKanji : String as AccountNameKanji

  var _currency : Currency as Currency

  /**
   * True if only search for list bill account
   */
  var _listBill : Boolean as ListBill

  var _plugin : IBillingSystemPlugin
  
  construct(){
    _plugin = Plugins.get(IBillingSystemPlugin)
  }
  
  override function doSearch() : BillingAccountSearchResult[] {    
    return _plugin.searchForAccounts(this, 50)
  }

  override property get HasMinimumSearchCriteria() : boolean {
    return ( (AccountName != null && AccountName.NotBlank) ||
        (AccountNameKanji != null && AccountNameKanji.NotBlank) ||
        (AccountNumber != null && AccountNumber.NotBlank))
  }

  override property get MinimumSearchCriteriaMessage() : String {
    if (HasMinimumSearchCriteria) {
      return null
    }
    return displaykey.Web.Search.SearchCriteria.BillingAccountSearchCriteriaMinimumCriteriaNotMet
  }
  
}
