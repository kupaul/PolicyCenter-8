package gw.account

/**
 * Handles a field synced between a Person and a PolicyContactRole.
 * 
 * Using a PersonToPolicyContactRoleSyncedField on a PolicyContactRole
 * that's associated with a Company is not indicative of a coding error
 * because the policy-level fields exist on the PolicyContactRole, even
 * if they don't exist on the contact.  Thus, these fields special-case
 * the set and get field methods to set nothing, and return null if
 * the account entity is not a Person.
 */
@Export
class PersonToPolicyContactRoleSyncedField<S extends PolicyContactRole, T> extends ContactToPolicyContactRoleSyncedField<S, T> {
  public static final var FirstName       : PersonToPolicyContactRoleSyncedField<PolicyContactRole, String> = new PersonToPolicyContactRoleSyncedField<PolicyContactRole, String>("FirstName")
  public static final var LastName        : PersonToPolicyContactRoleSyncedField<PolicyContactRole, String> = new PersonToPolicyContactRoleSyncedField<PolicyContactRole, String>("LastName")
  public static final var FirstNameKanji  : PersonToPolicyContactRoleSyncedField<PolicyContactRole, String> = new PersonToPolicyContactRoleSyncedField<PolicyContactRole, String>("FirstNameKanji")
  public static final var LastNameKanji   : PersonToPolicyContactRoleSyncedField<PolicyContactRole, String> = new PersonToPolicyContactRoleSyncedField<PolicyContactRole, String>("LastNameKanji")
  public static final var Particle        : PersonToPolicyContactRoleSyncedField<PolicyContactRole, String> = new PersonToPolicyContactRoleSyncedField<PolicyContactRole, String>("Particle")
  public static final var DateOfBirth     : PersonToPolicyContactRoleSyncedField<PolicyContactRole, DateTime> = new PersonToPolicyContactRoleSyncedField<PolicyContactRole, DateTime>("DateOfBirth")
  public static final var MaritalStatus   : PersonToPolicyContactRoleSyncedField<PolicyContactRole, MaritalStatus> = new PersonToPolicyContactRoleSyncedField<PolicyContactRole, MaritalStatus>("MaritalStatus")
  public static final var LicenseNumber   : PersonToPolicyContactRoleSyncedField<PolicyDriver, String> = new PersonToPolicyContactRoleSyncedField<PolicyDriver, String>("LicenseNumber")
  public static final var LicenseState    : PersonToPolicyContactRoleSyncedField<PolicyDriver, Jurisdiction> = new PersonToPolicyContactRoleSyncedField<PolicyDriver, Jurisdiction>("LicenseState")

  construct(baseFieldName : String) {
    super(baseFieldName)
  }
  
  override function getAccountEntityFieldValue(accountSyncable : S) : T {
    if (isRoleOnPerson(accountSyncable)) {
      return super.getAccountEntityFieldValue(accountSyncable)
    } else {
      return null
    }
  }
  
  override function getPolicyEntityFieldValue(accountSyncable : S) : T {
    if (isRoleOnPerson(accountSyncable)) {
      return super.getPolicyEntityFieldValue(accountSyncable)
    } else {
      return null
    }
  }

  override function setAccountEntityFieldValue(accountSyncable : S, value : T) {
    if (isRoleOnPerson(accountSyncable)) {
      super.setAccountEntityFieldValue(accountSyncable, value)
    }
  }

  override function setPolicyEntityFieldValue(accountSyncable : S, value : T) {
    if (isRoleOnPerson(accountSyncable)) {
      super.setPolicyEntityFieldValue(accountSyncable, value)
    }
  }
  
  private function isRoleOnPerson(accountSyncable : S) : boolean {
    return getAccountEntity(accountSyncable) typeis Person
  }
  
}
