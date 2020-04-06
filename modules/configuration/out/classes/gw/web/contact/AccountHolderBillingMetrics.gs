package gw.web.contact

uses java.util.Set
uses gw.web.account.AccountBillingUIHelper
uses gw.plugin.billing.BCAccountBillingDisplayTotals

/**
 * Implements the 7.0 accelerator version of a helper that provides access to
 * Billing Account Information for accounts used to calculate metrics associated
 * with a specified contact who is the account holder.
 */
@Export
class AccountHolderBillingMetrics {

  static final var _instance : AccountHolderBillingMetrics as readonly Instance
      = new AccountHolderBillingMetrics()

  private construct() {
  }

  function findBillingInfosForAccounts(accountNumbers : Set<String>, currency : Currency) : BCAccountBillingDisplayTotals {
    return AccountBillingUIHelper.retrieveBillingSummary(accountNumbers, currency)
  }
}
