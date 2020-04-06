package gw.webservice.pc.pc800.account
uses gw.xml.ws.annotation.WsiExportable

/**
 * Simple POGO used to pass search criteria to the AccountAPI.
 */
@Export
@WsiExportable("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/account/AccountSearchInfo")
final class AccountSearchInfo {
  
  var _accountNumber    : String as AccountNumber
  var _accountOrgType   : String as AccountOrgType  // corresponds to typekey.AccountOrgType
  var _accountStatus    : String as AccountStatus  // corresponds to typekey.AccountStatus
  var _industryCodeCode : String as IndustryCode
  var _originationDate  : DateTime as OriginationDate
  var _primaryLanguage  : String as PrimaryLanguage  // corresponds to typekey.LanguageType
  var _producerCodeCode : String as ProducerCode
  var _producerPublicID : String as ProducerPublicID

  var _firstName   : String as FirstName
  var _lastName    : String as LastName
  var _companyName : String as CompanyName

  var _officialId : String as OfficialId
  var _phone      : String as Phone
  
  var _addressLine1 : String as AddressLine1
  var _addressLine2 : String as AddressLine2
  var _city         : String as City
  var _country      : String as Country  // corresponds to typekey.Country
  var _county       : String as County
  var _postalCode   : String as PostalCode
  var _state        : String as State  // corresponds to typekey.State

  var _firstNameKanji     : String as FirstNameKanji
  var _lastNameKanji      : String as LastNameKanji
  var _nameKanji          : String as CompanyNameKanji
  var _particle           : String as Particle
  var _addressLine1Kanji  : String as AddressLine1Kanji
  var _addressLine2Kanji  : String as AddressLine2Kanji
  var _cityKanji          : String as CityKanji
  var _cedex              : boolean as CEDEX
  var _cedexBureau        : String as CEDEXBureau
}
