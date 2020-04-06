package gw.api.util

uses gw.api.address.AddressJurisdictionHandler
uses gw.globalization.PolicyLocationAddressAdapter
uses java.lang.Deprecated

/**
 * This utility provides methods for deriving the appropriate Jurisdiction based upon a variety of inputs. 
 */
@Export
class JurisdictionMappingUtil {

  /**
   * Returns the Jurisdiction associated with the passed-in Address.
   * @deprecated As of release 8.0, replaced by {@link #getJurisdiction(Address)}
   */
  @Deprecated
  public static function getJurisdictionMappingForAddress(address : Address) : Jurisdiction {
    return getJurisdiction(address)
  }

  /**
   * Returns the Jurisdiction associated with the passed-in PolicyLocation.
   * @deprecated As of release 8.0, replaced by {@link #getJurisdiction(PolicyLocation)}
   */
  @Deprecated
  public static function getJurisdictionMappingForPolicyLocation(policyLocation : PolicyLocation) : Jurisdiction {
    return getJurisdiction(policyLocation)
  }

  /**
   * Returns the Jurisdiction associated with the passed-in AccountLocation.
   * @deprecated As of release 8.0, replaced by {@link #getJurisdiction(AccountLocation)}
   */
  @Deprecated
  public static function getJurisdictionMappingForAccountLocation(accountLocation : AccountLocation) : Jurisdiction {
    return getJurisdiction(accountLocation)
  }

  /**
   * Returns the Jurisdiction associated with the passed-in Address.
   * @param address Address inspected to determine matching Jurisdiction
   * @return Returns the Jurisdiction associated with the address.  If address is null, null is returned.
   */
  public static function getJurisdiction(address : Address) : Jurisdiction {
    if (address == null) {
      return null
    }
    return (AddressJurisdictionHandler.getJurisdiction(address))
  }

  /**
   * Returns the Jurisdiction associated with the passed-in PolicyLocation.
   * @param policyLocation PolicyLocation inspected to determine matching Jurisdiction
   * @return Returns the Jurisdiction associated with the policyLocation.  If policyLocation is null, null is returned.
   */
  public static function getJurisdiction(policyLocation : PolicyLocation) : Jurisdiction {
    if (policyLocation == null) {
      return null
    }
    return (AddressJurisdictionHandler.getJurisdiction(new PolicyLocationAddressAdapter(policyLocation)))
  }

  /**
   * Returns the Jurisdiction associated with the passed-in AccountLocation.
   * @param accountLocation AccountLocation inspected to determine matching Jurisdiction
   * @return Returns the Jurisdiction associated with the accountLocation.  If accountLocation is null, null is returned.
   */
  public static function getJurisdiction(accountLocation : AccountLocation) : Jurisdiction {
    if (accountLocation == null) {
      return null
    }
    return AddressJurisdictionHandler.getJurisdiction(accountLocation)
  }

}
