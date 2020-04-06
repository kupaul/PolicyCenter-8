package gw.web.financials
uses gw.web.financials.AbstractCurrencyInitializer

/**
 * Extension of the {@link AbstractCurrencyInitializer} for {@link Contact}s.
 */
@Export
class ContactCurrencyInitializer extends AbstractCurrencyInitializer {
  var _contact : Contact
  
  construct(contact : Contact, address : Address) {
    super(address)
    _contact = contact
  }

  override property set PreferredCurrencies(currency : Currency) {
    _contact.PreferredSettlementCurrency = currency
  }

}
