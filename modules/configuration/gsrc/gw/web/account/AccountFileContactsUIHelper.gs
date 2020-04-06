package gw.web.account

@Export
class AccountFileContactsUIHelper {

  public static function removeContacts(acctContactRolesDisplayNames : java.util.Map, account : entity.Account, accountContacts: AccountContact[]) {
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      var localaccount = bundle.add(account)
      for (ac in accountContacts) {
        var localAccountContact = bundle.add(ac)
        localaccount.removeFromAccountContacts(localAccountContact)
        if ( acctContactRolesDisplayNames != null ) {
          acctContactRolesDisplayNames.remove(ac)
        }
      }
    })
  }

  // this method is here because the AB Search page is read only, and simply selects a Contact to return - it does not perform the domain logic to do the add like the NewAccountContactPopup does
  // additionally, this page is read-only itself, so we need to create up a new bundle, load the Account in it, call the domain logic and then commit the bundle
  public static function addContactFromAddressBook(acctContactRolesDisplayNames : java.util.Map, account : entity.Account, abContact : Contact, roleType : typekey.AccountContactRole) {
    // if the Contact is brand new (freshly imported from AB), we can use it's bundle
    if (abContact.New) {
      var localAccount = abContact.Bundle.add(account)
      localAccount.maybeAddNewAccountContact(abContact).addNewRole(roleType)
      abContact.Bundle.commit()
    } else {
      gw.transaction.Transaction.runWithNewBundle(\bundle -> {
        var localAccount = bundle.add(account)
        localAccount.maybeAddNewAccountContact(abContact).addNewRole(roleType)
      })
    }
    // reload
    acctContactRolesDisplayNames = loadAcctContactRolesDisplay(account)
  }

  public static function lookupAcctContactRolesDisplayName(acctContactRolesDisplayNames : java.util.Map, acctContact:AccountContact) : String {
    /* Use cached value the 1st time only, and then remove it so subsequent
    * look-ups will get actual value from the entity.  This ensures that after
    * any update to an AccountContact (such as adding or removing roles!), the
    * correct display name will be looked-up while also amortizing the 1st
    * access through the cache.  (The 1st access is guaranteed to occur, while
    * subsequent access might not unless the AccountContact is edited [which
    * usually won't happen].)
    */
    var displayName = acctContactRolesDisplayNames[acctContact] as String
    if ( displayName == null ) {
      displayName = acctContact.getRolesDisplayName()
    } else {
      acctContactRolesDisplayNames.remove(acctContact)
    }
    return displayName
  }

  /** Load Acc't Contact Roles Display Name Map.
   *
   * This loads a map by Acc't Contact of the display name for the roles assigned
   * to that contact for the account.  This optimizes access to the roles display
   * name by loading them all at once instead of individually for each Acc't Contact.
   */
  public static function loadAcctContactRolesDisplay(account : entity.Account) : java.util.Map<entity.AccountContact, java.lang.String> {
    var qry = gw.api.database.Query.make(AccountContactRole)
    qry.subselect("AccountContact", CompareIn, AccountContact, "ID")
        .compare("Account", Equals, account)

    /* partition AccountContactRole's DisplayName's
    * into List's by AccountContact...
    */
    var names = new java.util.HashMap<AccountContact, java.util.List<String>>(5)
        .toAutoMap(\ k -> new java.util.ArrayList<String>(3))
    for ( acr in qry.select() ) {
      var ac = acr.AccountContact
      names[ac].add(acr.DisplayName)
    }

    /* replace list of AccountContactRole's DisplayName's with
    * sorted, comma-separated text list...
    */
    var displayNames = new java.util.HashMap<AccountContact, String>(names.size())
    for ( ac in names.Keys ) {
      displayNames[ac] = ac.getRolesDisplayName(names[ac])
    }
    return displayNames
  }
}
