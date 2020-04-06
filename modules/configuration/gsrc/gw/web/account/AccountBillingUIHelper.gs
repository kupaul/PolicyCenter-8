package gw.web.account

uses gw.api.util.LocationUtil
uses gw.plugin.billing.BCAccountBillingDisplayTotals
uses gw.plugin.billing.BillingAccountInfo
uses java.util.Set
uses java.util.Map

@Export
class AccountBillingUIHelper {

  static function retrieveAccountNumbers(account : Account) : Map<String, String> {
    var result : Map<String, String> = {}
    result.put(account.AccountNumber, renderAccount(account.AccountNumber, account.AccountHolderContact.DisplayName))
    try {
      var plugin = gw.plugin.Plugins.get(gw.plugin.billing.IBillingSystemPlugin)
      plugin.getSubAccounts(account.AccountNumber)
          .each(\ g -> result.put(g.AccountNumber, g.DisplayName))
    } catch (e : gw.api.util.DisplayableException) {
      LocationUtil.addRequestScopedErrorMessage(e.LocalizedMessage)
    }
    return result
  }

  static function retrieveBillingSummary(accountNumbers : Set<String>, currency : Currency) : BCAccountBillingDisplayTotals {
    var plugin = gw.plugin.Plugins.get(gw.plugin.billing.IBillingSummaryPlugin)
    var billingInfos : List<BillingAccountInfo> = {}
    try {
      for (accountNumber in accountNumbers) {
        billingInfos.addAll(plugin.retrieveAccountBillingSummaries(accountNumber).toList())
      }
    } catch (e : gw.api.util.DisplayableException) {
      LocationUtil.addRequestScopedErrorMessage(e.LocalizedMessage)
      return new BCAccountBillingDisplayTotals({}, currency)
    }
    return new BCAccountBillingDisplayTotals(billingInfos.toTypedArray(), currency)
  }

  static function renderAccount(accountNumber : String, accountName : String) : String {
    return accountNumber + " (" + accountName + ")"
  }

}
