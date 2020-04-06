package gw.account
uses java.lang.Integer
uses gw.api.domain.account.AbstractAccountSyncedFieldImpl

/**
 * Handles a field synced between an AccountLocation and a PolicyLocation.
 */
@Export
class AccountLocationToPolicyLocationSyncedField<T> extends AbstractAccountSyncedFieldImpl<PolicyLocation, T> {
  public static final var AddressLine1  : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("AddressLine1")
  public static final var AddressLine2  : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("AddressLine2")
  public static final var AddressLine3  : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("AddressLine3")
  public static final var City          : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("City")
  public static final var AddressLine1Kanji  : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("AddressLine1Kanji")
  public static final var AddressLine2Kanji  : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("AddressLine2Kanji")
  public static final var CityKanji     : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("CityKanji")
  public static final var CEDEX         : AccountLocationToPolicyLocationSyncedField<Boolean> = new AccountLocationToPolicyLocationSyncedField<Boolean>("CEDEX")
  public static final var CEDEXBureau   : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("CEDEXBureau")
  public static final var County        : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("County")
  public static final var PostalCode    : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("PostalCode")
  public static final var State         : AccountLocationToPolicyLocationSyncedField<State> = new AccountLocationToPolicyLocationSyncedField<State>("State")
  public static final var Country       : AccountLocationToPolicyLocationSyncedField<Country> = new AccountLocationToPolicyLocationSyncedField<Country>("Country")
  public static final var Description   : AccountLocationToPolicyLocationSyncedField<String> = new AccountLocationToPolicyLocationSyncedField<String>("Description")
  public static final var ValidUntil    : AccountLocationToPolicyLocationSyncedField<DateTime> = new AccountLocationToPolicyLocationSyncedField<DateTime>("ValidUntil")
  public static final var AddressType   : AccountLocationToPolicyLocationSyncedField<AddressType> = new AccountLocationToPolicyLocationSyncedField<AddressType>("AddressType")
  public static final var EmployeeCount : AccountLocationToPolicyLocationSyncedField<Integer> = new AccountLocationToPolicyLocationSyncedField<Integer>("EmployeeCount")
  
  construct(baseFieldName : String) {
    super(baseFieldName)
  }

  override function getAccountEntity(accountSyncable : PolicyLocation) : KeyableBean {
    return accountSyncable.AccountLocation
  }
  
}
