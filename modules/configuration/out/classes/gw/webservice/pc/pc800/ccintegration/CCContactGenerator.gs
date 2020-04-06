package gw.webservice.pc.pc800.ccintegration

uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.Envelope_CCAddress
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.CCContact_OfficialIDs
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.CCContact_ContactAddresses
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCCompany
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPerson
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCContact
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCCompanyVendor
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPersonVendor
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPlace
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCAdjudicator
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCLegalVenue
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCContactAddress
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCOfficialID
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCAddress
uses gw.xml.XmlElement

/**
 * Maps PC Contacts to the ccentities Contact objects.  These mappings are all quite
 * straightforward since the ccentities Contact related objects are very
 * similar to the PC Contact objects.
 */
@Export
class CCContactGenerator {
  // store objects here that might be accessed from various parts of the
  // PC policy object graph so we don't create duplicate copies

  var _gen : CCPolicyGenerator

  construct(gen : CCPolicyGenerator) {
    _gen = gen;
  }

  public function getOrCreateContact(pcContact : entity.Contact) : XmlElement {
    var el = _gen.getMappedPCObjects().get(pcContact.ID)
    if (el != null) {
      return el
    }
    var ccContact : CCContact
    // construct the object
    switch (typeof pcContact) {
      case entity.CompanyVendor:
        ccContact = new CCCompanyVendor();
        break;
      case entity.Company:
        ccContact = new CCCompany()
        break
      case entity.Adjudicator:
        ccContact = new CCAdjudicator()
        break;
      case entity.PersonVendor:
        ccContact = new CCPersonVendor()
        break;
      case entity.Person:
        ccContact = new CCPerson()
        break
      case entity.LegalVenue:
        ccContact = new CCLegalVenue()
        break
      case entity.Place:
        ccContact = new CCPlace()
        break
    }
    if (ccContact != null) {
       el = _gen.addContact(pcContact.ID, ccContact)
    }

    // populate
    if (pcContact typeis Company and ccContact typeis CCCompany) {
      for (wrk in pcContact.Case) {
        ccContact.Case.add(getOrCreateContact(wrk))
      }
      for (wrk in pcContact.Employees) {
        ccContact.Employees.add(getOrCreateContact(wrk))
      }
      for (wrk in pcContact.Thirdpartyinsured) {
        ccContact.Thirdpartyinsured.add(getOrCreateContact(wrk))
      }
    }
    if (pcContact typeis entity.Person && ccContact typeis CCPerson) {
      if (pcContact typeis entity.Adjudicator && ccContact typeis CCAdjudicator) {
        ccContact.AdjudicatorLicense = pcContact.AdjudicatorLicense
      }
      ccContact.LicenseState = pcContact.LicenseState.Code
      ccContact.MaritalStatus = pcContact.MaritalStatus.Code
      ccContact.NumDependentsU25 = pcContact.NumDependentsU25
      ccContact.DateOfBirth = pcContact.DateOfBirth
      ccContact.LicenseNumber = pcContact.LicenseNumber
      ccContact.NumDependentsU18 = pcContact.NumDependentsU18
      ccContact.Gender = pcContact.Gender.Code
      if (pcContact.Employer != null) {
        ccContact.Employer = getOrCreateContact(pcContact.Employer)
      }
      ccContact.MiddleName = pcContact.MiddleName
      ccContact.TaxFilingStatus = pcContact.TaxFilingStatus.Code
      ccContact.Prefix = pcContact.Prefix.Code
      if (pcContact.Guardian != null) {
        ccContact.Guardian = getOrCreateContact(pcContact.Guardian)
      }
      ccContact.FormerName = pcContact.FormerName
      for (wrk in pcContact.Wards) {
        ccContact.Wards.add(getOrCreateContact(wrk))
      }
      ccContact.NumDependents = pcContact.NumDependents
      ccContact.Suffix = pcContact.Suffix.Code
      ccContact.CellPhoneCountry = pcContact.CellPhoneCountry as String
      ccContact.CellPhone = pcContact.CellPhone
      ccContact.CellPhoneExtension = pcContact.CellPhoneExtension
      ccContact.Occupation = pcContact.Occupation
      ccContact.FirstName = pcContact.FirstName
      ccContact.FirstNameKanji = pcContact.FirstNameKanji
      ccContact.LastName = pcContact.LastName
      ccContact.LastNameKanji = pcContact.LastNameKanji
      ccContact.Particle = pcContact.Particle
    }
    if (pcContact typeis entity.LegalVenue && ccContact typeis CCLegalVenue) {
      ccContact.VenueType = pcContact.VenueType.Code
    }
    if (ccContact != null) {
      ccContact.WorkPhoneCountry = pcContact.WorkPhoneCountry as String
      ccContact.WorkPhone = pcContact.WorkPhone
      ccContact.WorkPhoneExtension = pcContact.WorkPhoneExtension
      ccContact.NCCIIDOfficialID = pcContact.NCCIIDOfficialID
      ccContact.FaxPhoneCountry = pcContact.FaxPhoneCountry as String
      ccContact.FaxPhone = pcContact.FaxPhone
      ccContact.FaxPhoneExtension = pcContact.FaxPhoneExtension
      ccContact.HomePhoneCountry = pcContact.HomePhoneCountry as String
      ccContact.HomePhone = pcContact.HomePhone
      ccContact.HomePhoneExtension = pcContact.HomePhoneExtension
      for (wrk in pcContact.OfficialIDs) {
        ccContact.OfficialIDs.add(ccContact.OfficialIDs.Count, new (createOfficialID(wrk)))
      }
      ccContact.FEINOfficialID = pcContact.FEINOfficialID
      ccContact.DOLIDOfficialID = pcContact.DOLIDOfficialID
      ccContact.PrimaryContact = getOrCreateContact(pcContact.PrimaryContact)
      ccContact.TaxStatus = pcContact.TaxStatus.Code
      if (pcContact.ContactCompany != null) {
        ccContact.ContactCompany = getOrCreateContact(pcContact.ContactCompany)
      }
      ccContact.DUNSOfficialID = pcContact.DUNSOfficialID
      ccContact.PrimaryLanguage = pcContact.PrimaryLanguage.Code
      ccContact.EmailAddress2 = pcContact.EmailAddress2
      ccContact.EmailAddress1 = pcContact.EmailAddress1
      ccContact.SSNOfficialID = pcContact.SSNOfficialID
      ccContact.TUNSOfficialID = pcContact.TUNSOfficialID
      ccContact.Notes = pcContact.Notes
      if (pcContact.PrimaryAddress != null) {
        ccContact.PrimaryAddress = getOrCreateAddress(pcContact.PrimaryAddress)
      }
      ccContact.PrimaryPhone = pcContact.PrimaryPhone.Code
      for (wrk in pcContact.AllAddresses) {
        ccContact.AllAddresses.add(getOrCreateAddress(wrk))
      }
      ccContact.STAXOfficialID = pcContact.STAXOfficialID
      ccContact.WithholdingRate = pcContact.WithholdingRate
      ccContact.BureauIDOfficialID = pcContact.BureauIDOfficialID
      ccContact.AddressBookUID = pcContact.AddressBookUID
      ccContact.PolicySystemID = pcContact.PublicID
      ccContact.Score = pcContact.Score
      ccContact.PreferredCurrency = pcContact.PreferredCurrency.Code
      ccContact.VendorNumber = pcContact.VendorNumber
      ccContact.Name = pcContact.Name
      ccContact.NameKanji = pcContact.NameKanji
      ccContact.TaxID = pcContact.TaxID
      ccContact.VendorType = pcContact.VendorType.Code
      for (wrk in pcContact.ContactAddresses) {
        ccContact.ContactAddresses.add(new CCContact_ContactAddresses(createContactAddress(wrk)))
      }
      ccContact.Preferred = pcContact.Preferred
      ccContact.STUNOfficialID = pcContact.STUNOfficialID
    }
    return el
  }

  /**
   * Looks for an already mapped Person with the same first and last name as the inclusion person and returns
   * it if not null.  If it does not exist, creates a new Person with the InclusionPerson's first and last
   * names.  This Person will not be found by subsequent calls to getOrCreateContact(), so it's best to create
   * all normal Contacts first using that method.
   */
  function getOrCreatePersonFromInclusionPerson(inclusionPerson : entity.InclusionPerson) : XmlElement {
    var el = findMatchingMappedPerson(inclusionPerson.LastName, inclusionPerson.FirstName)
    if (el != null) {
      return el
    }
    var ccPerson = new CCPerson()
    //InclusionPerson is US only concept, so no Japanese field is required - hogawa
    ccPerson.FirstName = inclusionPerson.FirstName
    ccPerson.LastName = inclusionPerson.LastName
    ccPerson.Preferred = false
    ccPerson.PolicySystemID = inclusionPerson.TypeIDString
    return _gen.addContact(inclusionPerson.ID, ccPerson)
  }

  /**
   * Looks for an already mapped Person with the same first and last name as the commercial driver and returns
   * it if not null.  If it does not exist, creates a new Person with the driver's first and last
   * names.  This Person will not be found by subsequent calls to getOrCreateContact(), so it's best to create
   * all normal Contacts first using that method.
   */
  function getOrCreatePersonFromCommercialDriver(driver : entity.CommercialDriver) : XmlElement {
    var el = findMatchingMappedPerson(driver.LastName, driver.FirstName)
    if (el != null) {
      return el
    }
    var ccPerson = new CCPerson()
    ccPerson.FirstName = driver.FirstName
    ccPerson.LastName = driver.LastName
    ccPerson.Gender = driver.Gender.Code
    ccPerson.DateOfBirth = driver.DateOfBirth
    ccPerson.LicenseNumber = driver.LicenseNumber
    ccPerson.LicenseState = driver.LicenseState.Code
    ccPerson.Preferred = false
    ccPerson.PolicySystemID = driver.TypeIDString
    return _gen.addContact(driver.ID, ccPerson)
  }

  /**
   * Finds an already mapped Person with the same first and last name for cases where the PC object that is being turned
   * into a contact is not a Contact in PC.  This allows us to reuse an existing matching Contact rather than creating a
   * new one.  Returns null if no matching CCPerson found.
   */
   protected function findMatchingMappedPerson(lastName : String, firstName : String) : XmlElement {
     var mappedContactList = _gen.getMappedPCObjects().Values.toList()
     return mappedContactList.firstWhere(\ c -> c.TypeInstance typeis CCPerson
                                                 and c.TypeInstance.LastName == lastName
                                                 and c.TypeInstance.FirstName == firstName)
   }

  protected function getOrCreateAddress(pcAddress : entity.Address) : XmlElement {
    var el = _gen.getMappedPCObjects().get(pcAddress.ID)
    if (el != null) {
      return el;
    }

    var  ccAddress = new CCAddress()
    ccAddress.configure(pcAddress)
    ccAddress.AddressBookUID    = pcAddress.AddressBookUID
    ccAddress.ValidUntil        = pcAddress.ValidUntil

    el = _gen.addAddress(pcAddress.ID, ccAddress)
    return el
  }

  /**
   * Finds a matching address in the list of already-created CCAddress and returns it, or
   * adds the passed CCAddress to the list and returns it if none is found.
   */
  protected function findExistingAddressOrAddToList(key:Key, addressToFind : CCAddress) : XmlElement {
    for (o in _gen.getMappedPCObjects().Values) {
      if (o typeis Envelope_CCAddress and addressToFind.matches(o)) {
        return o
      }
    }
    //if not found create the element
    var e = _gen.addAddress(key, addressToFind)
    return e
  }


  protected function createContactAddress(pcContactAddress : entity.ContactAddress) : CCContactAddress {
    var ccContactAddress = new CCContactAddress()
    ccContactAddress.AddressBookUID = pcContactAddress.Address.AddressBookUID
    ccContactAddress.Address = getOrCreateAddress(pcContactAddress.Address)
    return ccContactAddress
  }

  protected function createOfficialID(pcOfficialID : entity.OfficialID) : CCOfficialID {
    var ccOfficialID =  new CCOfficialID()
    ccOfficialID.OfficialIDInsuredAndType = pcOfficialID.OfficialIDInsuredAndType
    ccOfficialID.OfficialIDValue = pcOfficialID.OfficialIDValue
    ccOfficialID.State = pcOfficialID.State.Code
    ccOfficialID.OfficialIDType = pcOfficialID.OfficialIDType.Code
    return ccOfficialID
  }
}
