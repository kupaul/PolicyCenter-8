package gw.web.account

@Export
class AccountSearchUIHelper {

  public static function validateAndPerformSearch(searchMode : typekey.AccountSearchType, currentAccount : entity.Account, searchCriteria : gw.account.AccountSearchCriteria, relatedTo: Account) : entity.AccountSummaryQuery{
    if (searchCriteria.AccountNumber == currentAccount.AccountNumber) {
      var message: String

      switch(searchMode){
        case typekey.AccountSearchType.TC_MERGEACCOUNTS:
            message = displaykey.Web.AccountFile.MergeAccounts.RequireDifferentAccountNumber(currentAccount.AccountNumber)
            break
        case typekey.AccountSearchType.TC_MOVEPOLICIES:
            message = displaykey.Web.AccountFile.MovePolicies.RequireDifferentAccountNumber(currentAccount.AccountNumber)
            break
        case typekey.AccountSearchType.TC_REWRITEPOLICIES:
            message = displaykey.Web.AccountFile.RewritePolicies.RequireDifferentAccountNumber(currentAccount.AccountNumber)
            break
      }
      gw.api.util.LocationUtil.addRequestScopedWarningMessage(message)
      return null
    }
    return searchCriteria.performSearch()
  }

}