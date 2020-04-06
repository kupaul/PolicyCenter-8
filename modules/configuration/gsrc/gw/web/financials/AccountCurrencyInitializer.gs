package gw.web.financials
uses gw.web.financials.AbstractCurrencyInitializer

/**
 * Extension of the {@link AbstractCurrencyInitializer} for {@link Account}s.
 */
@Export
class AccountCurrencyInitializer extends AbstractCurrencyInitializer {
  var _account : Account
  
  construct(account : Account, address : Address) {
    super(address)
    _account = account
  }
    
  override property set PreferredCurrencies(currency : Currency) {
     _account.PreferredCoverageCurrency = currency
     _account.PreferredSettlementCurrency = currency
  }
}

   
