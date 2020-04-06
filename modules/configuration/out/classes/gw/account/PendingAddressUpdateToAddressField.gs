package gw.account

@Export
class PendingAddressUpdateToAddressField<T> {
  public static final var AddressLine1  : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("AddressLine1")
  public static final var AddressLine2  : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("AddressLine2")
  public static final var AddressLine3  : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("AddressLine3")
  public static final var City          : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("City")
  public static final var AddressLine1Kanji  : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("AddressLine1Kanji")
  public static final var AddressLine2Kanji  : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("AddressLine2Kanji")
  public static final var CityKanji          : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("CityKanji")
  public static final var CEDEX         : PendingAddressUpdateToAddressField<Boolean> = new PendingAddressUpdateToAddressField<Boolean>("CEDEX")
  public static final var CEDEXBureau   : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("CEDEXBureau")
  public static final var County        : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("County")
  public static final var PostalCode    : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("PostalCode")
  public static final var State         : PendingAddressUpdateToAddressField<State> = new PendingAddressUpdateToAddressField<State>("State")
  public static final var Country       : PendingAddressUpdateToAddressField<Country> = new PendingAddressUpdateToAddressField<Country>("Country")
  public static final var Description   : PendingAddressUpdateToAddressField<String> = new PendingAddressUpdateToAddressField<String>("Description")
  public static final var AddressType   : PendingAddressUpdateToAddressField<AddressType> = new PendingAddressUpdateToAddressField<AddressType>("AddressType")
  
  construct(fieldName : String) {
    this(fieldName, fieldName)
  }
  
  construct(theAccountFieldName : String, theUpdateFieldName : String) {
    _addressFieldName = theAccountFieldName
    _updateFieldName = theUpdateFieldName
    _updateIsNullFieldName = theUpdateFieldName + "IsNull"
  }
  
  var _addressFieldName : String as readonly AddressFieldName
  var _updateFieldName : String as readonly UpdateFieldName
  var _updateIsNullFieldName : String as readonly UpdateIsNullName
  
  function setUpdateValue(pendingUpdate : PendingAddressUpdate, value : T){
    if (value == null){
      pendingUpdate.setFieldValue(UpdateIsNullName, true)
      pendingUpdate.setFieldValue(UpdateFieldName, null)
    } else {
      pendingUpdate.setFieldValue(UpdateIsNullName, false)
      pendingUpdate.setFieldValue(UpdateFieldName, null)
    }
  }
  
  function setUpdateValueFromSyncedField(syncField : AddressToPolicyAddressSyncedField, accountSyncable : PolicyAddress, pendingUpdate : PendingAddressUpdate){
    if (syncField.isPolicyEntityFieldChanged(accountSyncable) and syncField.checkIfAccountAndPolicyEntityFieldValuesMatch(accountSyncable)){
      var updateValue = syncField.getPolicyEntityFieldValue(accountSyncable) as T
      setUpdateValue(pendingUpdate, updateValue)  
    }
  }
}
