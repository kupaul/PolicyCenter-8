package gw.job.uw.types

uses gw.job.uw.UWIssueValueType
uses java.lang.IllegalArgumentException

@Export
class UWIssueNoValueType implements UWIssueValueType {
  override function deserialize(value : String) : Object {
    if (value == null) {
      return null
    }
    throw new IllegalArgumentException(displaykey.UWIssue.NoValueType.ExpectNullValue)
  }
  
  override function serialize(value : Object) : String {
    if (value == null) {
      return null
    }
    throw new IllegalArgumentException(displaykey.UWIssue.NoValueType.ExpectNullValue)
  }

  override function validate(value : String) : String {
    if (value == null) {
      return null
    }
    return displaykey.UWIssue.NoValueType.ValueShouldBeNull(value)
  }
}
