package gw.account

uses gw.plugin.contact.DuplicateContactResult
uses java.util.Date

enhancement AccountContactEnhancement : entity.AccountContact {

  /**
   * Returns a sorted comma-separated String containing the list of Display Names
   * @param displayNames a list of Display Names
   * @return a sorted comma-separated String containing the list of Display Names
   */
  function getRolesDisplayName(displayNames : List<String>) : String {
    return displayNames.sortBy(\ displayName -> displayName).join(", ")
  }

  /**
   * Returns the AccountContactRoles for this Account as a sorted comma-separated list of the Display Names.
   * @return a sorted comma-separated list of the Display Names of the AccountContactRoles for this Account.
   */
  function getRolesDisplayName() : String {
    return getRolesDisplayName(this.Roles.map(\ role -> role.DisplayName).toList())
  }

  /**
   * Returns an array of available AccountContactRoles that this AccountContact can play.
   * These are concrete enabled roles that are not already being played by this AccountContact
   * and are appropriate for this AccountContact's contact type (e.g. Driver is only
   * appropriate if the AccountContact is a person).
   * @return an array of AccountContactRoles that this AccountContact can play.
   */
  property get AvailableAccountContactRoleTypes() : typekey.AccountContactRole[] {
    var plugin = gw.plugin.Plugins.get(gw.plugin.contact.IContactConfigPlugin)
    return plugin.AvailableAccountContactRoleTypes
      .subtract(this.Roles*.Subtype)
      .where(\ acrType -> plugin.canBeRole(this.ContactType, acrType))
      .toTypedArray()
  }

  /**
   * Populates this {@code AccountContacts} contained {@code Contact} object with the contents of the
   * {@code duplicate} parameter. If there is already a known {@code Contact} with the same {@code AddressBookUID}
   * as the {@code duplicate} then this method will attempt to replace the contained {@code Contact} with the known
   * {@code Contact}.
   *
   * This method will fail if:
   *     There is already an {@code AccountContact} on this account with the same {@code AddressBookUID} as the {@code duplicate}
   *     Or
   *     The contained non-new {@code Contact} has a non-null {@code AddressBookUID} that differs from that of the {@code duplicate}
   *     Or
   *     There is an existing {@code Contact} with the same {@code AddressBookUID} as the {@code duplicate} but
   *       is not the same as our {@code Contact} and our {@code Contact} cannot be replaced because this is not a new
   *       {@code AccountContact}
   * @param duplicate the DuplicateContactResult that will be compared with the existing Contact
   **/
  function importExternalContactData(duplicate : DuplicateContactResult) {
    var dupUID = duplicate.ContactAddressBookUID
    var existingContact = Contact.findContactInBundleOrDB(dupUID, this.Bundle)

    var contactExistsOnThisAccount =
        this.Account.AccountContacts.hasMatch(\ ac -> ac.Contact.AddressBookUID == dupUID) 
    var isMatchingAddressBookContact = this.Contact.AddressBookUID == dupUID
    var needToReplaceContact = existingContact != null and !isMatchingAddressBookContact

    if ( contactExistsOnThisAccount or
        (needToReplaceContact and !this.New) or
        (!isMatchingAddressBookContact and this.Contact.AddressBookUID != null and !this.Contact.New)) {
      throw new java.lang.IllegalArgumentException(displaykey.AccountContact.Error.ImportIntoExisting)
    }

    if (needToReplaceContact) {
        this.Contact.remove()
        this.Contact = existingContact
    }
    duplicate.overwriteContactFields(this.Contact)
  }

  /**
   * Calculates the maximum last update time of all Contact and Address entities in this
   * AccountContact's hierarchy.
   * @return the maximum last update time.
   */
  function calculateMaximumLastUpdateTime() : Date {
    var currentMaximum = this.LastUpdateTime
    var contact = this.Contact
    if (currentMaximum == null or contact.LastUpdateTime > currentMaximum) {
      currentMaximum = contact.LastUpdateTime
    }
    for (address in contact.AllAddresses) {
      if (currentMaximum == null or address.LastUpdateTime > currentMaximum) {
        currentMaximum = address.LastUpdateTime
      }
    }
    return currentMaximum
  }

  /**
   * It add the new Roles to this account contact only if the new role does not exist
   * in the account contact.
   * @param newRoles an array of AccountContactRoles to be added to the Account
   */
  function addRoles(newRoles : AccountContactRole[]) {
    newRoles.each(\ newRole -> {
       if (!this.Roles.hasMatch(\ r -> r.Subtype.Code == newRole.Subtype.Code)) {
         this.addNewRole(newRole.Subtype)
       }
    })
  }
  
  /**
   * Creates a new activity on the account associated to this account contact.
   * It also set the AccountContact foreignkey for the activity.
   * @param activityPattern the ActivityPattern to be used for the creation of the new Activity.
   * @return a new Activity on the Account.
   */
  function newActivity(activityPattern : ActivityPattern) : Activity {
    var activity = this.Account.newActivity(activityPattern)
    activity.AccountContact = this
    return activity
  }
}
