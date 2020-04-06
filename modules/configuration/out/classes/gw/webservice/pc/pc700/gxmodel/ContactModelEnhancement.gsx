package gw.webservice.pc.pc700.gxmodel
uses gw.api.database.Query
uses gw.plugin.Plugins
uses gw.plugin.contact.ContactCreator
uses gw.plugin.contact.ContactSystemPlugin
uses gw.pl.persistence.core.Bundle

@Deprecated("As of 8.0 use gw.webservice.pc.pc800.gxmodel.ContactModelEnhancement instead")
enhancement ContactModelEnhancement : gw.webservice.pc.pc700.gxmodel.contactmodel.types.complex.Contact {

  function populateContact(contact : Contact){
    SimpleValuePopulator.populate(this, contact)
    if(contact typeis Person){
      contact.FirstName = this.entity_Person.FirstName
      contact.LastName = this.entity_Person.LastName
    }
    contact.PrimaryAddress = new Address(contact.Bundle)
    SimpleValuePopulator.populate(this.PrimaryAddress.$TypeInstance, contact.PrimaryAddress)
  }

  function findOrCreateContact(account : Account) : Contact{
    var result : Contact
    if(this.AddressBookUID <> null){
      var contactSystemPlugin = Plugins.get(ContactSystemPlugin)
      result = contactSystemPlugin.retrieveContact(this.AddressBookUID, new ContactCreator(account.Bundle))
    }else if(this.PublicID <> null){
      result = Query.make(Contact).compare("PublicID", Equals, this.PublicID).select().AtMostOneRow
    }

    if(result == null){
      if(this.entity_Person == null){// company
        result = account.AccountContacts*.Contact.firstWhere(\ c -> c typeis Company
          and c.Name == this.Name )
        if(result == null){
          result = new Company(account.Bundle)
          this.populateContact(result)
        }
      }else{//person
        result = account.AccountContacts*.Contact.firstWhere(\ c -> c typeis Person
          and c.FirstName == this.entity_Person.FirstName
          and c.LastName == this.entity_Person.LastName )
        if(result == null) {
          result = new Person(account.Bundle)
          this.populateContact(result)
        }
      }

    }
    return result
  }

  function createContact(bundle : Bundle) : Contact{
    var contact = isPersonContact() ? new Person(bundle) : new Company(bundle)
    populateContact(contact)
    return contact
  }

  function isContactExist() : boolean{
    if(not this.AddressBookUID_elem.$Nil){
      if(Contact.findFromAddressBookUID(this.AddressBookUID) <> null){
        return true
      }
    }
    if(not this.PublicID_elem.$Nil){
      if(Query.make(Contact).compare("PublicID", Equals, this.PublicID).select().HasElements){
        return true
      }
    }
    return false
  }

  function isPersonContact() : boolean{
    // In PC at the time this code is written, there is only 2 subtypes of contact
    return this.Subtype == typekey.Contact.TC_PERSON
  }
}
