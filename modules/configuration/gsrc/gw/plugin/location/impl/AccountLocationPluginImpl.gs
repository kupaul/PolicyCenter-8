package gw.plugin.location.impl

uses gw.plugin.location.AccountLocationPlugin


@Export
class AccountLocationPluginImpl implements AccountLocationPlugin {

  override function areAccountLocationsEquivalent(location1: AccountLocation, location2: AccountLocation): boolean {
    return
      location1.City == location2.City and
      location1.PostalCode == location2.PostalCode and
      location1.State == location2.State and
      location1.AddressLine1 == location2.AddressLine1 and
      location1.AddressLine2 == location2.AddressLine2 and
      location1.AddressLine3 == location2.AddressLine3
  }

  /**
   * Use this method to clone extended fields and arrays from the old AccountLocation to the new one.
   * The caller of this method clones the AccountLocation and AccountLocationAddress.  This will clone
   * fields but not FKs or arrays
   * WARNING: Do not make ANY changes to the Periods, Accounts, or any other entity via this
   *   method.  This method will be called during bind and modifying any entity other than the clone
   *   will make the policy out-of-sync for the bind with disastrous consequences at some point.
   */
  override function cloneExtensions(oldLocation: AccountLocation, newLocation: AccountLocation) {

  }

}
