package gw.account

uses gw.api.domain.account.AbstractDateAwareAccountSyncedFieldImpl

/**
 * Handles a field synced between an Address and a PolicyAddress.
 */
@Export
class AddressToPolicyAddressSyncedField<T> extends AbstractDateAwareAccountSyncedFieldImpl<PolicyAddress, T>{
  public static final var AddressLine1  : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("AddressLine1")
  public static final var AddressLine2  : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("AddressLine2")
  public static final var AddressLine3  : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("AddressLine3")
  public static final var City          : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("City")
  public static final var AddressLine1Kanji  : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("AddressLine1Kanji")
  public static final var AddressLine2Kanji  : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("AddressLine2Kanji")
  public static final var CityKanji          : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("CityKanji")
  public static final var CEDEX         : AddressToPolicyAddressSyncedField<Boolean> = new AddressToPolicyAddressSyncedField<Boolean>("CEDEX")
  public static final var CEDEXBureau   : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("CEDEXBureau")
  public static final var County        : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("County")
  public static final var PostalCode    : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("PostalCode")
  public static final var State         : AddressToPolicyAddressSyncedField<State> = new AddressToPolicyAddressSyncedField<State>("State")
  public static final var Country       : AddressToPolicyAddressSyncedField<Country> = new AddressToPolicyAddressSyncedField<Country>("Country")
  public static final var Description   : AddressToPolicyAddressSyncedField<String> = new AddressToPolicyAddressSyncedField<String>("Description")
  public static final var AddressType   : AddressToPolicyAddressSyncedField<AddressType> = new AddressToPolicyAddressSyncedField<AddressType>("AddressType")
  
  construct(baseFieldName : String) {
    super(baseFieldName, PendingAddressUpdate)
  }

  override function getAccountEntity(accountSyncable : PolicyAddress) : KeyableBean {
    return accountSyncable.Address
  }

}
