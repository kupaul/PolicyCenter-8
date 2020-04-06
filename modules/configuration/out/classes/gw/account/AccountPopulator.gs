package gw.account

uses gw.api.system.PLDependenciesGateway
uses gw.pl.persistence.core.Bundle

uses java.util.Date

/**
 * Contains the fields used to create a new Account object.
 * An AccountPopulator pulls its fields from an AccountSearchCriteria.
 * It's the mechanism we use to formally control which fields are copied
 * from a new account *search* to an actual new Account.
 */
@Export
class AccountPopulator {

  var _firstName : String
  var _firstNameKanji : String
  var _lastName : String
  var _lastNameKanji : String
  var _companyName : String
  var _companyNameKanji : String
  var _officialId : String
  var _workPhone : String
  var _addressLine1 : String
  var _addressLine2 : String
  var _addressLine1Kanji : String
  var _addressLine2Kanji : String
  var _city : String
  var _cityKanji : String
  var _county : String
  var _state : State
  var _country : Country
  var _postalCode : String

  construct(searchCriteria : gw.account.AccountSearchCriteria) {
    _firstName = searchCriteria.FirstName
    _firstNameKanji = searchCriteria.FirstNameKanji
    _lastName = searchCriteria.LastName
    _lastNameKanji = searchCriteria.LastNameKanji
    _companyName = searchCriteria.CompanyName
    _companyNameKanji = searchCriteria.CompanyNameKanji
    _officialId = searchCriteria.OfficialId
    _workPhone = searchCriteria.Phone
    _addressLine1 = searchCriteria.AddressLine1
    _addressLine2 = searchCriteria.AddressLine2
    _addressLine1Kanji = searchCriteria.AddressLine1Kanji
    _addressLine2Kanji = searchCriteria.AddressLine2Kanji
    _city = searchCriteria.City
    _cityKanji = searchCriteria.CityKanji
    _county = searchCriteria.County
    _state = searchCriteria.State
    _country = searchCriteria.Country
    _postalCode = searchCriteria.PostalCode
  }

  /**
   * Creates and returns a new account in the given bundle, populating it based on the
   * fields in this object.  Also generates account number.
   *
   * @param bundle the bundle in which the account is to be created
   * @param contactType the specific type of contact for which the account is to be created
   * @return the new account
   */
  function createNewAccount(bundle : Bundle, contactType : ContactType) : Account {
    var account = Account.createAccountForContactType(bundle, contactType)
    account.OriginationDate = Date.Today
    populateContact(account.AccountHolder.AccountContact.Contact)
    account.updateAccountHolderContact()
    return account
  }

  /**
   * Populates the given contact based on fields in this class.
   *
   * @param contact the contact to populate
   */
  private function populateContact(contact : Contact) {
    var idType : OfficialIDType
    if (contact typeis Person) {
      var person = contact
      person.FirstName = _firstName
      person.FirstNameKanji = _firstNameKanji
      person.LastName = _lastName
      person.LastNameKanji = _lastNameKanji
      idType = OfficialIDType.TC_SSN
    } else {
      contact.Name = _companyName
      contact.NameKanji = _companyNameKanji
      idType = OfficialIDType.TC_FEIN
    }
    contact.setOfficialID(idType, _officialId)
    contact.WorkPhone = _workPhone
    contact.PrimaryAddress = new Address()
    var address = contact.PrimaryAddress
    address.AddressLine1 = _addressLine1
    address.AddressLine1Kanji = _addressLine1Kanji
    address.AddressLine2 = _addressLine2
    address.AddressLine2Kanji = _addressLine2Kanji
    address.City = _city
    address.CityKanji = _cityKanji
    address.County = _county
    address.State = _state
    address.PostalCode = _postalCode
    address.Country = _country == null
                      ? PLDependenciesGateway.getCommonDependencies().getDefaultCountry()
                      : _country
  }

}