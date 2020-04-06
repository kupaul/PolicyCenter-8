package gw.plugin.contact.impl
uses gw.plugin.contact.ContactResult
uses java.util.Date
uses gw.plugin.contact.ContactCreator

/**
 * An implementation of the ContactResult interface that wraps an internal PolicyCenter
 * Contact record.  This is useful for displaying mixed results of internal and external
 * contacts in a single ListView, as done on the Search Contact page.  This class and all
 * sub-classes are guaranteed to return false for the External property.
 */
@Export
class ContactResultInternal extends AbstractContactResult implements ContactResult {

  var _contact : Contact

  construct(contact : Contact) {
    _contact = contact
  }

  override function convertToContact(creator : ContactCreator) : Contact {
    return creator.loadContact(_contact)
  }

  override final property get External() : boolean {
    return false
  }

  override property get CellPhone() : String {
    if (_contact typeis Person) {
      return _contact.CellPhone
    } else {
      return null
    }
  }

  override property get CellPhoneCountry() : PhoneCountryCode {
    if (_contact typeis Person) {
      return _contact.CellPhoneCountry
    } else {
      return null
    }
  }

  override property get CellPhoneExtension() : String {
    if (_contact typeis Person) {
      return _contact.CellPhoneExtension
    } else {
      return null
    }
  }

  override property get DateOfBirth() : Date {
    if (_contact typeis Person) {
      return _contact.DateOfBirth
    } else {
      return null
    }
  }

  override property get FirstName() : String {
    if (_contact typeis Person) {
      return _contact.FirstName
    } else {
      return null
    }
  }

  override property get FirstNameKanji() : String {
    if (_contact typeis Person) {
      return _contact.FirstNameKanji
    } else {
      return null
    }
  }

  override property get LastName() : String {
    if (_contact typeis Person) {
      return _contact.LastName
    } else {
      return null
    }
  }

  override property get LastNameKanji() : String {
    if (_contact typeis Person) {
      return _contact.LastNameKanji
    } else {
      return null
    }
  }

  override property get MiddleName() : String {
    if (_contact typeis Person) {
      return _contact.MiddleName
    } else {
      return null
    }
  }

  override property get Prefix() : NamePrefix {
    if (_contact typeis Person) {
      return _contact.Prefix
    } else {
      return null
    }
  }

  override property get Suffix() : NameSuffix {
    if (_contact typeis Person) {
      return _contact.Suffix
    } else {
      return null
    }
  }

// move to company
  override property get CompanyName() : String {
    if (_contact typeis Company) {
      return _contact.DisplayName
    } else {
      return null
    }
  }

  override property get CompanyNameKanji() : String {
    if (_contact typeis Company) {
      return _contact.NameKanji
    } else {
      return null
    }
  }

  override property get ContactAddressBookUID() : String {
    return _contact.AddressBookUID
  }

  override property get ContactType() : typekey.Contact {
    return _contact.Subtype
  }

  override property get DisplayName() : String {
    return _contact.DisplayName
  }

  override property get EmailAddress1() : String {
    return _contact.EmailAddress1
  }

  override property get EmailAddress2() : String {
    return _contact.EmailAddress2
  }

  override property get FaxPhone() : String {
    return _contact.FaxPhone
  }

  override property get FaxPhoneCountry() : PhoneCountryCode {
    return _contact.FaxPhoneCountry
  }

  override property get FaxPhoneExtension() : String {
    return _contact.FaxPhoneExtension
  }

  override property get HomePhone() : String {
    return _contact.HomePhone
  }

  override property get HomePhoneCountry() : PhoneCountryCode {
    return _contact.HomePhoneCountry
  }

  override property get HomePhoneExtension() : String {
    return _contact.HomePhoneExtension
  }

  override property get PersonDisplayName() : String {
    if (_contact typeis Person) {
      return _contact.DisplayName
    } else {
      return null
    }
  }

  override property get PreferredVendor() : Boolean {
    return _contact.Preferred
  }

  override property get PrimaryAddressCity() : String {
    return _contact.PrimaryAddress.City
  }

  override property get PrimaryAddressCountry() : Country {
    return _contact.PrimaryAddress.Country
  }

  override property get PrimaryAddressCounty() : String {
    return _contact.PrimaryAddress.County
  }

  override property get PrimaryAddressDescription() : String {
    return _contact.PrimaryAddress.Description
  }

  override property get PrimaryAddressLine1() : String {
    return _contact.PrimaryAddress.AddressLine1
  }

  override property get PrimaryAddressLine2() : String {
    return _contact.PrimaryAddress.AddressLine2
  }

  override property get PrimaryAddressLine3() : String {
    return _contact.PrimaryAddress.AddressLine3
  }

  override property get PrimaryAddressPostalCode() : String {
    return _contact.PrimaryAddress.PostalCode
  }

  override property get PrimaryAddressState() : State {
    return _contact.PrimaryAddress.State
  }

  override property get PrimaryAddressType() : AddressType {
    return _contact.PrimaryAddress.AddressType
  }

  override property get PrimaryAddressValidUntil() : Date {
    return _contact.PrimaryAddress.ValidUntil
  }

  override property get PrimaryPhoneType() : PrimaryPhoneType {
    return _contact.PrimaryPhone
  }

  override property get PrimaryPhoneValue() : String {
    return _contact.PrimaryPhoneValue
  }

  override property get Score() : Number {
    return _contact.Score
  }

  override property get VendorType() : VendorType {
    return _contact.VendorType
  }

  override property get WorkPhone() : String {
    return _contact.WorkPhone
  }

  override property get WorkPhoneCountry() : PhoneCountryCode {
    return _contact.WorkPhoneCountry
  }

  override property get WorkPhoneExtension() : String {
    return _contact.WorkPhoneExtension
  }

  override property get TaxID() : String {
    if (_contact typeis Person) {
      return _contact.SSNOfficialID
    } else {
      return _contact.FEINOfficialID
    }
  }

  override property get AddressLine1Kanji() : String {
    return _contact.PrimaryAddress.AddressLine1Kanji
  }

  override property get AddressLine2Kanji() : String {
    return _contact.PrimaryAddress.AddressLine2Kanji
  }

  override property get CityKanji() : String {
      return _contact.PrimaryAddress.CityKanji
  }

}
