package gw.contact

uses gw.api.database.Query
uses gw.api.name.ContactNameFieldsImpl
uses gw.api.name.NameFormatter
uses gw.api.name.PersonNameFieldsImpl
uses gw.api.policy.period.PolicyPeriodQueryFilters
uses gw.api.util.DisplayableException
uses gw.api.web.policy.ViewablePolicyPeriodQueryFilter
uses gw.losshistory.ClaimSearchCriteria
uses gw.pl.persistence.core.Bundle
uses gw.plugin.Plugins
uses gw.plugin.contact.ContactCreator
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.contact.DuplicateContactResult
uses gw.plugin.contact.DuplicateContactResultContainer

uses java.lang.IllegalArgumentException
uses java.util.Collection
uses java.util.Date
uses java.util.HashSet
uses gw.api.database.ISelectQueryBuilder
uses gw.api.name.ContactNameFields

enhancement ContactEnhancement : entity.Contact {
  
  static function findFromAddressBookUID(abUID : String) : Contact {
    return Query.make(Contact).compare(Contact#AddressBookUID.PropertyInfo.Name, Equals, abUID).select().AtMostOneRow    
  }
  
  static function createFromDuplicateResult(dup : DuplicateContactResult) : Contact {
    return Plugins.get(ContactSystemPlugin).retrieveContact(dup.ContactAddressBookUID, new ContactCreator(gw.transaction.Transaction.getCurrent()))
  }
  
  /**
   * Returns a list of potential duplicates from the IContactSystem plugin.  
   * 
   * N.B. This method supersedes the Platform-supplied {@link #findPotentialDuplicates()} method.
   */
  property get PotentialDuplicates() : DuplicateContactResultContainer {
    var plugin = Plugins.get(ContactSystemPlugin)
    return plugin.findDuplicates(this)
  }

  /**
   * Return true if the contact information should be set to the external contact system.
   */
  property get ShouldSendToContactSystem() : boolean {
    return this.AutoSync == AutoSync.TC_ALLOW 
        and not this.ID.Temporary
        and (isOnAccountWithLinkContacts() or isReinsuranceParticipant())
  }
  
  function isReinsuranceParticipant() : boolean{
    var query = Query.make(AgreementParticipant)
    query.compare("Participant", Equals, this)
    return query.select().HasElements
  }
  
  /**
   * @return true if this contact is not linked to any external address book
   */
  property get IsLocalOnly() : boolean {
    return this.AddressBookUID == null
  }
  
  /**
   * @return true if contact or the addresses associated to the contact is modified
   */
  property get IsModified() : boolean {
    return  this.Changed || 
           (this.AllAddresses.countWhere(\ a -> a.IsModified) > 0) 
  }
  
  /**
   * @return true if the bean version for contact and the associated addresses are all 0 
   */
  property get IsFirstVersion() : boolean {
    return this.BeanVersion == 0 and
           (this.AllAddresses.countWhere(\ a -> a.BeanVersion != 0 ) == 0)
  }

  /**
   * Override information on this contact with information from address book
   */
  function syncWithAddressBook() {
    var plugin = Plugins.get(ContactSystemPlugin)
    plugin.retrieveContact(this.AddressBookUID, new ContactCreator(this.Bundle))
  }
  
  /**
   * Safely removes an address from this contact by first ensuring that the address 
   * is not in use.
   * 
   */
  function safeRemoveAddress(address : Address) {
    if (this.addressIsPolicyAddressInUse(address)) {
      throw new DisplayableException(displaykey.Java.Error.Contact.CannotRemoveAddress(address))
    }
    // Possible problem if PolicyAddress is committed after check and before removal
    if (address.LinkedAddress != null) {
      address.unlink()
    }
    this.removeAddress(address)
  }

  /**
   * If the given Address is a PolicyAddress, prevent the removal, and simply null out the ContactAddress and Address ABUID
   * If the given Address is a LinkedAddress, remove it from the LinkedAddress set, proceed with removing Address
   * Otherwise, remove the Address as normal (including removing the Address itself)
   */
  function removeOrDelinkAddress(address : Address) {
    var replacementAddr = findReplacementAddress(address)
    if (address.LinkedAddress != null) {
      var linkAddress = address.LinkedAddress
      address.unlink()
      if (replacementAddr != null) {
        replacementAddr.linkAddress(linkAddress.Addresses.first(), this)
      }
    }
    if ((address.IsPolicyAddressInUse and replacementAddr == null) or this.PrimaryAddress == address) {
      address.AddressBookUID = null
      if (this.ContactAddresses.firstWhere(\ c -> c.Address == address) != null) {
        this.ContactAddresses.singleWhere(\ c -> c.Address == address).AddressBookUID = null
      }
    } else if (this.addressIsPolicyAddressInUse(address)) {
      for(policyAddr in address.ReferencingPolicyAddresses) {
        policyAddr = this.Bundle.add(policyAddr)
        policyAddr.assignToSource(replacementAddr)
        replacementAddr.mergeReferenceWith(address)
      }
      this.removeAddress(address)
      address.remove()
    } else {
      this.removeAddress(address)
      address.remove()
    }
  }
  
  function addressIsPolicyAddressInUse(address : Address) : boolean {
    return address.IsPolicyAddressInUse
  }
  
  private function findReplacementAddress(address : Address) : Address {
    if (address.AddressBookUID == null) {
      return null
    }
    
    var plugin = Plugins.get(ContactSystemPlugin)
    var replacementABUID = plugin.getReplacementAddressABUID(address.AddressBookUID)
    if (replacementABUID == null) {
      return null
    }
    return this.AllAddresses.firstWhere(\ a -> a.AddressBookUID == replacementABUID)
  }

  /**
   * Merges the passed in contact into this Contact, eventually retiring the passed in contact once
   * the merge is complete.
   */
  function mergeWithContact(contact : Contact) {
    // first, some basic argument checks - not null, not the same as this Contact, and having the same subtype
    if (contact == null) {
      throw new IllegalArgumentException(displaykey.Contact.MergeContacts.Error.NullContactArgument)
    }
    if (contact == this) {
      throw new IllegalArgumentException(displaykey.Contact.MergeContacts.Error.SameContactArgument)
    }
    if (this.Subtype != contact.Subtype) {
      throw new IllegalArgumentException(displaykey.Contact.MergeContacts.Error.DifferentContactSubTypeArgument(this.Subtype, contact.Subtype))
    }
    
    // merge Contact level fields
    mergeContactFields(contact)
    
    // merge Arrays
    mergeContactAddresses(contact)
    mergeOfficialIDs(contact)
    mergeRelatedContacts(contact)
    mergeCategoryScores(contact)
    mergeTags(contact)
    
    // merge AccountContacts
    mergeAccountContacts(contact)
    
    // retire the merged contact by call bean.remove()
    contact.remove()
  }

  /**
   * It copies fields directly belong to the contact, copies the primary address
   * and also copies the associated addresses. It doesn't copy UW issues and other stuff
   * corresponding to the contact.
   */
  function copyUIFieldsFromContact(copyFromContact : Contact) {
    new ContactCopier(copyFromContact).copyInto(this)
    this.PrimaryAddress.copyAndUpdateLinkedAddressesFrom(copyFromContact.PrimaryAddress, this)
    // remove address which is been removed from copyFromcontact
    this.ContactAddresses.each(\ ca -> {
      if (!copyFromContact.ContactAddresses.hasMatch(\ c -> c.Address.AddressBookUID == ca.Address.AddressBookUID )) {
        this.removeAddress(ca.Address)
      }
    })
    for (copyFromContactAddress in copyFromContact.ContactAddresses) {
      var targetContactAddress = this.ContactAddresses.where(\ c -> c.AddressBookUID == copyFromContactAddress.AddressBookUID)
      // add the address if it doesn't exist in the target contact
      if (targetContactAddress == null or targetContactAddress.length == 0) {
        this.addAddress(copyFromContactAddress.Address)
      } else {
        targetContactAddress.first().Address.copyAndUpdateLinkedAddressesFrom(copyFromContactAddress.Address, this)
      }
    }
  }
  
 
  
  private function mergeContactFields(contact : Contact) {
    // merge the AddressBookUID if this Contact does not have one
    if (this.AddressBookUID == null) {
      this.AddressBookUID = contact.AddressBookUID
    }
  }
  
  private function mergeContactAddresses(contact : Contact) {
    // make the primary address of the merged contact to be a regular address on this contact
    var primaryAsContactAddress = new ContactAddress()
    primaryAsContactAddress.Address = contact.PrimaryAddress
    if (not beansContainABLinkable(this.AllAddresses.toList(), primaryAsContactAddress.Address)) {
      this.addToContactAddresses(primaryAsContactAddress)
    }
    
    // move all contact addresses from the merged contact to this contact, if there is no Address with the given ABUID
    for(address in contact.ContactAddresses) {
      if (not beansContainABLinkable(this.AllAddresses.toList(), address.Address)) {
        address.Contact = this
      }
    }
  }
  
  private function mergeOfficialIDs(contact : Contact) {
    var officialIdMap = this.OfficialIDs.partition(\ o -> getOfficialIdKey(o))
    for(officialId in contact.OfficialIDs) {
      if((not officialIdMap.containsKey(getOfficialIdKey(officialId))) and
          (canOverwriteOfficialID(officialId))) {
        officialId.Contact = this
        officialIdMap.put(getOfficialIdKey(officialId), {officialId})
      }
    }
  }
  /**
   * Extra logic for merging the official IDs.
   * A single contact is only allowed to have one SSN or FEIN.
   * If the contact already has either SSN or FEIN, then don't merge another SSN or FEIN to this one. 
   * It's ok to add new SSN or FEIN if this contact doesn't have any.
   */
  private function canOverwriteOfficialID(officialId : OfficialID) : boolean {
    if (officialId.OfficialIDType == TC_SSN or officialId.OfficialIDType == TC_FEIN) {
      return (this.SSNOfficialID == null and this.FEINOfficialID == null) 
    }
    return true
  }
  
  private function getOfficialIdKey(officialId : OfficialID) : String {
    return officialId.OfficialIDType + ";" + officialId.State + ";" + officialId.OfficialIDValue
  }
  
  private function mergeRelatedContacts(contact : Contact) {
    var relatedContactMap = this.AllContactContacts.partition(\ o -> getContactContactKey(o))
    for(contactContact in contact.AllContactContacts) {
      if (contactContact.RelatedContact == contact) {
        contactContact.RelatedContact = this
      }
      if (contactContact.SourceContact == contact) {
        contactContact.SourceContact = this
      }
      // if this related contact is already on the surviving contact, remove the just added duplicate
      if (relatedContactMap.containsKey(getContactContactKey(contactContact))) {
        // figure out if this is a source or target relationship
        if (contactContact.SourceContact == this) {
          this.removeFromSourceRelatedContacts(contactContact)
        } else {
          this.removeFromTargetRelatedContacts(contactContact)
        }
      } else {
        relatedContactMap.put(getContactContactKey(contactContact), {contactContact})
      }
    }
  }
  
  private function getContactContactKey(contactContact : ContactContact) : String {
    return contactContact.SourceContact + ";" + contactContact.RelatedContact + ";" + contactContact.Relationship
  }
  
  private function mergeCategoryScores(contact : Contact) {
    var categoryMap = this.CategoryScores.partition(\ c -> c.ReviewCategory.Code)
    for(categoryScore in contact.CategoryScores) {
      if (not categoryMap.containsKey(categoryScore.ReviewCategory.Code)) {
        if (not beansContainABConvertable(this.CategoryScores.toList(), categoryScore)) {
          categoryScore.Contact = this
          categoryMap.put(categoryScore.ReviewCategory.Code, {categoryScore})
        }
      }
    }
  }
  
  private function mergeTags(contact : Contact) {
    var tags = this.Tags*.Type.toSet()
    for(tag in contact.Tags) {
      if (not tags.contains(tag.Type)) {
        var contactTag = new ContactTag(contact)
        contactTag.Type = tag.Type
        this.addToTags(contactTag)
      }
    }
  }
  
  private function beansContainABLinkable(beans : Collection<AddressBookLinkable>, checkBean : AddressBookLinkable) : boolean {
    var checkABUID = checkBean.getFieldValue("AddressBookUID")
    return (checkABUID != null and beans.map(\ a -> a.getFieldValue("AddressBookUID")).toSet().contains(checkABUID))
  }
  
  private function beansContainABConvertable(beans : Collection<AddressBookConvertable>, checkBean : AddressBookConvertable) : boolean {
    return (checkBean.AddressBookUID != null and beans*.AddressBookUID.toSet().contains(checkBean.AddressBookUID))
  }
  
  private function mergeAccountContacts(contact : Contact) {
    Query.make(AccountContact).compare(AccountContact#Contact.PropertyInfo.Name, Equals, contact).select().each(\ oldAcctContact -> {
      // finders return in read-only bundles, so add to the local writeable bundle
      oldAcctContact = this.Bundle.add(oldAcctContact)
      
      // if both contacts are on the same account, merge Account Contact Roles
      if (oldAcctContact.Account.AccountContacts.hasMatch(\ a -> a.Contact == this)) {
        var survivingAccountContact = oldAcctContact.Account.AccountContacts.firstWhere(\ a -> a.Contact == this)
        survivingAccountContact.merge(oldAcctContact)
      } else {
        // if not on the same account, just repoint the AccountContact to the surviving Contact
        oldAcctContact.Contact = this
      }
      
    })
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
   */
  public function mergeAddresses(survivingAddress : Address, mergedAddress : Address) {
    if (survivingAddress == null) {
      throw new IllegalArgumentException(displaykey.Contact.MergeAddresses.Error.NullSurvivorAddress)
    }
    if (mergedAddress == null) {
      throw new IllegalArgumentException(displaykey.Contact.MergeAddresses.Error.NullMergedAddress)
    }
    if (mergedAddress == survivingAddress) {
      throw new IllegalArgumentException(displaykey.Contact.MergeAddresses.Error.SurvivorAddressSameAsMergedAddress(survivingAddress))
    }
    if (mergedAddress == this.PrimaryAddress) {
      throw new IllegalArgumentException(displaykey.Contact.MergeAddresses.Error.MergedAddressCannotBePrimary(mergedAddress))
    }
    
    // verify that both addresses are on this contact
    var mergedContactAddress = this.ContactAddresses.firstWhere(\ c -> c.Address == mergedAddress)
    var survivorContactAddress = this.ContactAddresses.firstWhere(\ c -> c.Address == survivingAddress)
    if (mergedContactAddress == null) {
      throw new IllegalArgumentException(displaykey.Contact.MergeAddresses.Error.MergedAddressNotOnContact(mergedAddress, this))
    }
    if (survivorContactAddress == null and survivingAddress != this.PrimaryAddress) {
      throw new IllegalArgumentException(displaykey.Contact.MergeAddresses.Error.SurvivorAddressNotOnContact(survivingAddress, this))
    }
    
    // update any PolicyAddress that references the mergedAddress to point at the 
    Query.make(PolicyAddress).compare(PolicyAddress#Address.PropertyInfo.Name, Equals, mergedAddress).select().each(\ policyAddr -> {
      // finders are read-only bundles, so add the found PolicyAddress to the current bundle
      policyAddr = this.Bundle.add(policyAddr)
      policyAddr.assignToSource(survivingAddress)
    })
    
    // update the referenced bit if necessary
    survivingAddress.mergeReferenceWith(mergedAddress)
    
    survivingAddress.mergeLinkedAddresses(mergedAddress)
    this.removeFromContactAddresses(mergedContactAddress)
    mergedAddress.remove()
  }

  property get AssociationFinder() : ContactAssociationFinder{
    return new ContactAssociationFinder(this)
  }
  
  /**
   * Returns true if this Contact is an AccountContact on any account with the LinkContacts flag set to true
   */
  private function isOnAccountWithLinkContacts() : boolean {
    /**
     * SELECT count(*)
     *   FROM Contact c
     *   INNER JOIN AccountContact ac
     *     ON c.ID == ac.ContactID
     *   INNER JOIN Account a
     *     ON a.ID == ac.AccountID
     *   WHERE a.LinkContacts == true
     *   AND c.ID = this.ID
     */
    var query = Query.make(Contact)
    var accountContactTable = query.join(AccountContact, "Contact")
    var accountTable = accountContactTable.join("Account")
    accountTable.compare("LinkContacts", Equals, true)
    query.compare("ID", Equals, this.ID)
    return query.select().getCountLimitedBy(1) > 0
  }

  /**
   * @return true if the contact is associated on at least one account that has a bound contact.  false otherwise
   * or if the relationship exists but has not been persisted to the database yet.
   */
  function isOnAccountWithBoundPeriod() : boolean {
    /**
     * SELECT count(*)
     *   FROM Contact c
     *  WHERE EXISTS 
     *     (SELECT *
     *        FROM AccountContacts ac
     *       WHERE ac.ContactID == c.ID)
     *         AND EXISTS 
     *         (SELECT *
     *            FROM Policy p
     *           WHERE p.Account = ac.Account
     *             AND EXISTS
     *          (SELECT *
     *             FROM PolicyPeriod pp
     *            WHERE pp.Policy == p.ID
     *              and pp.Status = TC_BOUND)
     *         )
     *     )
     * )
     */
    var isOnAccountWithBoundPeriod = false
    if (this.ID.Temporary){
      isOnAccountWithBoundPeriod = false
    } else {
      var contactIsOnAccountWithBoundPeriodQuery = Query.make(Contact)
          .compare("ID", Equals, this.ID)
          .subselect("ID", CompareIn, AccountContact, "Contact")
            .subselect("Account", CompareIn, Policy, "Account")
              .subselect("ID", CompareIn, PolicyPeriod, "Policy")
                .compare("Status", Equals, PolicyPeriodStatus.TC_BOUND)
          .select().AtMostOneRow
      isOnAccountWithBoundPeriod = contactIsOnAccountWithBoundPeriodQuery != null
    }
    return isOnAccountWithBoundPeriod
  }
  
  /**
   * Unlinks all addresses of this contact, e.g. if the contact is being removed.
   */
  function unlinkAllAddresses() {
    this.AllAddresses.each(\ a -> {
      if (a.LinkedAddress != null) {
        a.unlink()
      }
    })
  }

  /**
   * Return a ClaimSearchCriteria that can be used to search for claims.
   * @return a new ClaimSearchCriteria
   */
  property get NewClaimSearchCriteria() : ClaimSearchCriteria {
    var criteria = new ClaimSearchCriteria()
    criteria.Contact = this
    criteria.DateCriteria.StartDate = Date.Today.addYears(-1)
    criteria.DateCriteria.EndDate = Date.Today
    criteria.DateCriteria.DateSearchType = "enteredrange"
    return criteria
  }

  /**
   * Returns the bound PolicyPeriods that are linked to this contact and for
   * which the current user has view permission. The database is queried directly,
   * so changes in the current bundle are not reflected in the results.
   */
  property get PolicyPeriods() : Collection<PolicyPeriod> {
    if (this.New) {
      return new HashSet<PolicyPeriod>()
    } else {
      var query = Query.make(PolicyPeriod)
                     .withDistinct(true) as ISelectQueryBuilder<PolicyPeriod>
      PolicyPeriodQueryFilters.bound(query)
      // "BranchValue" is the name of the property for the BranchID column
      query.join(PolicyContactRole, "BranchValue")
           .join("AccountContactRole")
           .join("AccountContact")
           .compare("Contact", Equals, this)
      // filterNew doesn't always mutate the query passed in, so use the return value
      query = new ViewablePolicyPeriodQueryFilter().filterNewQuery(query) as ISelectQueryBuilder<PolicyPeriod>
      return query.select().toSet()
    }
  }
  
  static function findContactInBundleOrDB(contactUID : String, bundle : Bundle) : Contact {
    var foundContact = bundle.InsertedBeans.whereTypeIs(entity.Contact).where(\ c -> c.AddressBookUID == contactUID).first()
    if (foundContact != null) {
      return foundContact
    }

    // next, look for updated beans in the current bundle
    foundContact = bundle.UpdatedBeans.toCollection().whereTypeIs(entity.Contact).where(\ c -> c.AddressBookUID == contactUID).first()
    if (foundContact != null) {
      return foundContact
    }

    // see if we've deleted the contact - this might be an error
    foundContact = bundle.RemovedBeans.toCollection().whereTypeIs(entity.Contact).where(\ c -> c.AddressBookUID == contactUID).first()
    if (foundContact != null) {
      return foundContact
    }

    // when we don't find a matching Contact in the bundle at all, run a query against the DB to find at most one contact with that ABUID
    foundContact = Query.make(Contact).compare(Contact#AddressBookUID.PropertyInfo.Name, Equals, contactUID).select().AtMostOneRow    
    if (foundContact != null) {
      // Make sure that it's in our bundle
      foundContact = bundle.add(foundContact)
    }

    return foundContact
  }

  /**
   * Returns the account name that should be used for all the accounts where this contact is the the account holder.
   */
  property get AccountName() : String {
    var formattedName : String
    var contact : ContactNameFields
    if (this typeis Person) {
      contact = new PersonNameFieldsImpl() {
        :LastName = this.LastName,
        :FirstName = this.FirstName,
        :Particle = this.Particle
      }
    } else {
      contact = new ContactNameFieldsImpl() {
        :Name = this.Name
      }
    }
    formattedName = new NameFormatter().format(contact, " ")
    return formattedName.HasContent ? formattedName : null
  }
}
