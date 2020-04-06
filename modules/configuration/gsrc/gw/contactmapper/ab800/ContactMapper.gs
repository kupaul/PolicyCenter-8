package gw.contactmapper.ab800

uses java.util.Set
uses gw.api.system.PCLoggerCategory
uses gw.webservice.contactapi.mapping.PropertyMapping


/**
 * Use this file to map between PolicyCenter entities in the Contact graph and 
 * <b>XmlBackedInstance</b> objects that represent ContactManager entities.
 */
@Export
internal class ContactMapper extends ContactMapperPCBase {
  private static var _logger = PCLoggerCategory.CONTACT_API

  construct() {}
  

  /**
   * Returns the set of mapped properties used to integrate with ContactManager.  
   * These properties are used to translate between entities in the Contact graph 
   * ("beans") and the XML sent to and from ContactManager.
   * 
   * By default, mappings are in both directions, "to XML" and "to bean".  For 
   * mappings that should only be used for one direction, use<br>
   * <code>
   * &nbsp;&nbsp;.withMappingDirection(TO_XML) or<br>
   * &nbsp;&nbsp;.withMappingDirection(TO_BEAN)<br>
   * </code><br>
   * By default, the property name is used in the XML.  If the property name in 
   * ContactManager is different from the local app, use<br>
   * <code>
   * &nbsp;&nbsp;.withABName(abName)<br>
   * </code><br>
   *
   * When mapping AddressBookUID, use the LINK_ID ABName:<br>
   * <code>&nbsp;fieldMapping(Accident_Ext#AddressBookUID)<br>
   * &nbsp;&nbsp;.withABName(LINK_ID),<br>
   * </code><br>
   * When mapping PublicID, use the TO_XML direction and the EXTERNAL_PUBLIC_ID 
   * ABName:
   * <code>
   * &nbsp;fieldMapping(Accident_Ext#PublicID)<br>
   * &nbsp;&nbsp;.withMappingDirection(TO_XML)<br>
   * &nbsp;&nbsp;.withABName(EXTERNAL_PUBLIC_ID),<br>
   * </code><br>
   * For simple fields, use<br>
   * <code>
   * &nbsp;fieldMapping(Entity#Property)<br>
   * </code><br>
   * For foreign keys to child objects use, use<br>
   * <code>
   *   &nbsp;fkMapping(Entity#Property)<br>
   * </code>
   * and <code>fieldMapping()</code> for the properties on the child entity.<br>
   * Example: Suppose the
   * Contact data model was extended with DrivingHabits_Ext foreign key.  This would 
   * be added to the code:<br>
   *   <code>&nbsp;fkMapping(Contact#DrivingHabits_Ext) <br>
   *   &nbsp;fieldMapping(DrivingHabits_Ext#AddressBookUID)<br>
   *     &nbsp;&nbsp;.withABName(LINK_ID),<br>
   *   &nbsp;fieldMapping(DrivingHabits_Ext#PublicID)<br>
   *     &nbsp;&nbsp;.withMappingDirection(TO_XML)<br>
   *     &nbsp;&nbsp;.withABName(EXTERNAL_PUBLIC_ID),<br>
   *   &nbsp;fieldMapping(DrivingHabits_Ext#MilesPerWeek)<br>
   *   &nbsp;fieldMapping(DrivingHabits_Ext#CommuteDistance)<br>
   *   &nbsp;fieldMapping(DrivingHabits_Ext#Carpools)<br>
   * </code><br>
   * For arrays of child objects use, use
   * <code>
   * &nbsp;arrayMapping(Entity#Property)
   * </code><br>
   * and fieldMapping() for the properties on the child entity.
   * <p>
   * Example: Suppose the
   * Contact data model was extended with AccidentHistory_Ext array of Accident_Ext 
   * objects.  This would be added to the code:<br>
   * <code>
   * &nbsp;arrayMapping(Contact#AccidentHistory_Ext)<br>
   * &nbsp;fieldMapping(Accident_Ext#AddressBookUID)<br>
   * &nbsp;&nbsp;.withABName(LINK_ID),<br>
   * &nbsp;fieldMapping(Accident_Ext#PublicID)<br>
   * &nbsp;&nbsp;.withMappingDirection(TO_XML)<br>
   * &nbsp;&nbsp;.withABName(EXTERNAL_PUBLIC_ID),<br>
   * &nbsp;fieldMapping(Accident_Ext#AccidentDate)<br>
   * &nbsp;fieldMapping(Accident_Ext#DamageCost)<br>
   * &nbsp;fieldMapping(Accident_Ext#DriverAtFault)<br>
   * </code><br>
   */
  override property get Mappings() : Set<PropertyMapping> {
    _logger.trace("Called " + this.IntrinsicType.Name + ".Mappings")

    return {

      fieldMapping(Contact#AddressBookUID)
          .withABName(LINK_ID),

      fieldMapping(Contact#ExternalID)
          .withMappingDirection(TO_XML)
          .withABName(EXTERNAL_UNIQUE_ID),

      fieldMapping(Contact#PublicID)
          .withMappingDirection(TO_XML)
          .withABName(EXTERNAL_PUBLIC_ID),

      fieldMapping(Contact#EmailAddress1),
      fieldMapping(Contact#EmailAddress2),
      fieldMapping(Contact#FaxPhone),
      fieldMapping(Contact#FaxPhoneCountry),
      fieldMapping(Contact#FaxPhoneExtension),
      fieldMapping(Contact#HomePhone),
      fieldMapping(Contact#HomePhoneCountry),
      fieldMapping(Contact#HomePhoneExtension),
      fieldMapping(Contact#Name),
      fieldMapping(Contact#Notes),
      fieldMapping(Contact#Preferred),
      fieldMapping(Contact#PreferredCurrency),
      fieldMapping(Contact#PrimaryPhone),
      fieldMapping(Contact#TaxStatus),
      fieldMapping(Contact#WithholdingRate),
      fieldMapping(Contact#WorkPhone),
      fieldMapping(Contact#WorkPhoneCountry),
      fieldMapping(Contact#WorkPhoneExtension),
      fieldMapping(Contact#NameKanji),

      // PC uses special code in PCTaxIDFieldMapping for handling TaxID.
      new PCTaxIDFieldMapping(),

      fieldMapping(Person#CellPhone),
      fieldMapping(Person#CellPhoneCountry),
      fieldMapping(Person#CellPhoneExtension),
      fieldMapping(Person#DateOfBirth),
      fieldMapping(Person#FirstName),
      fieldMapping(Person#FormerName),
      fieldMapping(Person#Gender),
      fieldMapping(Person#LastName),
      fieldMapping(Person#LicenseNumber),
      fieldMapping(Person#LicenseState),
      fieldMapping(Person#MaritalStatus),
      fieldMapping(Person#MiddleName),
      fieldMapping(Person#NumDependents),
      fieldMapping(Person#NumDependentsU18),
      fieldMapping(Person#NumDependentsU25),
      fieldMapping(Person#Occupation),
      fieldMapping(Person#Prefix),
      fieldMapping(Person#Suffix),
      fieldMapping(Person#TaxFilingStatus),
      fieldMapping(Person#FirstNameKanji),
      fieldMapping(Person#LastNameKanji),
      fieldMapping(Person#Particle),

      // addresses
      fkMapping(Contact#PrimaryAddress)
          .withMappingDirection(TO_XML),
      arrayMapping(Contact#ContactAddresses)
          .withMappingDirection(TO_XML),
      fieldMapping(ContactAddress#AddressBookUID)
          .withMappingDirection(TO_XML)
          .withABName(LINK_ID),
      fieldMapping(ContactAddress#PublicID)
          .withMappingDirection(TO_XML)
          .withABName(EXTERNAL_PUBLIC_ID),
      fkMapping(ContactAddress#Address),

      fieldMapping(Address#AddressBookUID)
          .withMappingDirection(TO_XML)
          .withABName(LINK_ID),
      fieldMapping(Address#PublicID)
          .withMappingDirection(TO_XML)
          .withABName(EXTERNAL_PUBLIC_ID),
      fieldMapping(Address#AddressLine1),
      fieldMapping(Address#AddressLine2),
      fieldMapping(Address#AddressLine3),
      fieldMapping(Address#AddressType),
      fieldMapping(Address#City),
      fieldMapping(Address#Country),
      fieldMapping(Address#County),
      fieldMapping(Address#Description),
      fieldMapping(Address#GeocodeStatus),
      fieldMapping(Address#PostalCode),
      fieldMapping(Address#State),
      fieldMapping(Address#ValidUntil),
      fieldMapping(Address#AddressLine1Kanji),
      fieldMapping(Address#AddressLine2Kanji),
      fieldMapping(Address#CityKanji),
      fieldMapping(Address#CEDEX),
      fieldMapping(Address#CEDEXBureau),

      // tags
      arrayMapping(Contact#Tags),
      fieldMapping(ContactTag#AddressBookUID)
          .withABName(LINK_ID),
      fieldMapping(ContactTag#PublicID)
          .withMappingDirection(TO_XML)
          .withABName(EXTERNAL_PUBLIC_ID),
      fieldMapping(ContactTag#Type)
    }
  }
}
