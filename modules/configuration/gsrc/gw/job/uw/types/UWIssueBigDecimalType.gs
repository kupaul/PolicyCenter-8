package gw.job.uw.types

uses gw.job.uw.UWIssueValueType
uses java.math.BigDecimal
uses java.lang.NumberFormatException
uses java.lang.NullPointerException

@Export
class UWIssueBigDecimalType implements UWIssueValueType {
  override function deserialize(value : String) : BigDecimal {
    return value == null ? null : new BigDecimal(value)  
  }
  
  override function serialize(obj : Object) : String {
    var value = obj as BigDecimal
    return value == null ? null : value.toString()  
  }

  override function validate(value : String) : String {
    try {
      var bdValue = new BigDecimal(value) 
      return null 
    } catch (e : NumberFormatException) {
      return displaykey.UWIssue.BigDecimalType.InvalidDecimalValue(value)
    } catch (e: NullPointerException) {
      return displaykey.UWIssue.BigDecimalType.InvalidDecimal  
    }
  }
}
