package gw.webservice.pc.pc700.ccintegration

uses gw.webservice.pc.pc700.ccintegration.ccentities.CCCompany
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPerson
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCContact
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCCompanyVendor
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPersonVendor
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPlace
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCAdjudicator
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCLegalVenue
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCContactAddress
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCOfficialID
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCAddress
uses java.util.ArrayList
uses java.util.HashMap
uses java.util.Map
uses gw.plugin.phone.IPhoneNormalizerPlugin
uses gw.plugin.Plugins
uses gw.api.util.phone.GWPhoneNumberBuilder

/**
 * Maps PC Contacts to the ccentities Contact objects.  These mappings are all quite
 * straightforward since the ccentities Contact related objects are very
 * similar to the PC Contact objects.
 */
 @Export
 @Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.CCContactGenerator instead")
class CCContactGenerator
{
  // store objects here that might be accessed from various parts of the 
  // PC policy object graph so we don't create duplicate copies
  private var _mappedPCContactObjects : Map<Key, Object>
  private var _phoneNormalizer = Plugins.get(IPhoneNormalizerPlugin)

  construct()
  {
    _mappedPCContactObjects = new HashMap<Key, Object>()
  }

  public function getOrCreateContact( pcContact : entity.Contact ) : CCContact
  {
    if( pcContact == null )
    {
      return null
    }
    var ccContact = _mappedPCContactObjects.get( pcContact.ID ) as CCContact
    if( ccContact != null )
    {
      return ccContact
    }
    switch( typeof pcContact )
    {
      case entity.CompanyVendor:
        ccContact = new CCCompanyVendor()
        _mappedPCContactObjects.put( pcContact.ID, ccContact )
        setCompanyFields(ccContact as CCCompany, pcContact)
        break
      case entity.Company:
        ccContact = new CCCompany()
        _mappedPCContactObjects.put( pcContact.ID, ccContact )
        setCompanyFields(ccContact as CCCompany, pcContact)
        break
      case entity.Adjudicator:
        ccContact = new CCAdjudicator()
        _mappedPCContactObjects.put( pcContact.ID, ccContact )
        (ccContact as CCAdjudicator).AdjudicatorLicense = pcContact.AdjudicatorLicense
        setPersonFields(ccContact as CCPerson, pcContact)
        break
      case entity.PersonVendor:
        ccContact = new CCPersonVendor()
        _mappedPCContactObjects.put( pcContact.ID, ccContact )
        setPersonFields(ccContact as CCPerson, pcContact)
        break
      case entity.Person:
        ccContact = new CCPerson()
        _mappedPCContactObjects.put( pcContact.ID, ccContact )
        setPersonFields(ccContact as CCPerson, pcContact)
        break
      case entity.LegalVenue:
        ccContact = new CCLegalVenue()
        _mappedPCContactObjects.put( pcContact.ID, ccContact )
        (ccContact as CCLegalVenue).VenueType = pcContact.VenueType.Code
        break
      case entity.Place:
        ccContact = new CCPlace()
        _mappedPCContactObjects.put( pcContact.ID, ccContact )
        break
    }
    if( ccContact != null )
    {
      var workPhone = new GWPhoneNumberBuilder().withCountryCode(pcContact.WorkPhoneCountry)
          .withNationalNumber(pcContact.WorkPhone).withExtension(pcContact.WorkPhoneExtension).build()
      ccContact.WorkPhone = workPhone == null ? null : _phoneNormalizer.formatPhoneNumber(workPhone)
      ccContact.NCCIIDOfficialID = pcContact.NCCIIDOfficialID
      var faxPhone = new GWPhoneNumberBuilder().withCountryCode(pcContact.FaxPhoneCountry)
          .withNationalNumber(pcContact.FaxPhone).withExtension(pcContact.FaxPhoneExtension).build()
      ccContact.FaxPhone = faxPhone == null ? null : _phoneNormalizer.formatPhoneNumber(faxPhone)
      var homePhone = new GWPhoneNumberBuilder().withCountryCode(pcContact.HomePhoneCountry)
          .withNationalNumber(pcContact.HomePhone).withExtension(pcContact.HomePhoneExtension).build()
      ccContact.HomePhone = homePhone == null ? null : _phoneNormalizer.formatPhoneNumber(homePhone)
      ccContact.OfficialIDs = getOrCreateOfficialIDArray( pcContact.OfficialIDs )
      ccContact.FEINOfficialID = pcContact.FEINOfficialID
      ccContact.DOLIDOfficialID = pcContact.DOLIDOfficialID
      ccContact.PrimaryContact = getOrCreateContact( pcContact.PrimaryContact )
      ccContact.TaxStatus = pcContact.TaxStatus.Code
      ccContact.ContactCompany = getOrCreateContact( pcContact.ContactCompany ) as CCCompany
      ccContact.DUNSOfficialID = pcContact.DUNSOfficialID
      ccContact.PrimaryLanguage = pcContact.PrimaryLanguage.Code
      ccContact.EmailAddress2 = pcContact.EmailAddress2
      ccContact.EmailAddress1 = pcContact.EmailAddress1
      ccContact.SSNOfficialID = pcContact.SSNOfficialID
      ccContact.TUNSOfficialID = pcContact.TUNSOfficialID
      ccContact.PrimaryPhoneValue = pcContact.PrimaryPhoneValue
      ccContact.Notes = pcContact.Notes
      ccContact.PrimaryAddress = getOrCreateAddress( pcContact.PrimaryAddress )
      ccContact.PrimaryPhone = pcContact.PrimaryPhone.Code
      ccContact.AllAddresses = getOrCreateAddressArray( pcContact.AllAddresses )
      ccContact.STAXOfficialID = pcContact.STAXOfficialID
      ccContact.WithholdingRate = pcContact.WithholdingRate
      ccContact.BureauIDOfficialID = pcContact.BureauIDOfficialID
      ccContact.AddressBookUID = pcContact.AddressBookUID
      ccContact.PolicySystemID = pcContact.PublicID
      ccContact.Score = pcContact.Score
      ccContact.PreferredCurrency = pcContact.PreferredCurrency.Code
      ccContact.VendorNumber = pcContact.VendorNumber
      ccContact.Name = pcContact.Name
      ccContact.TaxID = pcContact.TaxID
      ccContact.VendorType = pcContact.VendorType.Code
      ccContact.ContactAddresses = createContactAddressArray( pcContact.ContactAddresses )
      ccContact.Preferred = pcContact.Preferred
      ccContact.STUNOfficialID = pcContact.STUNOfficialID

    }
    return ccContact
  }

  /**
   * Looks for an already mapped Person with the same first and last name as the inclusion person and returns
   * it if not null.  If it does not exist, creates a new Person with the InclusionPerson's first and last
   * names.  This Person will not be found by subsequent calls to getOrCreateContact(), so it's best to create
   * all normal Contacts first using that method.
   */
  function getOrCreatePersonFromInclusionPerson( inclusionPerson : entity.InclusionPerson ) : CCPerson
  {
    if( inclusionPerson == null )
    {
      return null
    }

    var ccPerson = findMatchingMappedPerson(inclusionPerson.LastName, inclusionPerson.FirstName)
    if( ccPerson == null )
    {
      ccPerson = new CCPerson()
      _mappedPCContactObjects.put(inclusionPerson.ID, ccPerson)
      ccPerson.FirstName = inclusionPerson.FirstName
      ccPerson.LastName = inclusionPerson.LastName
      ccPerson.Preferred = false
      ccPerson.PolicySystemID = inclusionPerson.TypeIDString
    }
    return ccPerson
  }

  /**
   * Looks for an already mapped Person with the same first and last name as the commercial driver and returns
   * it if not null.  If it does not exist, creates a new Person with the driver's first and last
   * names.  This Person will not be found by subsequent calls to getOrCreateContact(), so it's best to create
   * all normal Contacts first using that method.
   */
  function getOrCreatePersonFromCommercialDriver( driver : entity.CommercialDriver) : CCPerson
  {
    if( driver == null )
    {
      return null
    }

    var ccPerson = findMatchingMappedPerson(driver.LastName, driver.FirstName)
    if( ccPerson == null )
    {
      ccPerson = new CCPerson()
      _mappedPCContactObjects.put(driver.ID, ccPerson)
      ccPerson.FirstName = driver.FirstName
      ccPerson.LastName = driver.LastName
      ccPerson.Gender = driver.Gender.Code
      ccPerson.DateOfBirth = driver.DateOfBirth
      ccPerson.LicenseNumber = driver.LicenseNumber
      ccPerson.LicenseState = driver.LicenseState.Code
      ccPerson.Preferred = false
      ccPerson.PolicySystemID = driver.TypeIDString
    }
    return ccPerson
  }

  /**
   * Finds an already mapped Person with the same first and last name for cases where the PC object that is being turned
   * into a contact is not a Contact in PC.  This allows us to reuse an existing matching Contact rather than creating a
   * new one.  Returns null if no matching CCPerson found.
   */
   protected function findMatchingMappedPerson(lastName : String, firstName : String) : CCPerson {
     var mappedContactList = _mappedPCContactObjects.Values.toList()
     return mappedContactList.firstWhere( \ c -> typeof c == CCPerson
                                                 and (c as CCPerson).LastName == lastName
                                                 and (c as CCPerson).FirstName == firstName ) as CCPerson
   }

  /**
   * Convenience method to convert an array of pc Contacts
   */
  protected function getOrCreateContactArray( contacts : entity.Contact[] ) : CCContact[]
  {
    if( contacts == null )
    {
      return null
    }
    var ccContacts = new ArrayList( contacts.Count )
    for( var pcContact in contacts )
    {
      ccContacts.add( getOrCreateContact( pcContact ) )
    }
    return ccContacts as CCContact[]
  }

  protected function getOrCreateAddress( pcAddress : entity.Address ) : CCAddress
  {
    if( pcAddress == null )
    {
      return null
    }
    var ccAddress = _mappedPCContactObjects.get( pcAddress.ID ) as CCAddress
    if( ccAddress == null )
    {
      ccAddress = new CCAddress()
      _mappedPCContactObjects.put( pcAddress.ID, ccAddress )
      ccAddress.AddressBookUID = pcAddress.AddressBookUID
      ccAddress.Description = pcAddress.Description
      ccAddress.PostalCode = pcAddress.PostalCode
      ccAddress.Country = pcAddress.Country.Code
      ccAddress.State = pcAddress.State.Code
      ccAddress.AddressType = pcAddress.AddressType.Code
      ccAddress.City = pcAddress.City
      ccAddress.AddressLine3 = pcAddress.AddressLine3
      ccAddress.County = pcAddress.County
      ccAddress.AddressLine2 = pcAddress.AddressLine2
      ccAddress.AddressLine1 = pcAddress.AddressLine1
      ccAddress.ValidUntil = pcAddress.ValidUntil
    }
    return ccAddress
  }

  /**
   * Finds a matching address in the list of already-created CCAddress and returns it, or
   * adds the passed CCAddress to the list and returns it if none is found.
   */
  protected function findExistingAddressOrAddToList( addressToFind : CCAddress ) : CCAddress
  {
    if( addressToFind == null )
    {
      return null
    }

    var ccObjects = _mappedPCContactObjects.Values
    for( var o in ccObjects )
    {
      if( typeof o == CCAddress )
      {
        var ccAddress = o as CCAddress
        if( ccAddress.AddressBookUID == addressToFind.AddressBookUID and
            ccAddress.AddressLine1 == addressToFind.AddressLine1 and
            ccAddress.AddressLine2 == addressToFind.AddressLine2 and
            ccAddress.AddressLine3 == addressToFind.AddressLine3 and
            ccAddress.City == addressToFind.City and
            ccAddress.Country == addressToFind.Country and
            ccAddress.County == addressToFind.County and
            ccAddress.PostalCode == addressToFind.PostalCode and
            ccAddress.State == addressToFind.State )
        {
          return ccAddress
        }
      }
    }
    _mappedPCContactObjects.put( null, addressToFind )
    return addressToFind
  }

  /**
   * Convenience method to convert an array of pc Addresses
   */
  protected function getOrCreateAddressArray( pcAddresses : entity.Address[] ) : CCAddress[]
  {
    if( pcAddresses == null )
    {
      return null
    }
    var ccAddresses = new ArrayList( pcAddresses.Count )
    for( var pcAddress in pcAddresses )
    {
      ccAddresses.add( getOrCreateAddress( pcAddress ) )
    }
    return ccAddresses as CCAddress[]
  }

  protected function createContactAddressArray( pcContactAddresses : entity.ContactAddress[] ) : CCContactAddress[]
  {
    if( pcContactAddresses == null )
    {
      return null
    }
    var ccContactAddresses = new ArrayList<CCContactAddress>( pcContactAddresses.Count )
    for( var pcContactAddress in pcContactAddresses )
    {
      var ccContactAddress = new CCContactAddress()
      ccContactAddress.AddressBookUID = pcContactAddress.Address.AddressBookUID
      ccContactAddress.Address = getOrCreateAddress( pcContactAddress.Address )
      ccContactAddresses.add( ccContactAddress )
    }
    return ccContactAddresses as CCContactAddress[]
  }

  protected function getOrCreateOfficialIDArray( pcOfficialIDs : entity.OfficialID[] ) : CCOfficialID[]
  {
    if( pcOfficialIDs == null )
    {
      return null
    }
    var ccOfficialIDs = new ArrayList<CCOfficialID>( pcOfficialIDs.Count )
    for( var pcOfficialID in pcOfficialIDs )
    {
      var ccOfficialID = _mappedPCContactObjects.get( pcOfficialID.ID ) as CCOfficialID
      if( ccOfficialID == null )
      {
        ccOfficialID = new CCOfficialID()
        _mappedPCContactObjects.put( pcOfficialID.ID, ccOfficialID )
        ccOfficialID.OfficialIDInsuredAndType = pcOfficialID.OfficialIDInsuredAndType
        ccOfficialID.OfficialIDValue = pcOfficialID.OfficialIDValue
        ccOfficialID.State = pcOfficialID.State.Code
        ccOfficialID.OfficialIDType = pcOfficialID.OfficialIDType.Code
      }
      ccOfficialIDs.add( ccOfficialID )
    }
    return ccOfficialIDs as CCOfficialID[]
  }

  private function setCompanyFields(ccContact : CCCompany, pcContact : Company) {
    ccContact.Caze = getOrCreateContactArray(pcContact.Case)
    ccContact.Employees = getOrCreateContactArray(pcContact.Employees).cast(CCPerson)
    ccContact.Thirdpartyinsured = getOrCreateContactArray(pcContact.Thirdpartyinsured)
  }

  private function setPersonFields(ccContact : CCPerson, pcContact : Person) {
    ccContact.LicenseState = pcContact.LicenseState.Code;
    ccContact.MaritalStatus = pcContact.MaritalStatus.Code
    ccContact.NumDependentsU25 = pcContact.NumDependentsU25
    ccContact.DateOfBirth = pcContact.DateOfBirth
    ccContact.LicenseNumber = pcContact.LicenseNumber
    ccContact.NumDependentsU18 = pcContact.NumDependentsU18
    ccContact.Gender = pcContact.Gender.Code
    ccContact.Employer = getOrCreateContact(pcContact.Employer) as CCCompany
    ccContact.MiddleName = pcContact.MiddleName
    ccContact.TaxFilingStatus = pcContact.TaxFilingStatus.Code
    ccContact.Prefix = pcContact.Prefix.Code
    ccContact.Guardian = getOrCreateContact(pcContact.Guardian) as CCPerson
    ccContact.FormerName = pcContact.FormerName
    ccContact.Wards = getOrCreateContactArray(pcContact.Wards).cast(CCPerson)
    ccContact.NumDependents = pcContact.NumDependents
    ccContact.Suffix = pcContact.Suffix.Code
    var cellPhone = new GWPhoneNumberBuilder().withCountryCode(pcContact.CellPhoneCountry)
        .withNationalNumber(pcContact.CellPhone).withExtension(pcContact.CellPhoneExtension).build()
    ccContact.CellPhone = cellPhone == null ? null : _phoneNormalizer.formatPhoneNumber(cellPhone)
    ccContact.Occupation = pcContact.Occupation
    ccContact.FirstName = pcContact.FirstName
    ccContact.LastName = pcContact.LastName
  }
}
