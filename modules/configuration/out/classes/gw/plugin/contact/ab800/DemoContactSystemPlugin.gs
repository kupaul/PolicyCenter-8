package gw.plugin.contact.ab800

uses gw.api.util.DisplayableException
uses gw.plugin.contact.DuplicateContactResult
uses gw.plugin.contact.DuplicateContactResultContainer
uses java.lang.IllegalStateException
uses java.util.ArrayList
uses java.util.Date
uses gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Array
uses gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Fk
uses gw.webservice.contactapi.beanmodel.XmlBackedInstance
uses gw.plugin.contact.ContactSystemPlugin
uses gw.plugin.contact.ContactResult
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.types.complex.ABContactAPISearchResult
uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.types.complex.AddressInfo
uses gw.plugin.contact.ContactCreator
uses gw.contactmapper.ab800.ContactIntegrationMapperFactory
uses gw.webservice.contactapi.abcontactapihelpers.impl.PopulatorImpl
uses gw.webservice.contactapi.abcontactapihelpers.impl.Factory


/**
 * Contact system integration plugin used for demos.  It always returns a mock external contact
 * when retreiving, searching, or finding duplicates.
 */
@Export
class DemoContactSystemPlugin implements ContactSystemPlugin {
  public static var DEMOPERSON_FIRSTNAME : String = "Demo"
  public static var DEMOPERSON_LASTNAME : String = "External-Person"
  public static var DEMOPERSON_NAME : String = DEMOPERSON_FIRSTNAME + " " + DEMOPERSON_LASTNAME
  public static var DEMOCOMPANY_NAME : String = "Demo External-Company Corp."
  public static var DEMOCONTACT_EMAIL1 : String = "11@11.com"
  public static var DEMOCONTACT_EMAIL2 : String = "22@22.com"
  public static var DEMOCONTACT_FAXPHONE : String = "2132843649"
  public static var DEMOCONTACT_WORKPHONE : String = "2015438506"
  public static var DEMOCONTACT_HOMEPHONE : String = "8053927973"

  protected static var _sampleABContactAPISearchResult : List<ABContactAPISearchResult>
  private static var _sampleABContactXSD : List<XmlBackedInstance>

  private static var _mapper = ContactIntegrationMapperFactory.ContactIntegrationMapper

  construct() {
    init()
  }

  override function retrieveContact(contactUid: String, creator : ContactCreator) : Contact {
    var mockContact = _sampleABContactXSD.firstWhere(\ x -> x.LinkID == contactUid)
    if (mockContact == null) {
      throw new DisplayableException(displaykey.ContactAPI.CantFindContact(contactUid))
    }
    var contactType = _mapper.getNameMapper().getLocalEntityName(mockContact.EntityType)
    var contact = creator.loadOrCreateContact(mockContact.LinkID, contactType)
    if (contact.AutoSync == AutoSync.TC_DISALLOW) {
      throw new IllegalStateException(displaykey.Web.Contact.Error.CannotRetrieveContactWhenAutoSyncDisallowed(contactUid))
    } else {
      contact.AutoSync = AutoSync.TC_ALLOW
    }
    return _mapper.populateContactFromXML(contact, mockContact)
  }

  override function searchContacts(criteria: ContactSearchCriteria) : ContactResult[] {
    var results = _sampleABContactAPISearchResult
      .where(\ abci -> abci.ContactType.substring(2).containsIgnoreCase(criteria.ContactType.Code))
      .map(\ abci -> new ContactResultFromSearch(abci))
      .toTypedArray()
    return results
  }

  override function supportsFindingDuplicates() : boolean {
    return true
  }

  override function findDuplicates(contact : Contact) : DuplicateContactResultContainer {
    return new DuplicateContactResultContainer() {
      override property get Results() : List<DuplicateContactResult> {
        return new ArrayList<DuplicateContactResult>()
      }
      override property get TotalResults() : int {
        return 0
      }
    }
  }

  override function addContact(contact : Contact, transactionId : String) {
    if (contact.AddressBookUID != null) {
      throw new IllegalStateException("Should not add contact which already has UID")
    }
  }
  override function addContact(contact : Contact, payload : String, transactionId : String) {
    if (contact.AddressBookUID != null) {
      throw new IllegalStateException("Should not add contact which already has UID")
    }
  }

  override function updateContact(contact : Contact, changes : String, transactionId : String) { /*nop*/ }

  override function removeContact(p0 : Contact, removeInfo : String, transactionId : String) { /*nop*/ }

  override function overwriteContactWithLatestValues(p0 : Contact, p1 : String) { /*nop*/ }

  override function getReplacementAddressABUID(oldAddressABUID : String) : String {
    return ""
  }

  override function createAsyncMessage(messageContext : MessageContext, contact : Contact, lateBoundABUID : boolean) {
    var contactMapper = ContactIntegrationMapperFactory.ContactIntegrationMapper
    var contactXML = contactMapper.populateXMLFromContact(contact, lateBoundABUID)
    messageContext.createMessage(contactXML.asUTFString())
  }

  //
  // PRIVATE SUPPORT FUNCTIONS
  //

  private function init() {
    var abContactAPISearchResult0 = new ABContactAPISearchResult() {
      :LinkID = "mock:0"
      ,:ContactType = "ABPerson"
      ,:FirstName = DEMOPERSON_FIRSTNAME
      ,:LastName = DEMOPERSON_LASTNAME
      ,:EmailAddress1 = DEMOCONTACT_EMAIL1
      ,:EmailAddress2 = DEMOCONTACT_EMAIL2
      ,:FaxPhone = DEMOCONTACT_FAXPHONE
      ,:WorkPhone = DEMOCONTACT_WORKPHONE
      ,:HomePhone = DEMOCONTACT_HOMEPHONE
      ,:DateOfBirth = Date.Today.addYears(-30).Calendar as java.util.Date
      ,:PrimaryPhone = typekey.PrimaryPhoneType.TC_HOME.Code
    }
    abContactAPISearchResult0.PrimaryAddress.$TypeInstance = this.createAddressInfo("1")
    var abContactAPISearchResult1 = new ABContactAPISearchResult() {
      :LinkID = "mock:1"
      ,:Name = DEMOCOMPANY_NAME
      ,:EmailAddress1 = "customer.service@bar.com"
      ,:ContactType = "ABCompany"
      ,:EmailAddress2 = DEMOCONTACT_EMAIL2
      ,:FaxPhone = DEMOCONTACT_FAXPHONE
      ,:WorkPhone = DEMOCONTACT_WORKPHONE
      ,:HomePhone = DEMOCONTACT_HOMEPHONE
      ,:PrimaryPhone = typekey.PrimaryPhoneType.TC_WORK.Code
    }
    abContactAPISearchResult1.PrimaryAddress.$TypeInstance = this.createAddressInfo("3")
    var abContactAPISearchResult2 = new ABContactAPISearchResult() {
      :LinkID = "mock:2",
      :ContactType = "ABPerson",
      :FirstName = "Test",
      :LastName = "User",
      :HomePhone = "9008907890",
      :PrimaryPhone = typekey.PrimaryPhoneType.TC_HOME.Code
    }
    abContactAPISearchResult2.PrimaryAddress.$TypeInstance = this.createAddressInfo("4")
    var abContactAPISearchResult3 = new ABContactAPISearchResult() {
      :LinkID = "mock:3",
      :ContactType = "ABPerson",
      :FirstName = "External",
      :LastName = "Accountconversion",
      :HomePhone = "2482591999",
      :PrimaryPhone = typekey.PrimaryPhoneType.TC_HOME.Code
    }
    abContactAPISearchResult3.PrimaryAddress.$TypeInstance = this.createAddressInfo("5")
    _sampleABContactAPISearchResult = {abContactAPISearchResult0, abContactAPISearchResult1, abContactAPISearchResult2, abContactAPISearchResult3}

    _sampleABContactXSD = new ArrayList<XmlBackedInstance>()
    var sampleABContactXSD0Bean = new Person() {
      :AddressBookUID = "mock:0",
      :EmailAddress1 = DEMOCONTACT_EMAIL1,
      :EmailAddress2 = DEMOCONTACT_EMAIL2,
      :FaxPhone = DEMOCONTACT_FAXPHONE,
      :WorkPhone = DEMOCONTACT_WORKPHONE,
      :HomePhone = DEMOCONTACT_HOMEPHONE,
      :PrimaryPhone = PrimaryPhoneType.TC_HOME,
      :FirstName = DEMOPERSON_FIRSTNAME,
      :LastName = DEMOPERSON_LASTNAME,
      :DateOfBirth = Date.Today.addYears(-30),
      :Tags = {new ContactTag(){:AddressBookUID = "mockTag:0", :Type = ContactTagType.TC_CLIENT}}
    }
    var sampleABContactXSD0 = _mapper.populateXMLFromContact(sampleABContactXSD0Bean)
    var _PrimaryAddress_instance_Fk0 = new XmlBackedInstance_Fk()
    _PrimaryAddress_instance_Fk0.Name = "PrimaryAddress"
    sampleABContactXSD0.Fk.add(_PrimaryAddress_instance_Fk0)
    _PrimaryAddress_instance_Fk0.XmlBackedInstance = createSoapAddress("1")
    var _ContactAddresses_instance_Array0 = new XmlBackedInstance_Array()
    _ContactAddresses_instance_Array0.Name = "ContactAddresses"
    sampleABContactXSD0.Array.add(_ContactAddresses_instance_Array0)
    var joinArray_instance = new XmlBackedInstance()
    joinArray_instance.updateFieldValue("LinkID", "mockContactAddress:0")
    _ContactAddresses_instance_Array0.XmlBackedInstance.add(joinArray_instance)
    var _join_instance_Fk0 = new XmlBackedInstance_Fk()
    _join_instance_Fk0.Name = "Address"
    joinArray_instance.Fk.add(_join_instance_Fk0)
    _join_instance_Fk0.XmlBackedInstance = createSoapAddress("2")


    var sampleABContactXSD1Bean = new Company() {
      :AddressBookUID = "mock:1",
      :EmailAddress1 = "customer.service@bar.com",
      :EmailAddress2 = DEMOCONTACT_EMAIL2,
      :FaxPhone = DEMOCONTACT_FAXPHONE,
      :WorkPhone = DEMOCONTACT_WORKPHONE,
      :HomePhone = DEMOCONTACT_HOMEPHONE,
      :PrimaryPhone = PrimaryPhoneType.TC_WORK,
      :Name = DEMOCOMPANY_NAME,
      :Tags = {new ContactTag(){:AddressBookUID = "mockTag:1", :Type = ContactTagType.TC_CLIENT}}
    }
    var sampleABContactXSD1 = _mapper.populateXMLFromContact(sampleABContactXSD1Bean)
    var _PrimaryAddress_instance_Fk1 = new XmlBackedInstance_Fk()
    _PrimaryAddress_instance_Fk1.Name = "PrimaryAddress"
    sampleABContactXSD1.Fk.add(_PrimaryAddress_instance_Fk1)
    _PrimaryAddress_instance_Fk1.XmlBackedInstance = createSoapAddress("3")


    var sampleABContactXSD2Bean = new Person() {
      :AddressBookUID = "mock:2",
      :HomePhone = "9008907890",
      :PrimaryPhone = PrimaryPhoneType.TC_HOME,
      :FirstName = DEMOPERSON_FIRSTNAME,
      :LastName = DEMOPERSON_LASTNAME,
      :Tags = {new ContactTag(){:AddressBookUID = "mockTag:2", :Type = ContactTagType.TC_CLIENT}}
    }
    var sampleABContactXSD2 = _mapper.populateXMLFromContact(sampleABContactXSD2Bean)
    var _PrimaryAddress_instance_Fk2 = new XmlBackedInstance_Fk()
    _PrimaryAddress_instance_Fk2.Name = "PrimaryAddress"
    sampleABContactXSD2.Fk.add(_PrimaryAddress_instance_Fk2)
    _PrimaryAddress_instance_Fk2.XmlBackedInstance = createSoapAddress("4")

    var sampleABContactXSD3Bean = new Person() {
      :AddressBookUID = "mock:3",
      :HomePhone = "2482591999",
      :PrimaryPhone = PrimaryPhoneType.TC_HOME,
      :FirstName = "External",
      :LastName = "Accountconversion",
      :Tags = {new ContactTag(){:AddressBookUID = "mockTag:3", :Type = ContactTagType.TC_CLIENT}}
    }
    var sampleABContactXSD3 = _mapper.populateXMLFromContact(sampleABContactXSD3Bean)
    var _PrimaryAddress_instance_Fk3 = new XmlBackedInstance_Fk()
    _PrimaryAddress_instance_Fk3.Name = "PrimaryAddress"
    sampleABContactXSD3.Fk.add(_PrimaryAddress_instance_Fk3)
    _PrimaryAddress_instance_Fk3.XmlBackedInstance = createSoapAddress("5")

    _sampleABContactXSD.add(sampleABContactXSD0)
    _sampleABContactXSD.add(sampleABContactXSD1)
    _sampleABContactXSD.add(sampleABContactXSD2)
    _sampleABContactXSD.add(sampleABContactXSD3)
  }

  private function createSoapAddress(i : String) : XmlBackedInstance {

    var nameMapper = ContactIntegrationMapperFactory.ContactIntegrationMapper.getNameMapper()
    var xmlSetter = new PopulatorImpl(Address, new Factory(nameMapper){})

    xmlSetter.setXmlField(Address#AddressLine1, "${i} Main St")
    xmlSetter.setXmlField(Address#AddressLine2, "Apt ${i}")
    xmlSetter.setXmlField(Address#PostalCode, "34546")
    xmlSetter.setXmlField(Address#City, "City")
    xmlSetter.setXmlField(Address#Country, Country.TC_US)
    xmlSetter.setXmlField(Address#County, "County")
    xmlSetter.setXmlField(Address#State, State.TC_AR)
    xmlSetter.setXmlField(Address#AddressType, AddressType.TC_BILLING)
    xmlSetter.setXmlFieldWithAbName(Address#AddressBookUID, "LinkID", "mockAddr:${i}")
    return xmlSetter.XmlBackedInstance
  }

  private function createAddressInfo(i : String) : AddressInfo {
    return new AddressInfo() {
      :AddressLine1 = "${i} Main St",
      :AddressLine2 = "Apt ${i}",
      :PostalCode = "34546",
      :City = "City",
      :Country = Country.TC_US.Code,
      :County = "County",
      :State = State.TC_AR.Code,
      :AddressType = "Billing"
    }
  }
}
