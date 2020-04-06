package gw.webservice.pc.pc700.gxmodel
uses gw.xml.XmlTypeInstance
uses gw.pl.currency.MonetaryAmount
uses java.math.BigDecimal
uses gw.entity.IEntityPropertyInfo
uses gw.lang.reflect.IPropertyInfo

/**
 * Moving PC specific code off of a generic GX Model enhancement into a utility class.  See XmlElementEnhancement.gs
 * for further history on this code.
 */
@Export
@Deprecated("Deprecated As of 8.0; was only used to populate monetary amounts")
class MonetaryAmountAwareValuePopulator {

  /**
   * Populate the target object with all the values from the source xml.
   * This method assumes that each simple property in the source xml
   * corresponds to a field on the target object.
   *
   * Auto coerces BigDecimal to MonetaryAmount and uses default currency
   */
  static function populate(source : XmlTypeInstance, target : Object) {
    for (child in source.Children) {
      if (child.SimpleValue != null) { // ignore child if it is a complex property
        var fieldName = child.QName.LocalPart
        var field = (typeof target).TypeInfo.getProperty(fieldName)
        var value = child.SimpleValue.GosuValue
        if (target typeis gw.pl.persistence.core.Bean) {
          var targetType = field.FeatureType
          if (targetType == MonetaryAmount.Type and value typeis BigDecimal) {
              value = value.ofDefaultCurrency()
          }
          if (field typeis IEntityPropertyInfo) {
            target.setFieldValue(fieldName, value)
          } else {
            setFieldByUsingSetter(target, field, value)
          }
        } else {
          setFieldByUsingSetter(target, field, value)
        }
      }
    }
  }

  private static function setFieldByUsingSetter(target : Object, field : IPropertyInfo, value : Object) {
    if (field.Writable) {
      field.Accessor.setValue(target, value)
    }
  }
}
