package gw.plugin.billing.bc800

uses wsi.remote.gw.webservice.bc.bc800.entity.anonymous.elements.PCContactInfo_Addresses
uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.AddressInfo
uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.PCContactInfo

@Export
enhancement PCContactInfoEnhancement : PCContactInfo
{
  /**
   * When both PC and Billing System are integrated to Contact Manager, any shared 
   * contact between the 3 systems need to be synced to Contact Manager first before
   * sending to Billing System.
   */
  function sync(contact: Contact) {
    this.ContactType = contact typeis Person ? ContactType.TC_PERSON.Code
        : ContactType.TC_COMPANY.Code
    if (contact typeis Company) {
      this.Name = contact.Name
      this.NameKanji = contact.NameKanji
    } else {
      this.FirstName = (contact as Person).FirstName
      this.LastName = (contact as Person).LastName
      this.FirstNameKanji = (contact as Person).FirstNameKanji
      this.LastNameKanji = (contact as Person).LastNameKanji
      this.Particle = (contact as Person).Particle
    }

    // if locally created contact, substitute ExternalID for AddressBookUID
    if(contact.IsLocalOnly) {
      this.AddressBookUID = contact.ExternalID
    } else {
      this.AddressBookUID = contact.AddressBookUID
    }

    this.EmailAddress1 = contact.EmailAddress1
    this.PublicID = contact.PublicID
    this.WorkPhoneCountry = contact.WorkPhoneCountry.Code
    this.WorkPhone = contact.WorkPhone
    this.WorkPhoneExtension = contact.WorkPhoneExtension

    for(address in contact.AllAddresses) {
      var addressInfo = new AddressInfo()
      addressInfo.AddressBookUID = address.AddressBookUID
      addressInfo.AddressLine1 = address.AddressLine1
      addressInfo.AddressLine2 = address.AddressLine2
      addressInfo.AddressLine1Kanji = address.AddressLine1Kanji
      addressInfo.AddressLine2Kanji = address.AddressLine2Kanji
      addressInfo.City = address.City
      addressInfo.CityKanji = address.CityKanji
      addressInfo.State = address.State.Code
      addressInfo.PostalCode = address.PostalCode
      addressInfo.CEDEX = address.CEDEX
      addressInfo.CEDEXBureau = address.CEDEXBureau
      addressInfo.Country = address.Country.Code
      addressInfo.Primary = (address == contact.PrimaryAddress)
      var element = new PCContactInfo_Addresses()
      element.$TypeInstance = addressInfo
      this.Addresses.add(element)
    }
    // send the list of accounts to BC so that BC can update their names
    this.AccountNumbers = contact.findHeldAccounts()*.AccountNumber.toList()
    this.AccountName = contact.AccountName
    this.AccountNameKanji = contact.AccountNameKanji
  }
}
