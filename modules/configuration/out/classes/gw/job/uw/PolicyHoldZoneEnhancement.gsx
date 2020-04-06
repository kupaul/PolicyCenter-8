package gw.job.uw

uses gw.api.admin.PolicyHoldsLogger
uses gw.api.contact.AddressAutocompleteUtil

enhancement PolicyHoldZoneEnhancement : entity.PolicyHoldZone {
  
  /**
   * Determines whether the given PolicyLocation is located within this zone.
   * 
   * @param loc the location to check
   * @return true if location is within this zone
   */
  function isLocWithinZone(loc : PolicyLocation) : boolean {
    var zoneValue = AddressAutocompleteUtil.getZoneValue(loc.AccountLocation, this.ZoneType)
    if (zoneValue != null) {
      if (PolicyHoldsLogger.isDebugEnabled()) {
        PolicyHoldsLogger.logDebug("(isLocWithinZone) zone value: " + zoneValue + ", location: " + loc)
      }
      return loc.Country == this.Country and zoneValue == this.Code
    }
    if (PolicyHoldsLogger.isDebugEnabled()) {
      PolicyHoldsLogger.logDebug("Location is not within zone: " + this.Code + ", location: " + loc)
    }
    return false
  }
}
