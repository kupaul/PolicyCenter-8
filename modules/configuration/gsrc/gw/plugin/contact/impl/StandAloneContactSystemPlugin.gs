package gw.plugin.contact.impl

uses gw.plugin.contact.DuplicateContactResultContainer
uses java.lang.UnsupportedOperationException
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.contact.ContactResult
uses gw.api.databuilder.UniqueKeyGenerator
uses gw.plugin.contact.ContactCreator

/**
 * Contact system integration plugin used by PolicyCenter out-of-the-box.  It provides no real abilities.
 */

@Export
class StandAloneContactSystemPlugin implements ContactSystemPlugin {
  
  public static final var INSTANCE : ContactSystemPlugin = new StandAloneContactSystemPlugin()

  override function retrieveContact(uid: String, creator: ContactCreator) : Contact {
    throw new UnsupportedOperationException("Standalone contact system plugin should not be called to retrieve contact")
  }

  override function searchContacts(criteria : ContactSearchCriteria) : ContactResult[] {
    // never finds any results
    return {}
  }

  override function supportsFindingDuplicates() : boolean {
    return false
  }
  
  override function findDuplicates(p0 : Contact) : DuplicateContactResultContainer {
    throw new UnsupportedOperationException()
  }
  
  override function addContact(contact : Contact, transactionId : String) { 
    // mark the contact as synced
    contact.AddressBookUID = UniqueKeyGenerator.get().nextID()
  }

  override function addContact(contact : Contact, payload : String, transactionId : String) { 
    // mark the contact as synced
    contact.AddressBookUID = UniqueKeyGenerator.get().nextID()
  }

  override function updateContact(contact : Contact, changes : String, transactionId : String) { /*nop*/ }

  override function removeContact(p0 : Contact, removeInfo : String, transactionId : String) { /*nop*/ }

  override function overwriteContactWithLatestValues(p0 : Contact, p1 : String) { /*nop*/ }


  override function getReplacementAddressABUID(p0 : String) : String {
    return ""
  }

  override function createAsyncMessage(messageContext : MessageContext, contact : Contact, lateBoundABUID : boolean) {
  }

}
