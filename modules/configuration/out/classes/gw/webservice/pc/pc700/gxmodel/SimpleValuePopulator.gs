package gw.webservice.pc.pc700.gxmodel
uses gw.xml.XmlTypeInstance

/**
 * Moving PC specific code off of a generic GX Model enhancement into a utility class.  See XmlElementEnhancement.gs
 * for further history on this code.
 */
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.gxmodel.SimpleValuePopulator instead")
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
