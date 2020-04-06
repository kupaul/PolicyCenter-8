package gw.web.contact

uses gw.losshistory.ClaimSearchCriteria
uses gw.plugin.claimsearch.NoResultsClaimSearchException
uses java.util.Set
uses gw.pl.currency.MonetaryAmount

/**
 * Implements the 7.0 accelerator version of a helper that provides access to
 * Claims for policies belonging to accounts associated with a specified contact
 * who is the account holder.
 */
@Export
class AccountHolderClaimMetrics {

  static final var _instance : AccountHolderClaimMetrics as readonly Instance
      = new AccountHolderClaimMetrics()

  private construct() {
  }

  function findOpenClaimsFor(policyNumbers : Set<String>) : ClaimSet {
    var claimSet : ClaimSet = new ClaimSet()
    if (policyNumbers == null or policyNumbers.Empty) {
      return claimSet
    }
    
    var criteria = new ClaimSearchCriteria()
    criteria.PolicyNumbers = policyNumbers.toTypedArray()
    criteria.DateCriteria.DateSearchType = DateSearchType.TC_ENTEREDRANGE
    try {
      claimSet = criteria.performSearch()
    } catch (ex : NoResultsClaimSearchException) {
      //do nothing
    }
    claimSet.Claims.where(\ c -> c.Status != "Open").each(\ c -> claimSet.removeFromClaims(c))
    return claimSet
  }

  function calculateTotalIncurred(currency : Currency, openClaims : Claim[]) : MonetaryAmount {
    var totalIncurred = 0bd.ofCurrency(currency)
    openClaims.each(\ claim -> {
      if (not (claim.TotalIncurred == null)) {
        totalIncurred += claim.TotalIncurred
      }
    })
    return totalIncurred
  }
}
