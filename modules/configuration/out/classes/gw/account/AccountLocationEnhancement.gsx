package gw.account

uses gw.api.util.DisplayableException

enhancement AccountLocationEnhancement : entity.AccountLocation {
  
  /**
   * Return true if this account location is the primary location on the account.
   */
  property get Primary() : boolean {
    return this.Account.PrimaryLocation == this
  }
  
  /**
   * Return true if this account location is primary or is currently in use as a policy location
   */
  property get InUse() : boolean {
    return Primary or not this.canRemove()
  }

  /**
   * Validates that the State and Country have not been changed on the AccountLocation.
   */
  function validateStateAndCountryHaveNotChanged() {
    var oldState = (this.OriginalVersion as AccountLocation).State
    var oldCountry = (this.OriginalVersion as AccountLocation).Country
    var newState = this.State
    var newCountry = this.Country

    if (oldState != newState) {
      throw new DisplayableException(displaykey.Web.AccountLocation.StateChanged(oldState, newState))
    } else if (oldCountry != newCountry) {
      throw new DisplayableException(displaykey.Web.AccountLocation.CountryChanged(oldCountry, newCountry))
    }
  }
}
