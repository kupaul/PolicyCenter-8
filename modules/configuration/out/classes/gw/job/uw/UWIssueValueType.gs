package gw.job.uw

uses gw.job.uw.types.UWIssueBigDecimalType
uses gw.job.uw.types.UWIssueMonetaryAmountType
uses gw.job.uw.types.UWIssueNoValueType
uses gw.job.uw.types.UWIssueStateSetValueType

@Export
interface UWIssueValueType {

  public static var BIG_DECIMAL : UWIssueBigDecimalType = new UWIssueBigDecimalType()
  public static var MONETARY_AMOUNT : UWIssueMonetaryAmountType = new UWIssueMonetaryAmountType()
  public static var NO_VALUE : UWIssueNoValueType = new UWIssueNoValueType()
  public static var STATE_SET : UWIssueStateSetValueType = new UWIssueStateSetValueType()

  /**
   * Converts the given value of type T into a String (or possibly null)
   * @param value the value of type T
   * @return the serialized, String version of T
   */
  function serialize(value : Object) : String

  /**
   * Converts the given String value into an element of type T (or possible null).
   * @param value the serialized String value
   * @return the deserialized value of type T
   */
  function deserialize(value : String) : Object

  /**
   * Validates the given String value, and returns an error message if the value is invalid for this data type.
   * If the value is a valid String for this type, null should be returned.
   *
   * @param value the value to validate
   * @return null if this is a valid value, and an error message otherwise
   */
  function validate(value : String) : String
}
