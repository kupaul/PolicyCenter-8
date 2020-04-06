package gw.webservice.pc.pc700.ccintegration.ccentities
uses java.util.Date
uses java.math.BigDecimal

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCContact
{
  var _allAddresses : CCAddress[] as AllAddresses
  var _bureauIDOfficialID : String as BureauIDOfficialID
  var _AddressBookUID : String as AddressBookUID
  var _PolicySystemID : String as PolicySystemID
  var _contactAddresses : CCContactAddress[] as ContactAddresses
  var _contactCompany : CCCompany as ContactCompany
  var _DOLIDOfficialID : String as DOLIDOfficialID
  var _DUNSOfficialID : String as DUNSOfficialID
  var _emailAddress1 : String as EmailAddress1
  var _emailAddress2 : String as EmailAddress2
  var _FEINOfficialID : String as FEINOfficialID
  var _faxPhone : String as FaxPhone
  var _homePhone : String as HomePhone
  var _nCCIIDOfficialID : String as NCCIIDOfficialID
  var _name : String as Name
  var _notes : String as Notes
  var _officialIDs : CCOfficialID[] as OfficialIDs
  var _organizationType : String as OrganizationType
  var _preferred : java.lang.Boolean as Preferred
  var _preferredCurrency : String as PreferredCurrency
  var _primaryAddress : CCAddress as PrimaryAddress
  var _primaryContact : CCContact as PrimaryContact
  var _primaryLanguage : String as PrimaryLanguage
  var _primaryPhone : String as PrimaryPhone
  var _primaryPhoneValue : String as PrimaryPhoneValue
  var _SSNOfficialID : String as SSNOfficialID
  var _STAXOfficialID : String as STAXOfficialID
  var _STUNOfficialID : String as STUNOfficialID
  var _score : java.lang.Integer as Score
  var _specialtyType : String as SpecialtyType
  var _TUNSOfficialID : String as TUNSOfficialID
  var _taxID : String as TaxID
  var _taxStatus : String as TaxStatus
  var _vendorNumber : String as VendorNumber
  var _vendorType : String as VendorType
  var _w9Received : java.lang.Boolean as W9Received
  var _w9ReceivedDate : Date as W9ReceivedDate
  var _w9ValidFrom : Date as W9ValidFrom
  var _w9ValidTo : Date as W9ValidTo
  var _withholdingRate : BigDecimal as WithholdingRate
  var _workPhone : String as WorkPhone

  construct()
  {
  }
}
