package gw.plugin.contact.impl

uses gw.plugin.contact.ContactResult
uses gw.plugin.contact.ContactCreator
uses gw.api.address.AddressFormatter
uses gw.api.name.PersonNameFieldsImpl
uses gw.api.name.NameFormatter
uses gw.api.name.ContactNameFieldsImpl
uses gw.api.name.NameOwnerFieldId

/**
 * Parent class of all OOTB implementations of the ContactResult interface.  Provides
 * default implementations of the overwriteContactFields method and PrimaryPhoneValue
 * property.  Sub-classes (including customer implementations) can choose to replace
 * or extend these methods if necessary.
 */
@Export
abstract class AbstractContactResult implements ContactResult {
  override property get DisplayName(): String {
    if (this.ContactType == typekey.Contact.TC_COMPANY) {
      var contact = new ContactNameFieldsImpl(){
          : Name = CompanyName,
          : NameKanji = CompanyNameKanji
      }
      return new NameFormatter().format(contact, " ")
    } else {
      return this.PersonDisplayName
    }
  }

  property get PersonDisplayName(): String {
    if (this.ContactType == typekey.Contact.TC_PERSON) {
      var person = new PersonNameFieldsImpl(){
          : LastName = LastName,
          : LastNameKanji = LastNameKanji,
          : FirstName = FirstName,
          : FirstNameKanji = FirstNameKanji
      }
      return new NameFormatter().format(person, " ", NameOwnerFieldId.DISPLAY_NAME_FIELDS)
    } else {
      return null
    }
  }

  override property get DisplayAddress(): String {
    var formatter = populateAddressFormatter()
    formatter.IncludeCountry = true
    formatter.IncludeCounty = false
    return formatter.format(formatter, ", ")
  }

  override property get PrimaryPhoneValue(): String {
    if (PrimaryPhoneType == typekey.PrimaryPhoneType.TC_HOME) {
      return this.HomePhoneValue
    } else if (PrimaryPhoneType == typekey.PrimaryPhoneType.TC_WORK) {
      return this.WorkPhoneValue
    } else if (PrimaryPhoneType == typekey.PrimaryPhoneType.TC_MOBILE) {
      return this.CellPhoneValue
    }
    return null
  }

  override function hasAllRequiredFields(): boolean {
    return this.hasValidName() and this.hasValidPrimaryAddress()
  }

  function hasValidName(): boolean {
    return (this.ContactType == typekey.Contact.TC_COMPANY) ?
        (this.CompanyName.NotBlank or this.CompanyNameKanji.NotBlank):
        ((this.FirstName.NotBlank and this.LastName.NotBlank) or
         (this.FirstNameKanji.NotBlank and this.LastNameKanji.NotBlank))
  }

  function hasValidPrimaryAddressInUS(): boolean {
    return this.PrimaryAddressLine1.NotBlank and
        this.PrimaryAddressCity.NotBlank and
        this.PrimaryAddressState != null and
        this.PrimaryAddressPostalCode.NotBlank and
        this.PrimaryAddressType != null
  }

  function hasValidPrimaryAddressInFrance(): boolean {
    return this.PrimaryAddressLine1.NotBlank and
      this.PrimaryAddressCity.NotBlank and
      this.PrimaryAddressPostalCode.NotBlank and
      this.PrimaryAddressType != null
  }

  function hasValidPrimaryAddressInJapan(): boolean {
    return (this.PrimaryAddressLine1.NotBlank or this.AddressLine1Kanji.NotBlank) and
        (this.PrimaryAddressCity.NotBlank or this.CityKanji.NotBlank) and
        this.PrimaryAddressState != null and
        this.PrimaryAddressPostalCode.NotBlank and
        this.PrimaryAddressType != null
  }

  function hasValidPrimaryAddress(): boolean {
    switch (this.PrimaryAddressCountry) {
      case TC_JP:
          return this.hasValidPrimaryAddressInJapan()
      case TC_FR:
          return this.hasValidPrimaryAddressInFrance()
      default:
          return this.hasValidPrimaryAddressInUS()
    }
  }

  public override function convertToContactInNewBundleAndCommit(): Contact {
    var resultContact: Contact
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      resultContact = this.convertToContact(new ContactCreator(bundle))
    })
    return resultContact
  }

  private function populateAddressFormatter(): AddressFormatter {
    var addrFormatter = new AddressFormatter()
    addrFormatter.AddressLine1 = this.PrimaryAddressLine1
    addrFormatter.AddressLine2 = this.PrimaryAddressLine2
    addrFormatter.City = this.PrimaryAddressCity
    addrFormatter.County = this.PrimaryAddressCounty
    addrFormatter.PostalCode = this.PrimaryAddressPostalCode
    addrFormatter.State = this.PrimaryAddressState
    addrFormatter.Country = this.PrimaryAddressCountry
    addrFormatter.AddressLine1Kanji = this.AddressLine1Kanji
    addrFormatter.AddressLine2Kanji = this.AddressLine2Kanji
    addrFormatter.CityKanji = this.CityKanji
    return addrFormatter
  }
}
