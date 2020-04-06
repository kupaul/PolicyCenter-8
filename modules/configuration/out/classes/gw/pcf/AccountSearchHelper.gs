package gw.pcf

@Export
class AccountSearchHelper {

  public static function getCountry (searchCriteria : gw.account.AccountSearchCriteria) : String {
    var countrymode : String
    if (searchCriteria.Country <> null) {
      countrymode = searchCriteria.Country.Code
    } else {
      countrymode = gw.api.system.PLConfigParameters.DefaultCountryCode.Value
    }
    return countrymode
  }
}
