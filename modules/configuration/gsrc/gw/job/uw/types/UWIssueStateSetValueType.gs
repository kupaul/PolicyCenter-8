package gw.job.uw.types

uses gw.job.uw.UWIssueValueType
uses java.util.LinkedHashSet
uses java.lang.Exception

@Export
class UWIssueStateSetValueType implements UWIssueValueType {
  
  private static final var _NOT = "not "
  
  override function deserialize(value : String) : ExclusiveSet<State> {
    if (value == null) {
      return null  
    }
    
    var exclusive = false
    if (value.startsWith(_NOT)) {
      exclusive = true
      value = value.substring(4)   
    }
    
    var values = new LinkedHashSet<State>()
    for (v in value.split(",")) {
      var trimmedValue = v.trim()
      if (trimmedValue.NotBlank) {
        values.add(deserializeElement(trimmedValue)) 
      }
    }
    
    return new ExclusiveSet<State>(exclusive, values)
  }
  
  override function serialize(obj : Object) : String {
    var value = obj as ExclusiveSet<State>
    if (value == null) {
      return null  
    }
    
    var elementString = value.Values.map(\ t -> serializeElement(t)).join(",")
    return (value.Exclusive ? _NOT + elementString : elementString)
  }

  override function validate(value : String) : String {
    try {
      deserialize(value)
      return null  
    } catch (e : Exception) {
      return displaykey.Admin.SetValueTypeBase.Validate(value, typeName())    
    }
  } 

  function deserializeElement(value : String) : State {
    return value as State
  }

  function serializeElement(value : State) : String {
    return value.Code
  }

  function typeName() : String {
    return State.Type.RelativeName
  }
}
