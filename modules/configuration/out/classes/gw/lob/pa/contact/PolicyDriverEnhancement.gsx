package gw.lob.pa.contact
uses gw.plugin.motorvehiclerecord.MVRSearchCriteria
uses gw.account.PersonToPolicyContactRoleSyncedField
uses gw.contact.AgeCalculator

@Export
enhancement PolicyDriverEnhancement : entity.PolicyDriver {

  /**
   * License number for this policy driver.
   *
   * @see gw.account.PersonToPolicyContactRoleSyncedField
   * @return A String which represents revisioned license number.
   */
  property get LicenseNumber() : String {
    return PersonToPolicyContactRoleSyncedField.LicenseNumber.getValue(this)
  }

  /**
   * Set license number for this policy driver.
   *
   * @param arg A string which represents a license number
   * @see gw.account.PersonToPolicyContactRoleSyncedField
   */
  property set LicenseNumber(arg : String) {
    PersonToPolicyContactRoleSyncedField.LicenseNumber.setValue(this, arg)
  }

  /**
   * The license state for this policy driver.
   *
   * @see gw.account.PersonToPolicyContactRoleSyncedField
   * @return A {@link typekey.State} which represents the state of license.
   */
  property get LicenseState() : typekey.Jurisdiction {
    return PersonToPolicyContactRoleSyncedField.LicenseState.getValue(this)
  }

  /**
   * Set license state for this policy driver.
   *
   * @see gw.account.PersonToPolicyContactRoleSyncedField
   * @return A {@link typekey.State} which represents state of the license.
   */
  property set LicenseState(arg : typekey.Jurisdiction) {
    PersonToPolicyContactRoleSyncedField.LicenseState.setValue(this, arg)
  }

  /**
   * Age of the policy driver calculated using the driver's date of birth.
   * @return An integer which represents the age of the driver
   * @see gw.contact.AgeCalculator
   */
  property get Age() : int {
    return AgeCalculator.Instance.getAge(this.DateOfBirth)
  }

  /**
   * Get the ExcludedInternal value for this driver.
   * @return boolean which represents whether this driver is excluded
   */
  property get Excluded(): boolean {
    return this.getFieldValue("ExcludedInternal") as boolean
  }

  /**
   * Sets excluded property on this driver if it has not been set already.
   * Excluded property includes:
   * <ul>
   *   <li> Excluded Internal
   *   <li> Do not order MVR
   * </ul>
   *
   * @param arg A boolean value for whether this driver is excluded.
   */
  property set Excluded(arg : boolean) {
    if (arg != this.Excluded) {
      this.setFieldValue("ExcludedInternal", arg)
      this.DoNotOrderMVR = arg
    }
  }

  /**
   * Retrieves search criteria necessary for finding MVRs.
   * @return {@link entity.MVRSearchCriteria}
   */
  property get MVRSearchCriteria() : MVRSearchCriteria {
    var contact = this.AccountContactRole.AccountContact.Contact as Person
    return contact.getMVRSearchCriteria()
  }
  
  /**
   * This property is added to include a check for null on the entity field 
   * and not enforce clients of this class to check for null on every 
   * use of the original property
   */
  property get hasGoodDriverDiscount() : boolean {
    return this.ApplicableGoodDriverDiscount != null and this.ApplicableGoodDriverDiscount
  }

  /**
   * Refresh policy driver's motor vehicle record if it is not null.
   * @return {@link entity.PolicyDriverMVR}
   */
  function refreshAndReturnPolicyDriverMVR(): PolicyDriverMVR{
    var policyMVR: PolicyDriverMVR
    
    if(this.PolicyDriverMVR != null){
      this.PolicyDriverMVR.refresh()
      policyMVR = this.PolicyDriverMVR
    }
    
    return policyMVR
  }

  /**
   * Initialize incident summary by setting number of accidents and violations for this driver.
   */
  function initializeIncidentSummary(){
    var driver = this.AccountContactRole as Driver
    this.NumberOfAccidents = driver.NumberofAccidents.Code
    this.NumberOfViolations = driver.NumberofViolations.Code
  }

  /**
   * Get motor vehicle record order status for this driver.
   * @return A string - the display name of the order status if order status is not null. Otherwise, return display key for not ordered.
   */
  property get MVROrderStatus(): String {
    var policyDriverMVR = this.PolicyDriverMVR
    return policyDriverMVR.OrderStatus != null ? policyDriverMVR.OrderStatus.DisplayName : displaykey.Web.PolicyLine.Drivers.NotOrdered
  }

  /**
   * Checks whether the motor vehicle record can be ordered for this driver.
   * @return A string - a display key which represents whether MVR records can be ordered.
   */
  property get DoNotOrderMVRDisplay(): String{
    return this.DoNotOrderMVR ? displaykey.Web.PersonalAuto.MotorVehicleRecord.Checkbox : ""
  }

}
