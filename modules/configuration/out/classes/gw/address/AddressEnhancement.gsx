package gw.address

uses entity.Address
uses java.lang.String
uses com.guidewire.pl.web.controller.UserDisplayableException
uses java.lang.IllegalArgumentException
uses gw.api.database.Query
uses gw.api.database.Table
uses java.lang.IllegalStateException
uses gw.api.address.AddressFormatter

enhancement AddressEnhancement : Address
{

  /**
   * This is built for address internationalization.  See AddressFormatter and usages.
   */
  function addressString(delimiter : String, includeCountry : boolean, includeCounty : boolean) : String {

    var formatter = new AddressFormatter() {  :IncludeCounty = includeCounty,
                                              :IncludeCountry = includeCountry }
    return formatter.format(this, delimiter == "," ? ", " : delimiter)
  }
  
  property get CountryCode() : String {
    if (this.Country.Code <> null) {
      return this.Country.Code
    }
    return gw.api.system.PLConfigParameters.DefaultCountryCode.Value
  }

  property get IsModified() : boolean {
    return this.BeanVersion > 0 and this.Changed 
  }

  /**
   * Link this address as shared to the other address.
   * 
   * If the other address is already shared, this address will be added as a 
   * member of that addresses shared group, otherwise a new group of shared 
   * address will be created.
   * 
   * @throws UserDisplayableException if already linked to another address
   * @throws UserDisplayableException if already linked to given address by another address on this contact
   * @throws IllegalOperationException if this address is already linked.
   */
  function linkAddress(otherAddress : Address, contact : Contact) {    
    assertLinkAddressConsistency(otherAddress, contact)
    var linkGroup = maybeCreateLinkedAddress(otherAddress)
    linkGroup.addToAddresses(this)
    new AddressCopier(otherAddress).copyInto(this)
  }

  private function assertLinkAddressConsistency(otherAddress : Address, contact : Contact) {
    if (otherAddress == null){
      throw new IllegalArgumentException(displaykey.Web.Addresses.Linked.NullAddress)
    }
    if (this.LinkedAddress != null){
      throw new UserDisplayableException(displaykey.Web.Addresses.Linked.AlreadyLinked)
    }
    if (contact != null and contact.AllAddresses.hasMatch(\ a -> a.isLinkedToAddress(otherAddress))) {
      throw new UserDisplayableException(displaykey.Web.Addresses.Linked.ContactAlreadyLinked)
    }
  }
  
  /**
   * Find all contacts which have an address (primary or secondary) linked to this address.
   */
  function findLinkedContacts() : List<Contact> {
    if (this.LinkedAddress == null or this.LinkedAddress.New) {
      return {}
    }
    var primaryQuery = Query.make(Contact)
    var addressTable = primaryQuery.join("PrimaryAddress")
    joinLinkedAddressTable(addressTable)
    
    var secondaryQuery = Query.make(Contact)
    var contactAddressTable = secondaryQuery.join(ContactAddress, "Contact")
    var secondaryAddressTable = contactAddressTable.join("Address")
    joinLinkedAddressTable(secondaryAddressTable)

    var union = primaryQuery.union(secondaryQuery)
    
    return union.select().toList()
  }
  
  /**
   * Determines whether this address is linked to given address.
   * Will return false if this address is not linked at all.
   */
  function isLinkedToAddress(otherAddress : Address) : boolean {
    var linkedAddress = this.LinkedAddress
    if (linkedAddress == null) {
      return false
    }
    return linkedAddress == otherAddress.LinkedAddress
  }
  
  /**
   * Sync the link address to the one passed into the function
   * If the other address doesn't have a link address, we delink it.
   * If the other address has a linked address, we link to the same linked address.
   */
  function copyAndUpdateLinkedAddressesFrom(otherAddress : Address, targetContact : Contact) {
    // if other address is not link to anything else. Then we simplely just copy the value over.
    if (otherAddress.LinkedAddress == null) {
      if (this.LinkedAddress != null) { 
        this.unlink()
      }
      new AddressCopier(otherAddress).copyInto(this)
    } else { // if other address is linked, the we'll make sure the current address should link to the same.
      if (this.LinkedAddress != null and 
          this.LinkedAddress != otherAddress.LinkedAddress) {
          this.unlink()
      }
      if (this.LinkedAddress == null) {
        this.linkAddress(otherAddress, targetContact)
      }
      this.updateLinkedAddresses()  
    }
  }
  
  /**
   * Unlinks this Address. If the LinkedAddress only contains one more linked Address
   * the LinkedAddress entity will be removed and the remaining linked Address unlinked.
   * 
   * @throws IllegalStateException if this Address is not linked
   */
  function unlink() {
    var linkedAddress = this.LinkedAddress
    if (linkedAddress == null) {
      throw new IllegalStateException(displaykey.Web.Addresses.Linked.UnlinkException)
    }
    this.LinkedAddress = null
    var linkedAddresses = linkedAddress.Addresses
    if (linkedAddresses.Count == 1) {
      var remainingLinkedAddress = linkedAddresses.single()
      remainingLinkedAddress.LinkedAddress = null
    }
    if (not linkedAddress.Addresses.HasElements) {
      linkedAddress.remove()
    }
  }
  
  /**
   * Updates all linked addresses with the values of this address.
   */
  function updateLinkedAddresses() {
    var linkedAddress = this.LinkedAddress
    if (linkedAddress == null) {
      return
    }
    var linkedAddresses = linkedAddress.Addresses.where(\ a -> a != this)
    var copier = new AddressCopier(this)
    linkedAddresses.each(\ a -> copier.copyInto(a))
  }
  
  /**
   * Merges the {@link LinkedAddress}es of the given victim address and this surviving address.
   * 
   * @param victim The victim address whose {@link LinkedAddress}es will be merged.
   */
  function mergeLinkedAddresses(victim : Address) {
    var victimLinkedAddress = victim.LinkedAddress
    // short-circuit if victim already linked to this address or not linked at all
    if (victimLinkedAddress == null) {
      return
    }
    if (victim.isLinkedToAddress(this)) {
      victim.unlink()
      return
    }
    
    // Move all LinkedAddresses of victim to survivor
    var survivorLinkedAddress = maybeCreateLinkedAddress(this)
    victimLinkedAddress.Addresses.each(\ a -> { a.LinkedAddress = survivorLinkedAddress })
    
    //clean up
    victim.unlink()
    updateLinkedAddresses()
  }
  
  private function maybeCreateLinkedAddress(address : Address) : LinkedAddress {
    var linkedAddress = address.LinkedAddress
    if (linkedAddress == null) {
      linkedAddress = new LinkedAddress(this.Bundle)
      linkedAddress.addToAddresses(address)
    }
    return linkedAddress
  }
  
  private function joinLinkedAddressTable(table : Table<Contact>) {
    table.join("LinkedAddress").compare("Id", Equals, this.LinkedAddress.ID)
  }
  
  property get IsPolicyAddressInUse() : boolean {
    return this.Referenced or this.ReferencingPolicyAddresses.HasElements
  }
}
