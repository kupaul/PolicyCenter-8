package gw.webservice.pc.pc700.contact

uses gw.api.system.PCLoggerCategory
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.contactmapper.ab700.ContactIntegrationXMLMapper
uses gw.plugin.Plugins
uses gw.plugin.reinsurance.IReinsurancePlugin
uses gw.transaction.Transaction
uses gw.webservice.contactapi.beanmodel.XmlBackedInstance
uses gw.webservice.contactapi.ab700.ABClientAPI
uses gw.webservice.SOAPUtil
uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException
uses java.lang.Exception
uses gw.contact.ContactTokenThreadLocal
uses gw.api.database.PCBeanFinder

/**
 * This API provides functionality that allows the external contact system interact with contacts in Policy Center.
 */
@Deprecated("Since 8.0.0.  Please use the pc800 package.")
@gw.xml.ws.annotation.WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/contact/ContactAPI" )
@Export
class ContactAPI implements ABClientAPI {
  
  /**
   * Deletes a Contact across all accounts. Contacts cannot be deleted
   * if they are in use on any policy or work order on the account (the 
   * same conditions required for deletion from user interface) .
   * "In use" means used by PolicyPeriod or has "account only" role(s).
   * 
   * @param contactPublicId public ID of the Contact
   * @return The public ID of the removed contact
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function removeContactByPublicID(contactPublicId : String) : String {
    SOAPUtil.require(contactPublicId, "contactPublicId")

    Transaction.runWithNewBundle(\ bundle -> {
      SOAPUtil.convertToSOAPException(PCLoggerCategory.CONTACT_API, \ -> {
      
        // find the Contact
        var contact = bundle.add(PCBeanFinder.loadBeanByPublicID<Contact>(contactPublicId, Contact))
        if (contact == null) {
          throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByPublicID(contactPublicId))
        }

        // find all AccountContacts referencing this Contact
        var accountContactQuery = Query.make(AccountContact)
        accountContactQuery.compare("Contact", Relop.Equals, contact)
        var accountContacts = accountContactQuery.select().toList()
      
        // see if we can remove each AccountContact
        if (accountContacts.hasMatch(\ ac -> not ac.canRemove())) {
          var account = accountContacts.firstWhere(\ ac -> not ac.canRemove()).Account
          throw new SOAPException(
            displaykey.ContactAPI.Error.DeleteContact.ContactUsedByAccount(contactPublicId, account))
        }

        // Remove each AccountContact
        for (acctContact in accountContacts) {
          // load it into our bundle
          var localAcctContact = bundle.add(acctContact)
          localAcctContact.remove()
        }
        contact.remove()
      })
    })
    
    return contactPublicId
  }
  
  /**
   * Activates or deactivates all AccountContacts identified by a contactPublicId.
   * 
   * @param contactPublicId public ID of the Contact
   * @param activate whether to activate or deativate.
   * @return The number of AccountContacts updated
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If any field is null")
  @Throws(BadIdentifierException, "If the Account or Contact cannot be found or If you try to deactivate an account holder")
  function activateContactOnAllAccounts(contactPublicId : String, activate : boolean) : int {
    SOAPUtil.require(contactPublicId, "contactPublicId")
    SOAPUtil.require(activate, "activate")

    var contactsUpdated = 0
    Transaction.runWithNewBundle(\ bundle -> {
      // load Contact
      var contact = bundle.add(PCBeanFinder.loadBeanByPublicID<Contact>(contactPublicId, Contact))
      if (contact == null) {
        throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByAddressBookUID(contactPublicId))
      }

      // find all AccountContacts referencing this Contact
      var accountContacts = Query.make(AccountContact).compare("Contact", Equals, contact).select().toList()
      if (not activate and accountContacts.hasMatch(\ a -> a.hasRole("AccountHolder"))) {
        throw new BadIdentifierException(displaykey.Webservice.Error.CannotDeactivateAccountHolder)
      }
      
      // for each Account contact, update the active status
      for (acctContact in accountContacts) {
        // finders are in a read-only bundle, so load it into our bundle
        var localAcctContact = bundle.add(acctContact)
        localAcctContact.Active = activate
        contactsUpdated++
      }
    })
  
    return contactsUpdated
  }
  
  /**
   * Merges the two Addresses passed in, provided:
   * <ul>
   *   <li>Both Addresses are not null</li>
   *   <li>The Addresses are not the same Address (checked by ID equality)</li>
   *   <li>The mergedAddress is not the PrimaryAddress for this Contact</li>
   *   <li>Both Addresses are on this Contact</li>
   * </ul>
   * After merging, any foreign key references to the mergedAddress will now reference the SurvivorAddress,
   * the old Address will be retired, and its' entry in this Contact's ContactAddress table will be removed.
   * 
   * @param contactPublicId the public ID of the contact that contains both addresses
   * @param survivingAddressPublicId the ublic ID of the address that should survive the merging process
   * @param mergedAddressPublicId the public ID of the address that will be merged into the suriving contact
   * @return the public ID of the suriving address
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If could not find contact by the given identifier ")
  @Throws(IllegalArgumentException, "If any argument is invalid")
  function mergeContactAddressesByPublicId(contactPublicId : String, survivingAddressPublicId : String, mergedAddressPublicId : String) : String {
    var survivingAddress : Address
    Transaction.runWithNewBundle(\ bundle -> {
      var contactToMergeOn = bundle.add(PCBeanFinder.loadBeanByPublicID<Contact>(contactPublicId, Contact))
      survivingAddress = bundle.add(PCBeanFinder.loadBeanByPublicID<Address>(survivingAddressPublicId, Address))
      var mergedAddress = bundle.add(PCBeanFinder.loadBeanByPublicID<Address>(mergedAddressPublicId, Address))

      if (contactToMergeOn == null) {
        throw new BadIdentifierException(displaykey.Contact.MergeAddresses.Error.NullContactArgument("PublicID", contactPublicId))
      }

      contactToMergeOn.mergeAddresses(survivingAddress, mergedAddress)
    })
    return survivingAddress.PublicID
  }

  /**
   * Merges the two Addresses passed in, provided:
   * <ul>
   *   <li>Both Addresses are not null</li>
   *   <li>The Addresses are not the same Address (checked by ID equality)</li>
   *   <li>The mergedAddress is not the PrimaryAddress for this Contact</li>
   *   <li>Both Addresses are on this Contact</li>
   * </ul>
   * After merging, any foreign key references to the mergedAddress will now reference the SurvivorAddress,
   * the old Address will be retired, and its' entry in this Contact's ContactAddress table will be removed.
   * 
   * @param contactABUID the AddressBookUID of the contact that contains both addresses
   * @param survivingAddressPublicId the ublic ID of the address that should survive the merging process
   * @param mergedAddressPublicId the public ID of the address that will be merged into the suriving contact
   * @return the  ABUID of the suriving address
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If could not find contact by the given identifier ")
  @Throws(IllegalArgumentException, "If any argument is invalid")
  function mergeContactAddressesByABUID(contactABUID : String, survivingAddressABUID : String, mergedAddressABUID : String) : String { 
    
    var survivingAddress : Address
     Transaction.runWithNewBundle(\ bundle -> {
      var contactToMergeOn = bundle.add(findContact(contactABUID))
      survivingAddress = bundle.add(findAddress(survivingAddressABUID))
      var mergedAddress = bundle.add(findAddress(mergedAddressABUID))
      
      if (contactToMergeOn == null) {
        throw new BadIdentifierException(displaykey.Contact.MergeAddresses.Error.NullContactArgument("AddressBookUID", contactABUID))
      }
      contactToMergeOn.mergeAddresses(survivingAddress, mergedAddress)
    })
    return survivingAddress.AddressBookUID                         
  }

  /**
   * Get work orders associated with the <code>Contact</code> and given status.
   * Throws if a non-null workOrderStatus is an invalid <code>PolicyPeriodStatus</code>.
   * 
   * @param addressBookUID the <code>AddressBookUID</code> of the <code>Contact</code>
   * @param workOrderStatus the <code>Status</code> of the <code>PolicyPeriod</code>s being searched for
   * @return array of <code>ResultInfo</code> objects representing all work orders associated with the <code>Contact</code>, with the given status, or null for all types of workOrderStatus.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If a matching contact already exists in PolicyCenter")
  function getAssociatedWorkOrders(addressBookUID : String, workOrderStatus : PolicyPeriodStatus) : gw.webservice.pc.pc700.gxmodel.jobmodel.types.complex.Job[] {
    var contact = findContactByAddressBookUID(addressBookUID)
    if (contact == null) {
       throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByAddressBookUID(addressBookUID))
    }
    return getAssociatedWorkOrders(contact, workOrderStatus)
  }
  
  private function getAssociatedWorkOrders(contact : Contact, workOrderStatus : PolicyPeriodStatus) : gw.webservice.pc.pc700.gxmodel.jobmodel.types.complex.Job[] {
    var jobs = contact.AssociationFinder.findWorkOrders(workOrderStatus)
    var infos = jobs.map(\ job -> new gw.webservice.pc.pc700.gxmodel.jobmodel.Job(job).$TypeInstance)
    return infos.toTypedArray()
  }

  
  /**
   * Get work orders associated with the <code>Contact</code> and given status.
   * Throws if a non-null workOrderStatus is an invalid <code>PolicyPeriodStatus</code>.
   * 
   * @param publicId the <code>publicId</code> of the <code>Contact</code>
   * @param workOrderStatus the <code>Status</code> of the <code>PolicyPeriod</code>s being searched for
   * @return array of <code>ResultInfo</code> objects representing all work orders associated with the <code>Contact</code>, with the given status, or null for all types of workOrderStatus.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If a matching contact already exists in PolicyCenter")
  function getAssociatedWorkOrdersByPublicID(publicId : String, workOrderStatus : PolicyPeriodStatus) : gw.webservice.pc.pc700.gxmodel.jobmodel.types.complex.Job[] {
    var contact = findContactByPublicID(publicId)
    if (contact == null) {
       throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByPublicID(publicId))
    }
    return getAssociatedWorkOrders(contact, workOrderStatus)
  }
  
  /**
   * Get policy periods associated with the <code>Contact</code>.
   * 
   * @param addressBookUID the <code>AddressBookUID</code> of the <code>Contact</code>
   * @return array of <code>PolicyPeriodInfo</code> objects representing all <code>PolicyPeriod</code>s associated with the <code>Contact</code>.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If a matching contact already exists in PolicyCenter")
  function getAssociatedPolicies(addressBookUID : String) : gw.webservice.pc.pc700.gxmodel.policyperiodmodel.types.complex.PolicyPeriod[] {
    var contact = findContactByAddressBookUID(addressBookUID)
    if (contact == null) {
       throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByAddressBookUID(addressBookUID))
    }
    return getAssociatedPolicies(contact)
  }
  
  private function getAssociatedPolicies(contact : Contact) : gw.webservice.pc.pc700.gxmodel.policyperiodmodel.types.complex.PolicyPeriod[] {
    var periods = contact.AssociationFinder.findPolicyPeriods()
    var infos = periods.map(\ period -> 
      new gw.webservice.pc.pc700.gxmodel.policyperiodmodel.PolicyPeriod(period.getSlice(period.EditEffectiveDate)).$TypeInstance
    )
    return infos.toTypedArray()
  }
  
  /**
   * Get policy periods associated with the <code>Contact</code>.
   * 
   * @param publicId the <code>publicId</code> of the <code>Contact</code>
   * @return array of <code>PolicyPeriodInfo</code> objects representing all <code>PolicyPeriod</code>s associated with the <code>Contact</code>.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If a matching contact already exists in PolicyCenter")
  function getAssociatedPoliciesByPublicID(publicId : String) : gw.webservice.pc.pc700.gxmodel.policyperiodmodel.types.complex.PolicyPeriod[] {
    var contact = findContactByPublicID(publicId)
    if (contact == null) {
       throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByPublicID(publicId))
    }
    return getAssociatedPolicies(contact)
  }
  
  /**
   * Get accounts associated with the <code>Contact</code> with the given addressBookUID.
   * 
   * @param addressBookUID the <code>AddressBookUID</code> of the <code>Contact</code>
   * @return array of <code>ContactAccountInfo</code> objects representing all <code>Account</code>s associated with the <code>Contact</code>
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If a matching contact already exists in PolicyCenter")
  function getAssociatedAccounts(addressBookUID : String) : gw.webservice.pc.pc700.gxmodel.accountmodel.types.complex.Account[] {
    var contact = findContactByAddressBookUID(addressBookUID)
    if (contact == null) {
       throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByAddressBookUID(addressBookUID))
    }
    return getAssociatedAccounts(contact)
  }
  
  private function getAssociatedAccounts(contact : Contact) : gw.webservice.pc.pc700.gxmodel.accountmodel.types.complex.Account[]{
    var accounts = contact.AssociationFinder.findAccounts()
    var infos = accounts.map(\ account -> 
       new gw.webservice.pc.pc700.gxmodel.accountmodel.Account(account).$TypeInstance
    )
    return infos
  }
  
  /**
   * Get accounts associated with the <code>Contact</code> with the given publicId.
   * 
   * @param publicId the <code>publicId</code> of the <code>Contact</code>
   * @return array of <code>ContactAccountInfo</code> objects representing all <code>Account</code>s associated with the <code>Contact</code>
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If a matching contact already exists in PolicyCenter")
  function getAssociatedAccountsByPublicID(publicId : String) : gw.webservice.pc.pc700.gxmodel.accountmodel.types.complex.Account[] {
    var contact = findContactByPublicID(publicId)
    if (contact == null) {
       throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByPublicID(publicId))
    }
    return getAssociatedAccounts(contact)
  }
  
  /**
   * Find a contact by the given addressBookUID, or else return null.
   * <p/>
   * Throws <code>RequiredFieldException</code> if the addressBookUID is null.
   */
  private function findContactByAddressBookUID(addressBookUID : String) : Contact {
    SOAPUtil.require(addressBookUID, "addressBookUID")
    var query = Query.make(Contact)
    query.compare("AddressBookUID", Equals, addressBookUID)
    return query.select().AtMostOneRow
  }
  
  /**
   * Find a contact by the given addressBookUID, or else return null.
   * <p/>
   * Throws <code>RequiredFieldException</code> if the addressBookUID is null.
   */
  private function findContactByPublicID(publicId : String) : Contact {
    SOAPUtil.require(publicId, "publicId")
    var query = Query.make(Contact)
    query.compare("PublicID", Equals, publicId)
    return query.select().AtMostOneRow
  }

  /**
   * Add a contact to PolicyCenter.
   * 
   * @param externalContact The external contact information to add.
   * @return The public ID of the newly added contact.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If a matching contact already exists in PolicyCenter")
  function addContact(externalContact : gw.webservice.pc.pc700.gxmodel.contactmodel.types.complex.Contact) : String {
    SOAPUtil.require(externalContact, "externalContact")
    if (externalContact.isContactExist()) {
      throw new BadIdentifierException(displaykey.Webservice.Error.ContactAlreadyExists)
    }
    var contact : Contact
    Transaction.runWithNewBundle(\ bundle -> {
      contact = externalContact.isPersonContact() ? new Person(bundle) : new Company(bundle)
      externalContact.populateContact(contact)
    })
    return contact.PublicID
  }

  /**
   * Update a contact in PolicyCenter.
   *
   * @param contactXML The external contact information to add.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If no matching contact can be found in PolicyCenter")
  @Throws(IllegalStateException, "If update is not allowed")
  override function updateContact(contactXML : XmlBackedInstance, transactionId : String) {
    var contact : Contact
    try {
      Transaction.runWithNewBundle(\ bundle -> {
        SOAPUtil.convertToSOAPException(PCLoggerCategory.CONTACT_API, \ -> {
          contact = bundle.add(findContact(contactXML.LinkID))
          if (contact == null) {
            throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByAddressBookUID(contactXML.LinkID))
          } else {
            if (contact.AutoSync != AutoSync.TC_ALLOW) {
              throw new IllegalStateException(displaykey.Webservice.Error.CannotUpdateContactUnlessAutoSyncIsAllowed(contact.AddressBookUID))
            }
            var mappingPlugin = ContactIntegrationXMLMapper.getInstance()
            mappingPlugin.populateContactFromXML(contact, contactXML)
            ContactTokenThreadLocal.setToken(contactXML.External_UpdateApp, contactXML.LinkID, entity.Contact)
          }
        })
      })
    }  finally {
      ContactTokenThreadLocal.clearAllTokens()
    }
  }
  
  /**
   * Removes a Contact accross all accounts. Contacts cannot be removed if they are
   * in use.  "In use" means used by an account.
   * 
   * @param addressBookUID the <code>AddressBookUID</code> of the <code>Contact</code>
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If unable to find the contact")
  @Throws(IllegalStateException, "If remove is not allowed")
  override function removeContact(addressBookUID : String, transactionId : String) {
    SOAPUtil.require(addressBookUID, "addressBookUID")
    Transaction.runWithNewBundle(\ bundle -> {
      SOAPUtil.convertToSOAPException(PCLoggerCategory.CONTACT_API, \ -> {
        var contact = bundle.add(findContact(addressBookUID))
        if (contact != null) {
          if (contact.AutoSync != AutoSync.TC_ALLOW) {
            throw new IllegalStateException(displaykey.Webservice.Error.CannotRemoveContactUnlessAutoSyncIsAllowed(addressBookUID))
          }
          if (isContactDeletable(addressBookUID)) {
            contact.unlinkAllAddresses()
            contact.remove()
          } else {
            createActivityForDelinkContactFromCtC(addressBookUID)
            contact.AddressBookUID = null
          }
        }
     })
   })
  }
  
  /**
   * Return true if the contact associated with the <code>AddressBookUID</code> can be deleted
   * or no contact is associated with <code>AddressBookUID</code>, false otherwise.
   * To be deletable, a contact must satisfy the following conditions: 
   * 
   * <ul>
   * <li>The contact must not be used by an account</li>
   * <li>The contact must not be used by a user</li>
   * <li>The contact must not be used as a participant in a reinsurance agreement</li>
   * <li>The contact must not be used as a broker in a reinsurance agreement</li> 
   * </ul>
   * 
   * @param addressBookUID the <code>AddressBookUID</code> of the <code>Contact</code>
   * @return true if the associated contact is deletable or nonexistant, false otherwise.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  override function isContactDeletable(addressBookUID : String) : boolean {
    SOAPUtil.require(addressBookUID, "addressBookUID")
    var contact = findContactByAddressBookUID(addressBookUID)
    return isContactDeletable(contact)
  }
  
  private function isContactDeletable(contact : Contact) : boolean {
    if(contact == null){
      return true
    }
    // if contact is not null and if autoSync is not Allowed, the contact will not be Deleteable
    if (contact != null and contact.AutoSync != AutoSync.TC_ALLOW) {
      return false
    }
        
    var accountContactQuery = new Query(AccountContact)
     .compare("Contact", Equals, contact)
     .select()   
    if (accountContactQuery.HasElements){
      return false
    }
    
    if (contact typeis UserContact){
      return false
    }
    
    var plugin = Plugins.get(IReinsurancePlugin)
    return plugin.isContactDeletable(contact)
  }
  
  /**
   * Return true if the contact associated with the <code>publicId</code> can be deleted
   * or no contact is associated with <code>publicId</code>, false otherwise.
   * To be deletable, a contact must satisfy the following conditions: 
   * 
   * <ul>
   * <li>The contact must not be used by an account</li>
   * <li>The contact must not be used by a user</li>
   * <li>The contact must not be used as a participant in a reinsurance agreement</li>
   * <li>The contact must not be used as a broker in a reinsurance agreement</li> 
   * </ul>
   * 
   * @param publicId the <code>publicId</code> of the <code>Contact</code>
   * @return true if the associated contact is deletable or nonexistant, false otherwise.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function isContactDeletableByPublicID(publicId : String) : boolean {
    SOAPUtil.require(publicId, "publicId")
    var contact = findContactByPublicID(publicId)
    return isContactDeletable(contact.AddressBookUID)
  }

  /**
   * Merge the deletedContact into the keptContact Contact.
   * Merging Contacts will have the following results:
   * <ul>
   *   <li>Non-duplicate entities on arrays (Addresses, RelatedContacts, CategoryScores, OfficialIDs, Tags) are merged 
   * onto the kept Contact; duplicate entries are discarded</li>
   *   <li>Fields on the deletedContact are not preserved</li>
   *   <li>If the deletedContact was an AccountHolder on an account, the keptContact will be made Active and given
   * the AccountHolder role on that account.</li>
   *   <li>AccountContacts referencing the deletedContact are changed to reference the keptContact; if both exist 
   * on the same Account the keptContact's AccountContact is used</li>
   *   <li>AccountContactRoles on a merged AccountContact are moved to the keptContact's AccountContact; again in 
   * the case of duplicate Roles the keptContact's roles are preserved</li>
   *   <li>PolicyContactRoles referencing a merged AccountContactRole are changed to reference the kept's 
   * AccountContactRole; duplicate PolicyContactRoles remain on the Policy, but will raise a validation error on Quote 
   * or Bind</li>
   *   <li>The deletedContact and any duplicate sub-Entity (AccountContacts, AccountContactRoles) are retired</li>
   *   <li>The keptContact is refreshed from the external Contact Management System (calls through to
   * {@link ContactSystemPlugin#retrieveContact(String, Bundle)})</li>
   * </ul>
   * 
   * @param keptContactABUID the UID of the contact to keep
   * @param deletedContactABUID the UID of contact to be replaced
   * @param transactionID the transaction ID of this message
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(IllegalArgumentException, "If any argument is invalid")
  override function mergeContacts(keptContactABUID : String, deletedContactABUID : String, transactionId : String) {
    var keptContact : Contact
    var deletedContact : Contact
    try {
      Transaction.runWithNewBundle(\ bundle -> {
        keptContact = bundle.add(Contact.findFromAddressBookUID(keptContactABUID))
        try {
          deletedContact = bundle.add(Contact.findFromAddressBookUID(deletedContactABUID))
        } catch (ignore : Exception ) {
          // We may not have the contact that is being deleted in PC, not an error
        }

        if (keptContact == null and deletedContact == null) {
          throw new IllegalArgumentException(displaykey.Contact.MergeContacts.Error.NullContactArgument)
        } else if (keptContact == null) {
          // The kept contact is no longer in PC, change to the ABUID that is passed in
          deletedContact.AddressBookUID = keptContactABUID;
          deletedContact.syncWithAddressBook()
        } else if (deletedContact == null) {
          // This is a no-op, nothing to do we don't have the contact they are asking us to merge. We still have to get the latest information about
          // the merged contact.
          keptContact.syncWithAddressBook()
        } else {
          // We have both in PC, need to merge them
          keptContact.mergeWithContact(deletedContact)
          keptContact.syncWithAddressBook()
        }

        ContactTokenThreadLocal.setToken("ab", keptContactABUID, entity.Contact)
      })
    }  finally {
      ContactTokenThreadLocal.clearAllTokens()
    }

  }

  /**
   * Merge the deletedContact Contact into the keptContact Contact.
   * Merging Contacts will have the following results:
   * <ul>
   *   <li>Non-duplicate entities on arrays (Addresses, RelatedContacts, CategoryScores, OfficialIDs, Tags) are merged 
   * onto the kept Contact; duplicate entries are discarded</li>
   *   <li>The AddressBookUID of the keptContact is preserved, unless it is null, in which case the deletedContact's 
   * AddressBookUID is used</li>
   *   <li>Fields on the deletedContact are not preserved</li>
   *   <li>If the deletedContact was an AccountHolder on an account, the keptContact will be made Active and given
   * the AccountHolder role on that account.</li>
   *   <li>AccountContacts referencing the deletedContact are changed to reference the keptContact; if both exist 
   * on the same Account the keptContact's AccountContact is used</li>
   *   <li>AccountContactRoles on a merged AccountContact are moved to the keptContact's AccountContact; again in 
   * the case of duplicate Roles the keptContact's roles are preserved</li>
   *   <li>PolicyContactRoles referencing a merged AccountContactRole are changed to reference the kept's 
   * AccountContactRole; duplicate PolicyContactRoles remain on the Policy, but will raise a validation error on Quote 
   * or Bind</li>
   *   <li>The merged Contact and any duplicate sub-Entity (AccountContacts, AccountContactRoles) are retired</li>
   * </ul>
   * 
   * @param keptContactPubId the public ID of the contact that should survive the merging process
   * @param deletedContactPubId the public ID of the contact that will be merged into the suriving contact
   * @return the public ID of the suriving contact
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(IllegalArgumentException, "If any argument is invalid")
  function mergeContactsByPublicId(keptContactPubId : String, deletedContactPubId : String) : String {
    var keptContact : Contact
    Transaction.runWithNewBundle(\ bundle -> {
      keptContact = bundle.add(PCBeanFinder.loadBeanByPublicID<Contact>(keptContactPubId, Contact))
      var deletedContact = bundle.add(PCBeanFinder.loadBeanByPublicID<Contact>(deletedContactPubId, Contact))

      if (keptContact == null or deletedContact == null) {
        throw new IllegalArgumentException(displaykey.Contact.MergeContacts.Error.NullContactArgument)
      }
      keptContact.mergeWithContact(deletedContact)
    })
    return keptContact.PublicID
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  
  private function createActivityForDelinkContactFromCtC(AddressBookUID : String) {
    var query = Query.make(AccountContact).join("Contact").compare("AddressBookUID", Equals, AddressBookUID).select()
    var bundle = Transaction.getCurrent()
    for( accountContact in query.iterator()) {
      bundle.add(accountContact)
      var activity = accountContact.newActivity(ActivityPattern.finder.getActivityPatternByCode("general_reminder"))
      activity.Subject = displaykey.Web.ContactManager.Warning.DeleteContact.Subject(accountContact)
      activity.Description = displaykey.Web.ContactManager.Warning.DeleteContact.Description
      activity.assignUserAndDefaultGroup(accountContact.Account.CreateUser)
    }
  }
  
  private function findContact(addressBookUID : String) : Contact {
    return Query.make(Contact).compare("AddressBookUID", Equals, addressBookUID).select().AtMostOneRow
  }

  private function findAddress(addressABUID : String) : Address {
    return Query.make(Address).compare("AddressBookUID", Equals, addressABUID).select().AtMostOneRow
  }
}
