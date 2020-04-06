package gw.contact
uses gw.api.copier.AbstractEffDatedCopyable
uses gw.account.PersonToPolicyContactRoleSyncedField

@Export
abstract class AbstractPolicyContactRoleCopier<T extends PolicyContactRole> extends AbstractEffDatedCopyable<T> {

  construct(role : T) {
    super(role)
  }


  override function copyBasicFieldsFromBean(role : T) {
    copyRoleSpecificFields(role)
    
    /**
     * Retrieve and set the value from the AccountSyncable's Policy Value.  This copier action will occur 
     * as the result of Adding the same bean during OOS or some other process so we should not try to set 
     * the enhancement properties directly because they might change Account Fields or have other unintended 
     * side effects
     */  
    var firstName = PersonToPolicyContactRoleSyncedField.FirstName.getPolicyEntityFieldValue(role)
    var lastName = PersonToPolicyContactRoleSyncedField.LastName.getPolicyEntityFieldValue(role)
    var firstNameKanji = PersonToPolicyContactRoleSyncedField.FirstNameKanji.getPolicyEntityFieldValue(role)
    var lastNameKanji = PersonToPolicyContactRoleSyncedField.LastNameKanji.getPolicyEntityFieldValue(role)
    var birthDt = PersonToPolicyContactRoleSyncedField.DateOfBirth.getPolicyEntityFieldValue(role)
    var maritalStatus = PersonToPolicyContactRoleSyncedField.MaritalStatus.getPolicyEntityFieldValue(role)
    var companyName = PersonToPolicyContactRoleSyncedField.CompanyName.getPolicyEntityFieldValue(role)
    
    PersonToPolicyContactRoleSyncedField.FirstName.setPolicyEntityFieldValue(_bean, firstName)
    PersonToPolicyContactRoleSyncedField.LastName.setPolicyEntityFieldValue(_bean, lastName)
    PersonToPolicyContactRoleSyncedField.FirstNameKanji.setPolicyEntityFieldValue(_bean, firstNameKanji)
    PersonToPolicyContactRoleSyncedField.LastNameKanji.setPolicyEntityFieldValue(_bean, lastNameKanji)
    PersonToPolicyContactRoleSyncedField.DateOfBirth.setPolicyEntityFieldValue(_bean, birthDt)
    PersonToPolicyContactRoleSyncedField.MaritalStatus.setPolicyEntityFieldValue(_bean, maritalStatus)
    PersonToPolicyContactRoleSyncedField.CompanyName.setPolicyEntityFieldValue(_bean, companyName)
    
    
  }
  
  protected function copyRoleSpecificFields(role : T) {
    // nothing to do by default
  }

}
