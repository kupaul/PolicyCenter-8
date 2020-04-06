package gw.web.financials
uses java.lang.Object
uses entity.Address
uses typekey.Country
uses typekey.Currency
uses gw.api.util.RegionCurrencyMappingUtil

/**
 * Initializer class that enables dynamic post-on-change changes for the currency fields on new entities
 * after country changes. 
 */
@Export
abstract class AbstractCurrencyInitializer {
  
  var _oldCountry : Country
  var _address : Address
  
  construct(address : Address) {
    _address = address
  }
  
  /**
   * Initializes (sets defaults) currency fields on accounts if corresponding
   * updatesCurrenciesOnCountryChange flag is true.
   */
  function initialize(updatesCurrenciesOnCountryChange : boolean) : Object {
    var country = _address.Country
    if (not updatesCurrenciesOnCountryChange or country == _oldCountry) {
      return null
    }
    _oldCountry = country    
    var currency = RegionCurrencyMappingUtil.getCurrencyMappingForAddress(_address)
    PreferredCurrencies = currency
    return null
  }
  
  abstract property set PreferredCurrencies(currency : Currency)
  
}
