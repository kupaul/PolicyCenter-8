package gw.api.phone

@Export
class BasicPhoneOwner extends StandardPhoneOwner{

  var _overrideEditability = false;
  var _editable = true;

  construct(fields : PhoneFields) {
    super(fields, false)
  }

  construct(fields : PhoneFields, label : String) {
    super(fields, label, false)
  }

  construct(fields : PhoneFields, label : String, editable : boolean){
    super(fields, label, false)
    _overrideEditability = true
    _editable = editable
  }

  override function isRequired(fieldId : PhoneOwnerFieldId) : boolean {
    return false
  }

  override function isRegionCodeRequired() : boolean {
    return false
  }

  override function isEditable(fieldId: PhoneOwnerFieldId) : boolean {
    if (_overrideEditability && !_editable){
      return _editable
    }

    return super.isEditable(fieldId)
  }


  override function isFieldVisibleReadOnlyMode(fieldId : PhoneOwnerFieldId) : boolean {
    if (_overrideEditability && !_editable){
      return fieldId == PhoneOwnerFieldId.PHONE_DISPLAY
    }
    return super.isFieldVisibleReadOnlyMode(fieldId)
  }

  override function isFieldVisibleEditMode(fieldId : PhoneOwnerFieldId) : boolean {
    if (_overrideEditability && !_editable){
      return fieldId == PhoneOwnerFieldId.PHONE_DISPLAY
    }
    return super.isFieldVisibleEditMode(fieldId)
  }

}