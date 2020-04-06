package gw.webservice.pc.pc800.gxmodel
uses gw.xml.XmlTypeInstance
uses java.lang.UnsupportedOperationException
uses gw.xsd.w3c.xmlschema.types.complex.AnyType
uses gw.entity.IEntityPropertyInfo

/**
 * Moving PC specific code off of a generic GX Model enhancement into a utility class.  See XmlElementEnhancement.gs
 * for further history on this code.
 */
@Export
class SimpleValuePopulator {

  /**
   * Populate the target object with all the values from the source xml.
   * This method assumes that each simple property in the source xml
   * corresponds to a field on the target object.
   */
  static function populate(source : XmlTypeInstance, target : Object) {
    for (child in source.Children) {
      if (child.SimpleValue != null) { // ignore child if it is a complex property
        var fieldName = child.QName.LocalPart
        if (target typeis gw.pl.persistence.core.Bean) {
          target.setFieldValue(fieldName, child.SimpleValue.GosuValue)
        } else {
          var field = (typeof target).TypeInfo.getProperty(fieldName)
          if (field.Writable) {
            field.Accessor.setValue(target, child.SimpleValue.GosuValue)
          }
        }
      }
    }
  }

}
