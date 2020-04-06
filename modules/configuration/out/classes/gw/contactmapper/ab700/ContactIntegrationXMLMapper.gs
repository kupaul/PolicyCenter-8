package gw.contactmapper.ab700

uses gw.api.system.PCLoggerCategory
uses gw.internal.xml.xsd.typeprovider.XmlSchemaTypeToGosuTypeMappings
uses gw.lang.reflect.IType
uses gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Field
uses gw.webservice.contactapi.beanmodel.XmlBackedInstance
uses gw.webservice.contactapi.ab700.ContactIntegrationXMLMapperAppBase
uses gw.webservice.contactapi.NameMapperBase
uses gw.webservice.pc.pc700.contact.AddressData
uses gw.webservice.pc.pc700.contact.AddressDataCopier
uses gw.webservice.pc.pc700.contact.AddressService

/**
 * Use this file to map between PolicyCenter entities and XmlBackedInstance objects that represent ContactManager entities.
 */
@Deprecated("Since 8.0.0.  Please use ContactIntegrationMapperImpl instead.")
@Export
class ContactIntegrationXMLMapper extends ContactIntegrationXMLMapperAppBase {
  private static var _logger = PCLoggerCategory.CONTACT_API

  /* Class initializers */
  private static var _mapper : ContactIntegrationXMLMapper = new ContactIntegrationXMLMapper()
  protected construct() {}

  static function getInstance() : ContactIntegrationXMLMapper {
    _logger.trace("ContactIntegrationXMLMapper.getInstance() returned a " + _mapper.IntrinsicType.Name)
    return _mapper
  }

  override function getNameMapper() : NameMapperBase { return NameMapper.getInstance() }

  // ============================== Map from PolicyCenter entities to ContactManager XmlBackedInstance objects 
  
  function populateXMLFromContact(contact : Contact) : XmlBackedInstance {
    return populateXMLFromContact(contact, false)
  }

  /**
   * Populate the XML from a contact, if lateBoundABUIDs is set to true. 
   * It will insert a special field in the xml - LATE_BOUND_ABUIDS. So when message request process the payload, it will
   * know the payload need to modify and replace the ABUIDs in the payload. The special field will be removed after modification.
   * OrigValue for address FK or contactAddres FK is usually populated with ABUIDs if there is any. If lateBoundABUIDs is true, it will
   * be populated with PulicID if ABUID does not exist yet so later on message request knows what ABUID should be replaced to for the 
   * corresponding address's pulicID.
   */
  function populateXMLFromContact(contact : Contact, lateBoundABUIDs : boolean) : XmlBackedInstance {
    var abContactXML = createXmlBackedInstance(contact)

    var originalValuesXML = contact.OriginalValuesXML == null
        ? null
        : contact.OriginalValuesXML.Element as XmlBackedInstance

    // To populate a field, use populateFieldXML. Note that local_fieldName can be omitted if it is the same as ab_fieldName:
    // 
    // populateFieldXML(originalValuesXML, abContactXML, ab_fieldName, bean, local_fieldName)
    if (lateBoundABUIDs) {
      addLateBoundTag(abContactXML)
    }
    populateFieldXML(originalValuesXML, abContactXML, LINK_ID            , contact, ADDRESS_BOOK_UID)
    populateFieldXML(originalValuesXML, abContactXML, EXTERNAL_PUBLIC_ID , contact, PUBLIC_ID       )
    populateFieldXML(originalValuesXML, abContactXML, "EmailAddress1"    , contact)
    populateFieldXML(originalValuesXML, abContactXML, "EmailAddress2"    , contact)
    populateFieldXML(originalValuesXML, abContactXML, "Name"             , contact)
    populateFieldXML(originalValuesXML, abContactXML, "Notes"            , contact)
    populateFieldXML(originalValuesXML, abContactXML, "Preferred"        , contact)
    populateFieldXML(originalValuesXML, abContactXML, "PreferredCurrency", contact)
    populateFieldXML(originalValuesXML, abContactXML, "PrimaryPhone"     , contact)
    populateFieldXML(originalValuesXML, abContactXML, "TaxStatus"        , contact)
    populateFieldXML(originalValuesXML, abContactXML, "WithholdingRate"  , contact)

    populatePhoneXML(originalValuesXML, abContactXML, "FaxPhone"         , contact)
    populatePhoneXML(originalValuesXML, abContactXML, "HomePhone"        , contact)
    populatePhoneXML(originalValuesXML, abContactXML, "WorkPhone"        , contact)

    if (contact typeis Company) {
      var fein = contact.OfficialIDs.firstWhere(\ o -> o.OfficialIDType == TC_FEIN)
      var colType = OfficialID.Type.TypeInfo.getProperty("OfficialIDValue").FeatureType
      var feinOriginalValue = fein != null ? fein.getOriginalValue("OfficialIDValue") : contact.getOriginalValue("TaxID")
      populateFieldXMLWithValue(abContactXML, "TaxID", contact.FEINOfficialID, feinOriginalValue, colType, contact.New)
    }
    if (contact typeis Person) {
      populatePhoneXML(originalValuesXML, abContactXML, "CellPhone"       , contact)

      populateFieldXML(originalValuesXML, abContactXML, "DateOfBirth"     , contact)
      populateFieldXML(originalValuesXML, abContactXML, "FirstName"       , contact)
      populateFieldXML(originalValuesXML, abContactXML, "FormerName"      , contact)
      populateFieldXML(originalValuesXML, abContactXML, "Gender"          , contact)
      populateFieldXML(originalValuesXML, abContactXML, "LastName"        , contact)
      populateFieldXML(originalValuesXML, abContactXML, "LicenseNumber"   , contact)
      populateFieldXML(originalValuesXML, abContactXML, "LicenseState"    , contact)
      populateFieldXML(originalValuesXML, abContactXML, "MaritalStatus"   , contact)
      populateFieldXML(originalValuesXML, abContactXML, "MiddleName"      , contact)
      populateFieldXML(originalValuesXML, abContactXML, "NumDependents"   , contact)
      populateFieldXML(originalValuesXML, abContactXML, "NumDependentsU18", contact)
      populateFieldXML(originalValuesXML, abContactXML, "NumDependentsU25", contact)
      populateFieldXML(originalValuesXML, abContactXML, "Occupation"      , contact)
      populateFieldXML(originalValuesXML, abContactXML, "Prefix"          , contact)
      populateFieldXML(originalValuesXML, abContactXML, "Suffix"          , contact)
      populateFieldXML(originalValuesXML, abContactXML, "TaxFilingStatus" , contact)
      
      var ssn = contact.OfficialIDs.firstWhere(\ o -> o.OfficialIDType == TC_SSN)
      var colType = OfficialID.Type.TypeInfo.getProperty("OfficialIDValue").FeatureType
      var ssnOriginalValue = ssn != null ? ssn.getOriginalValue("OfficialIDValue") : contact.getOriginalValue("TaxID")
      populateFieldXMLWithValue(abContactXML, "TaxID", contact.SSNOfficialID, ssnOriginalValue, colType, contact.New)
    }

    /**
     * Handle foreign keys and arrays. Please use populateFkXML and populateArrayXML
     * to populate custom children entities.
     */

    populateFkXML(originalValuesXML,
                  abContactXML,     // parent XmlBackedInstance
                  "PrimaryAddress", // name of FK on parent XmlBackedInstance (determined by ContactManager datamodel)
                  contact,          // local parent bean
                  "PrimaryAddress", // name of FK on local parent bean
                  \ xml, b : KeyableBean ->createAddressXMLFromAddress(xml, b), 
                  lateBoundABUIDs)

    populateArrayXML(originalValuesXML,
                     abContactXML,       // parent XmlBackedInstance
                     "ContactAddresses", // name of array on parent XmlBackedInstance (determined by ContactManager datamodel)
                     contact,            // local parent bean
                     "ContactAddresses", // name of array on local parent bean
                     \ xml, b : KeyableBean ->createABContactAddressXMLFromABContactAddress(xml, b, lateBoundABUIDs))

    populateArrayXML(originalValuesXML,
                     abContactXML,  // parent XmlBackedInstance
                     "Tags",        // name of array on parent XmlBackedInstance (determined by ContactManager datamodel)
                     contact,       // local parent bean
                     "Tags",        // name of array on local parent bean
                     \ xml, b : KeyableBean ->createABContactTagXMLFromContactTag(xml,b))

    // For history tracking
    abContactXML.External_UpdateApp = com.guidewire.pl.system.server.Version.getAppCode()
    abContactXML.External_UpdateUser = User.util.CurrentUser.Credential.UserName

    return abContactXML
  }

  /**
   * Methods to populate child entities. These methods are called by populateFkXML and populateArrayXML.
   */

  protected function createABContactAddressXMLFromABContactAddress(originalValuesXML: XmlBackedInstance, 
                                                                   abContactAddress : KeyableBean, 
                                                                   lateBoundABUID : boolean) : XmlBackedInstance {
    var instance = createXmlBackedInstance(abContactAddress)
    populateFieldXML(originalValuesXML, instance, LINK_ID, abContactAddress, ADDRESS_BOOK_UID)
    populateFieldXML(originalValuesXML, instance, EXTERNAL_PUBLIC_ID, abContactAddress, PUBLIC_ID)
    
    populateFkXML(originalValuesXML,
                  instance,         // parent XmlBackedInstance
                  "Address",        // name of FK on parent XmlBackedInstance (determined by ContactManager datamodel)
                  abContactAddress, // local parent bean
                  "Address",        // name of FK on local parent bean
                  \ xml, b : KeyableBean ->createAddressXMLFromAddress(xml, b), 
                  lateBoundABUID)
    return instance
  }
  
  public function createAddressXMLFromAddress(originalValuesXML: XmlBackedInstance, address : KeyableBean) : XmlBackedInstance {
    var instance = createXmlBackedInstance(address)
    populateFieldXML(originalValuesXML, instance, LINK_ID            , address, ADDRESS_BOOK_UID)
    populateFieldXML(originalValuesXML, instance, EXTERNAL_PUBLIC_ID , address, PUBLIC_ID       )
    populateFieldXML(originalValuesXML, instance, "AddressLine1"     , address)
    populateFieldXML(originalValuesXML, instance, "AddressLine2"     , address)
    populateFieldXML(originalValuesXML, instance, "AddressLine3"     , address)
    populateFieldXML(originalValuesXML, instance, "AddressType"      , address)
    populateFieldXML(originalValuesXML, instance, "City"             , address)
    populateFieldXML(originalValuesXML, instance, "Country"          , address)
    populateFieldXML(originalValuesXML, instance, "County"           , address)
    populateFieldXML(originalValuesXML, instance, "Description"      , address)
    populateFieldXML(originalValuesXML, instance, "GeocodeStatus"    , address)
    populateFieldXML(originalValuesXML, instance, "PostalCode"       , address)
    populateFieldXML(originalValuesXML, instance, "State"            , address)
    populateFieldXML(originalValuesXML, instance, "ValidUntil"       , address)
    return instance
  }

  protected function createABContactTagXMLFromContactTag(originalValuesXML: XmlBackedInstance, contactTag : KeyableBean) : XmlBackedInstance {
    var instance = createXmlBackedInstance(contactTag)
    populateFieldXML(originalValuesXML, instance, LINK_ID            , contactTag, ADDRESS_BOOK_UID)
    populateFieldXML(originalValuesXML, instance, EXTERNAL_PUBLIC_ID , contactTag, PUBLIC_ID       )
    populateFieldXML(originalValuesXML, instance, "Type"             , contactTag)
    return instance
  }

  // ============================== Map from ContactManager XmlBackedInstance objects to PolicyCenter entities 

  /**
   * @param contact the Contact to populate
   * @param abContactXML the XmlBackedInstance that contains update values with which to populate contact
   * @return the populated contact
   */
  function populateContactFromXML(contact : Contact, abContactXML : XmlBackedInstance) : Contact {

  /**
  * To populate a field, use populateBeanField. Note that ab_fieldName can be omitted if it is the same as local_fieldName:
  *
  * populateBeanField(bean   , local_fieldName    , instanceXML , ab_fieldName)
  */
    populateBeanField(contact, ADDRESS_BOOK_UID   , abContactXML, LINK_ID)
    populateBeanField(contact, "EmailAddress1"    , abContactXML)
    populateBeanField(contact, "EmailAddress2"    , abContactXML)
    populateBeanField(contact, "Name"             , abContactXML)
    populateBeanField(contact, "Notes"            , abContactXML)
    populateBeanField(contact, "Preferred"        , abContactXML)
    populateBeanField(contact, "PreferredCurrency", abContactXML)
    populateBeanField(contact, "PrimaryPhone"     , abContactXML)
    populateBeanField(contact, "TaxStatus"        , abContactXML)
    populateBeanField(contact, "WithholdingRate"  , abContactXML)

    populateBeanPhone(contact, "FaxPhone"         , abContactXML)
    populateBeanPhone(contact, "HomePhone"        , abContactXML)
    populateBeanPhone(contact, "WorkPhone"        , abContactXML)

    if (contact typeis Person) {
      populateBeanPhone(contact, "CellPhone"       , abContactXML)
      populateBeanField(contact, "DateOfBirth"     , abContactXML)
      populateBeanField(contact, "FirstName"       , abContactXML)
      populateBeanField(contact, "FormerName"      , abContactXML)
      populateBeanField(contact, "Gender"          , abContactXML)
      populateBeanField(contact, "LastName"        , abContactXML)
      populateBeanField(contact, "LicenseNumber"   , abContactXML)
      populateBeanField(contact, "LicenseState"    , abContactXML)
      populateBeanField(contact, "MaritalStatus"   , abContactXML)
      populateBeanField(contact, "MiddleName"      , abContactXML)
      populateBeanField(contact, "NumDependents"   , abContactXML)
      populateBeanField(contact, "NumDependentsU18", abContactXML)
      populateBeanField(contact, "NumDependentsU25", abContactXML)
      populateBeanField(contact, "Occupation"      , abContactXML)
      populateBeanField(contact, "Prefix"          , abContactXML)
      populateBeanField(contact, "Suffix"          , abContactXML)
      populateBeanField(contact, "TaxFilingStatus" , abContactXML)
    }

    /**
     * Handle foreign keys and arrays. Please use populateFkBean and populateArrayBean
     * to populate custom children entities.
     */

    populateOfficialID(contact, abContactXML)
    populateAddresses(contact, abContactXML)

    populateArrayBean(contact,
                      "Tags",
                      abContactXML,
                      "Tags",
                      \ b : KeyableBean, x : XmlBackedInstance -> populateContactTagFromContactTagXML(b,x))

    /* Example usages of populateFkBean:
    populateFkBean(parentBean,
                   custom_fkName_on_Bean,
                   parentXML,
                   custom_fkName_on_XML,
                   \ b : KeyableBean, x : XmlBackedInstance ->custom_populator_function(b, x))
    */

    return contact
  }

  /**
   * Methods to populate child entities. These methods are called by populateFkBean and populateArrayBean.
   */

  override protected function populateABContactAddressFromABContactAddressXML(bean : KeyableBean, xml : XmlBackedInstance) {
    populateBeanField(bean, ADDRESS_BOOK_UID, xml, LINK_ID)
    populateFkBean(bean,
                   "Address",
                   xml,
                   "Address",
                   \ b : KeyableBean, x : XmlBackedInstance ->populateAddressFromAddressXML(b, x))
  }
  
  override protected function populateAddressFromAddressXML(bean : KeyableBean, xml : XmlBackedInstance) {
    populateBeanField(bean, ADDRESS_BOOK_UID, xml, LINK_ID)
    var addressData = createAddressDataFromAddressXML(xml)
    var theAddress = bean as Address
    if (theAddress.New) {
      new AddressDataCopier(addressData, true).copyInto(theAddress)  // adding new address to PC, so just copy the fields from addressData
    } else {
      AddressService.Instance.updateAddress(addressData, true, bean.PublicID, bean.Bundle)
    }
  }

  private function createAddressDataFromAddressXML(xml : XmlBackedInstance)  : AddressData {
    var gosuToSchemaPair = gw.internal.xml.xsd.typeprovider.XmlSchemaTypeToGosuTypeMappings.gosuToSchema(DateTime)
    return new AddressData() {
      :AddressLine1 = xml.Field.firstWhere(\ x -> x.Name == "AddressLine1").Value,
      :AddressLine2 = xml.Field.firstWhere(\ x -> x.Name == "AddressLine2").Value,
      :AddressLine3 = xml.Field.firstWhere(\ x -> x.Name == "AddressLine3").Value,
      :AddressType  = xml.Field.firstWhere(\ x -> x.Name == "AddressType").Value,
      :City         = xml.Field.firstWhere(\ x -> x.Name == "City").Value,
      :Country      = xml.Field.firstWhere(\ x -> x.Name == "Country").Value,
      :County       = xml.Field.firstWhere(\ x -> x.Name == "County").Value,
      :Description  = xml.Field.firstWhere(\ x -> x.Name == "Description").Value,
      :PostalCode   = xml.Field.firstWhere(\ x -> x.Name == "PostalCode").Value,
      :State        = xml.Field.firstWhere(\ x -> x.Name == "State").Value,
      :ValidUntil   = gosuToSchemaPair.Second.deserialize(xml.Field.firstWhere(\ x -> x.Name == "ValidUntil").Value).GosuValue as DateTime
    }
  }

  protected function populateContactTagFromContactTagXML(bean : KeyableBean, xml : XmlBackedInstance) {
    populateBeanField(bean, ADDRESS_BOOK_UID   , xml, LINK_ID)
    populateBeanField(bean, "Type"             , xml)
  }

  override protected function removeContactAddress(address : ContactAddress) {
    address.Contact.removeOrDelinkAddress(address.Address)
  }

  override protected function removePrimaryAddress(contact : Contact) {
    contact.removeOrDelinkAddress(contact.PrimaryAddress)
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  /**
   * Official ID field requires special handling
   */
  private function populateOfficialID(contact : Contact, abContactXML : XmlBackedInstance) {
    if (contact typeis Person) {
      contact.SSNOfficialID = abContactXML.fieldValue("TaxID")
    } else {
      contact.FEINOfficialID = abContactXML.fieldValue("TaxID")
    }
  }

  private function populateFieldXMLWithValue(instanceXML     : XmlBackedInstance,
                                      ab_fieldName    : String,
                                      value           : Object,
                                      originalValue   : Object,
                                      columnType      : IType,
                                      beanIsNew       : boolean) {
    var fieldXML = new XmlBackedInstance_Field()
    instanceXML.Field.add(fieldXML)
    fieldXML.Name = ab_fieldName
    var pair = XmlSchemaTypeToGosuTypeMappings.gosuToSchema(columnType)
    fieldXML.Type = pair.First
    fieldXML.setAttributeSimpleValue(XmlBackedInstance_Field.$ATTRIBUTE_QNAME_Value,
               pair.Second.gosuValueToStorageValue(value))
    if (beanIsNew or ab_fieldName == LINK_ID or ab_fieldName == EXTERNAL_PUBLIC_ID) return
    fieldXML.setAttributeSimpleValue(XmlBackedInstance_Field.$ATTRIBUTE_QNAME_OrigValue,
               pair.Second.gosuValueToStorageValue(originalValue))
  }
  
  private function addLateBoundTag(instanceXML     : XmlBackedInstance) {
    var fieldXML = new gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Field()
    instanceXML.Field.add(fieldXML)
    fieldXML.Name = LATE_BOUND_ABUIDS
    fieldXML.Value = "true"
  }
}
