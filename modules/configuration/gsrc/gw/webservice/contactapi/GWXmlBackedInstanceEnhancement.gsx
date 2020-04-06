package gw.webservice.contactapi

uses gw.internal.xml.xsd.typeprovider.XmlSchemaTypeToGosuTypeMappings
uses gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Array
uses gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Field
uses gw.webservice.contactapi.beanmodel.anonymous.elements.XmlBackedInstance_Fk
uses gw.webservice.contactapi.beanmodel.XmlBackedInstance
uses gw.webservice.contactapi.mapping.MappingConstants
uses javax.xml.namespace.QName
uses gw.api.util.PhoneUtil

/**
 * Enhancement methods for XmlBackedInstance.
 */
@Export
enhancement GWXmlBackedInstanceEnhancement : XmlBackedInstance {
  
  property get ExternalPublicID() : String {
    return fieldValue(MappingConstants.EXTERNAL_PUBLIC_ID)
  }

  property get ExternalUniqueID() : String {
    return fieldValue(MappingConstants.EXTERNAL_UNIQUE_ID)
  }

  property get ExternalUpdateUser() : String {
    return this.External_UpdateUser
  }
  
  property get ExternalUpdateApp() : String {
    return this.External_UpdateApp
  }
  
  property get LinkID() : String {
    return fieldValue("LinkID")
  }
  
  property get PublicID() : String {
    return fieldValue("PublicID")
  }

  property get PrimaryAddressForeignKey() : XmlBackedInstance_Fk {
    return this.foreignKeyByName("PrimaryAddress")
  }
  
  property get PrimaryAddress() : XmlBackedInstance {
    return PrimaryAddressForeignKey.XmlBackedInstance
  }
  
  /**
   * Returns the list of XmlBackedInstances that represent the
   * ContactAddress entities.
   */
  property get SecondaryAddressInstances() : List<XmlBackedInstance> {
    return this.arrayByName("ContactAddresses").XmlBackedInstance
  }
  
  /**
   * Returns a list of the XmlBackedInstances that represent the
   * actual secondary Address entities.
   */
  property get SecondaryAddresses() : List<XmlBackedInstance> {
    return SecondaryAddressForeignKeys.map(\ x -> x.XmlBackedInstance)
  }
  
  
  /**
   * Returns the list of XmlBackedInstance_Fk representing the secondary
   * address foreign keys (ContactAddress->Address).
   */  
  private property get SecondaryAddressForeignKeys() : List<XmlBackedInstance_Fk> {
    return SecondaryAddressInstances.map(\ x -> x.foreignKeyByName("Address"))
  }
  
  /**
   * Returns the number of secondary addresses.
   */
  property get NumberOfSecondaryAddresses() : int {
    return SecondaryAddressInstances == null ? 0 : SecondaryAddressInstances.Count
  }
  
  function secondaryAddress(index : int) : XmlBackedInstance {
    return SecondaryAddressForeignKeys[index].XmlBackedInstance
  }
  
  function arrayByName(arrayName : String) : XmlBackedInstance_Array {
    return this.Array.firstWhere(\ i -> i.Name == arrayName)
  }
  
  function nonNullArrayByName(arrayName : String) : XmlBackedInstance_Array {
    var instanceArray = arrayByName(arrayName)
    if (instanceArray == null) {
      instanceArray = new XmlBackedInstance_Array()
      instanceArray.Name = arrayName
      this.Array.add(instanceArray)
    }
    return instanceArray
  }
  
  function foreignKeyByName(fkName : String) : XmlBackedInstance_Fk {
    return this.Fk.firstWhere(\ i -> i.Name == fkName)
  }

  function nonNullForeignKeyByName(fkName : String, fkEntityType : String) : XmlBackedInstance_Fk {
    var instanceFk = foreignKeyByName(fkName)
    if (instanceFk == null) {
      instanceFk = new XmlBackedInstance_Fk()
      this.Fk.add(instanceFk)
      instanceFk.Name = fkName
      instanceFk.XmlBackedInstance = new XmlBackedInstance()
      instanceFk.XmlBackedInstance.EntityType = fkEntityType
    }
    return instanceFk
  }
  
  function fieldByName(fieldName : String) : XmlBackedInstance_Field {
    return this.Field.firstWhere(\ i -> i.Name == fieldName)
  }
  
  function fieldValue(fieldName : String) : String {
    return fieldByName(fieldName).Value
  }

  function phoneFieldValue(fieldName : String) : String {
    return PhoneUtil.normalize(fieldByName(fieldName).Value)
  }
  
  function origValue(fieldName : String) : String {
    return fieldByName(fieldName).OrigValue
  }
  
  function updateFieldValue(fieldName : String, value : Object) {
    var field = mutableField(fieldName)
    if (value != null) {
      var pair = XmlSchemaTypeToGosuTypeMappings.gosuToSchema(typeof value)
      field.Type = pair.First
      field.setAttributeSimpleValue(valueQName(), pair.Second.gosuValueToStorageValue(value))
    } else {
      field.setAttributeSimpleValue(valueQName(), null)
    }
  }
  
  public function mutableField(fieldName : String) : XmlBackedInstance_Field {
    var field = fieldByName(fieldName)
    if (field == null) {
      field = new XmlBackedInstance_Field()
      this.Field.add(field)
      field.Name = fieldName
    }
    return field
  }

  public function hasChangedPrimaryAddress() : boolean {
    if(PrimaryAddress==null and PrimaryAddressForeignKey.OrigValue==null) {
      return false
    } else {
      return PrimaryAddressForeignKey.OrigValue!=PrimaryAddress.LinkID or 
      PrimaryAddress.Field.firstWhere(\ field -> {
        return field.OrigValue!=field.Value
      }) != null
    }
  }
  
  private function valueQName() : QName {
    return XmlBackedInstance_Field.$ATTRIBUTE_QNAME_Value
  }
}