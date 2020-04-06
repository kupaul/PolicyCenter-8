package gw.lob.pa
uses gw.contact.AbstractPolicyContactRoleCopier
uses gw.account.PersonToPolicyContactRoleSyncedField

@Export
class PolicyDriverEffDatedCopier extends AbstractPolicyContactRoleCopier<PolicyDriver> {

  construct(driver : PolicyDriver) {
    super(driver)
  }
  
  
  override protected function copyRoleSpecificFields(driver : PolicyDriver) { 
    
    /**
     * Retrieve and set the value from the AccountSyncable's Policy Value.  This copier action will occur 
     * as the result of Adding the same bean during OOS or some other process so we should not try to set 
     * the enhancement properties directly because they might change Account Fields or have other unintended 
     * side effects
     */  
    var licenseNumber = PersonToPolicyContactRoleSyncedField.LicenseNumber.getPolicyEntityFieldValue(driver)
    var licenseState = PersonToPolicyContactRoleSyncedField.LicenseState.getPolicyEntityFieldValue(driver)
    PersonToPolicyContactRoleSyncedField.LicenseNumber.setPolicyEntityFieldValue(_bean, licenseNumber)
    PersonToPolicyContactRoleSyncedField.LicenseState.setPolicyEntityFieldValue(_bean, licenseState)    
    
    
    // The following fields are not syncable to the Account, so using setters directly is safe
    _bean.Excluded = driver.Excluded
    _bean.NumberOfAccidents = driver.NumberOfAccidents
    _bean.NumberOfViolations = driver.NumberOfViolations
    _bean.DoNotOrderMVR = driver.DoNotOrderMVR
    _bean.QuickQuoteNumber = driver.QuickQuoteNumber
    _bean.ApplicableGoodDriverDiscount = driver.ApplicableGoodDriverDiscount
        
  }

}
 