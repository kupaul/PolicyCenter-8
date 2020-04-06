package gw.lob.pa
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses java.lang.UnsupportedOperationException
uses gw.address.AddressValidator
uses gw.pcf.contacts.AddressInputSetAddressOwner
uses java.lang.IllegalStateException
uses java.util.HashMap
uses gw.api.system.PCLoggerCategory

@Export
class PALineDriversValidator extends PolicyLineValidation<entity.PersonalAutoLine> {

  private static final var DRIVERS_WIZARD_STEP = "PADrivers"

  static var fieldLabels : HashMap<String, String> as readonly FieldLabels = {
      "AddressLine1" -> displaykey.Web.Policy.PA.Validation.Address.AddressLine1,
      "City" -> displaykey.Web.Policy.PA.Validation.Address.City,
      "State" -> displaykey.Web.Policy.PA.Validation.Address.State,
      "PostalCode" -> displaykey.Web.Policy.PA.Validation.Address.PostalCode}
  
  property get paLine() : entity.PersonalAutoLine { return Line }
  
  construct(valContext : PCValidationContext, policyLine : entity.PersonalAutoLine) {
    super(valContext, policyLine)
  }

  /**
   * Validate the PA Line Drivers.
   *
   * Checks the following:
   * <ul>
   *   <li>Qualified good driver</li>
   *   <li>Good driver discount applied</li>
   *   <li>License info required</li>
   *   <li>License number unique</li>
   *   <li>License state and garage state match</li>
   *   <li>Address contains required fields</li>
   *   <li>Account driver number of incidents</li>
   *   <li>Verify and order MVRs</li>
   *   <li>Verify birth date and incidents</li>
   * </ul>
   */
  override function doValidate() {
    qualifiedGoodDriver()
    appliedGoodDriverDiscount()
    licenseInfoRequired()
    licenseNumberUnique()
    licenseStateMatchesGarageState()
    primaryAddressRequiredFields()
    accountDriverNumberOfIncidents()
    verifyAndOrderMVRs()
    verifyBirthDateAndIncidents()
  }

  /**
   * Quick Quote Personal Auto Driver Validation
   * Validates each Driver by calling the private function <code>verifyBirthDateAndIncidents</code>.
   * <ul>
   *   <li>Validates Date of Birth is required for all drivers</li>
   *   <li>Validates Policy Level Number of Accidents And Violations are required for all drivers</li>
   * </ul>
   *  An error or warning displays on screen if the validation result contains any errors or warnings.
   */
  function validateQQ() {
    Context.addToVisited(this, "validateQQ")
    verifyBirthDateAndIncidents()
  }


  /**
   * Primary Address is required Validation - Validates each Driver has a valid primary address.
   * If the address's country is US,
   * <ul>
   *   <li>Validates Addressline1 of the primary address is not null</li>
   *   <li>Validates City of the primary address is not null</li>
   *   <li>Validates State of the primary address is not null</li>
   *   <li>Validates ZIP of the primary address is not null</li>
   *   <li>Validates AddressType of the primary address is not null</li>
   * An error or warning displays on screen if the validation result contains any errors or warnings.
   */
  function primaryAddressRequiredFields() {
    paLine.PolicyDrivers.each(\ pd -> {
    
      var primaryAddress = pd.AccountContactRole.AccountContact.Contact.PrimaryAddress
      var addressOwner = new AddressInputSetAddressOwner(primaryAddress, false, true) //identical to the address owner used in the UI

      var invalidFields = AddressValidator.validateAddress(addressOwner)

      for (field in invalidFields) {
        Result.addError(paLine, "default", getErrorMessage(field), DRIVERS_WIZARD_STEP)
      }

      if (!primaryAddress.AddressType.Code.HasContent) {
        Result.addError(paLine, "default", displaykey.Web.Policy.PA.Validation.Address.AddressType, DRIVERS_WIZARD_STEP)
      }
    })   
  }

  private static function getErrorMessage(fieldName : String) : String {
    var fieldLabel = FieldLabels[fieldName]

    if (fieldLabel.HasContent) {
      return fieldLabel
    } else {
      throw new IllegalStateException("Please add a key value pair to PALineDriversValidator#FieldLabels for the field: " + fieldName)
    }

  }

  /**
   * PA Line Drivers' license State Matches Garage State Validation
   *
   * An error or warning displays on screen if the validation result contains any errors or warnings.
   */
  function licenseStateMatchesGarageState() {
    var currentState = paLine.BaseState
    var warnDrivers = paLine.PolicyDrivers
      .where(\ driver -> driver.LicenseState != null and driver.LicenseState != currentState and not(driver.Excluded))
    
    if (!warnDrivers.IsEmpty) {
      Result.addWarning(paLine, "default",
        displaykey.Web.Policy.PA.Validation.LicenseStateMisMatch (warnDrivers.map(\ driver -> driver.DisplayName).join(", "),
          warnDrivers.map(\ driver -> driver.LicenseState).join(", ") ,currentState), DRIVERS_WIZARD_STEP)
    }
  }

  // breaking this into two validations
  // Test 1   if qualifies is true 
  //            if (submission or policy change) and apply is not true
  //             warn
  // Test 2   if apply is true
  //            if submission, then error if not qualified
  //            if pol change, then warn if not qualified
  private function qualifiedGoodDriver() {
    if (typeAppliesTo(paLine.Branch.Job)) {
      var drivers = paLine.PolicyDrivers.where(\ p ->
            not p.Excluded and
            (p.AccountContactRole as Driver).GoodDriverDiscount != null and (p.AccountContactRole as Driver).GoodDriverDiscount
            and not p.hasGoodDriverDiscount)
      if (drivers.Count > 0) {
        var msg = drivers.map(\ d -> d.DisplayName).join(", ")
        Result.addWarning(paLine, "default", displaykey.Web.Policy.PA.Validation.PossibleMissDriverDiscount(msg), DRIVERS_WIZARD_STEP)
      }
    }
  }

  private function appliedGoodDriverDiscount() {
    var job = paLine.Branch.Job
    if (typeAppliesTo(job)) {
      var drivers = paLine.PolicyDrivers.where(\ p ->
            not p.Excluded and
            p.hasGoodDriverDiscount
            and ((p.AccountContactRole as Driver).GoodDriverDiscount == null or 
            not (p.AccountContactRole as Driver).GoodDriverDiscount))
      if (drivers.Count > 0) {
        var msg = drivers.map(\ d -> d.DisplayName).join(", ")
        if (job.Subtype == "PolicyChange") {
          Result.addWarning(paLine, "default", displaykey.Web.Policy.PA.Validation.AppliedDriverDiscountWarning(msg), DRIVERS_WIZARD_STEP)
        } else {
          Result.addError(paLine, "default", displaykey.Web.Policy.PA.Validation.AppliedDriverDiscountError(msg), DRIVERS_WIZARD_STEP)
        }
      }
    }
  }

  private function licenseInfoRequired() {
    if (paLine.PolicyDrivers.hasMatch(\ pd -> (pd.LicenseNumber == null or pd.LicenseState == null) and not (pd.Excluded))) {
      Result.addError(paLine, "default",
        displaykey.Web.Policy.PA.Validation.LicenseNumberAndStateRequired, DRIVERS_WIZARD_STEP)
    }
  }

  private function licenseNumberUnique() {
    for (driver in paLine.PolicyDrivers) {
      if (paLine.PolicyDrivers.hasMatch(\ pd -> pd != driver and pd.LicenseNumber == driver.LicenseNumber and pd.LicenseState == driver.LicenseState and not (pd.Excluded or driver.Excluded))) {
        Result.addError(paLine, "default", displaykey.Web.Policy.PA.Validation.LicenseNumberUnique, DRIVERS_WIZARD_STEP)
      }
    }
  }

  private function accountDriverNumberOfIncidents(){
    //The warning should be displayed only when the policy is quoted if not all account level number of accidents and violations are set.  
    if(super.Level == typekey.ValidationLevel.TC_QUOTABLE){
      for (driver in paLine.PolicyDrivers.where(\ d -> not d.Excluded)) {
        var accountDriver = driver.AccountContactRole.AccountContact.getRole(typekey.AccountContactRole.TC_DRIVER) as Driver
        if(accountDriver.NumberofAccidents == null or accountDriver.NumberofViolations == null){
          Result.addWarning(paLine, typekey.ValidationLevel.TC_QUOTABLE, displaykey.Web.Policy.PA.Validation.AccountAccidentsAndViolationsMissing, DRIVERS_WIZARD_STEP)
          break
        }
      }
    }
  }  

  private function verifyAndOrderMVRs() {
    PCLoggerCategory.PRODUCT_MODEL.debug("begin verifyAndOrderMVRs")
    if(Level == ValidationLevel.TC_BINDABLE or Level == ValidationLevel.TC_READYFORISSUE){
      var mvrWorkflow = paLine.Branch.Workflows.whereTypeIs(ProcessMVRsWF).firstWhere(\ w -> w.CurrentStep == "BeforeOrder")
      PCLoggerCategory.PRODUCT_MODEL.debug("Number of mvrWorkflows: " + paLine.Branch.Workflows.whereTypeIs(ProcessMVRsWF).length)
      if(mvrWorkflow <> null){
        var synchronousWait = true
        PCLoggerCategory.PRODUCT_MODEL.debug("begin initiateMVRRequest")
        mvrWorkflow.initiateMVRRequest(synchronousWait)            
        PCLoggerCategory.PRODUCT_MODEL.debug("done initiateMVRRequest")   
             
        mvrWorkflow.Bundle.commit() //workflow bundle and current bundle are the same.  It is committed
        if(mvrWorkflow.State <> WorkflowState.TC_COMPLETED){
          Result.addError(paLine, Level, displaykey.Web.Policy.PA.Validation.MVRNotReceived, DRIVERS_WIZARD_STEP)
        }else{
          paLine.Branch.mergeDuplicateAdds()
        }
      }
    }
    PCLoggerCategory.PRODUCT_MODEL.debug("done verifyAndOrderMVRs")
  }
  
  private function verifyBirthDateAndIncidents() {
    if(Context.isAtLeast(ValidationLevel.TC_QUICKQUOTABLE)){
      var noBirthDate = false
      var noIncidents = false
      for (driver in paLine.PolicyDrivers.where(\ d -> not d.Excluded)) {
        if (driver.DateOfBirth == null) {
          noBirthDate = true
        }
        if(driver.NumberOfAccidents == null or driver.NumberOfViolations == null){
          noIncidents = true
          if(noBirthDate) break  //don't need to continue looping since both warnings are necessary
        }
      }
      if(noBirthDate){
        Result.addError(paLine, Level, displaykey.Web.Policy.PA.Validation.DateOfBirthRequired, DRIVERS_WIZARD_STEP)
      }
      if(noIncidents){
        Result.addError(paLine, Level, displaykey.Web.Policy.PA.Validation.PolicyAccidentsAndViolationsRequired, DRIVERS_WIZARD_STEP)
      }
    }
  }

  private static final var APPLICABLE_JOB_TYPES : String[] = {
    typekey.Job.TC_SUBMISSION.Code,
    typekey.Job.TC_POLICYCHANGE.Code,
    typekey.Job.TC_RENEWAL.Code,
    typekey.Job.TC_REWRITE.Code,
    typekey.Job.TC_REWRITENEWACCOUNT.Code
  }
  private function typeAppliesTo(job : Job) : boolean {
    return APPLICABLE_JOB_TYPES.contains(job.Subtype.Code)
  }

  override function validateLineForAudit() {
    throw new UnsupportedOperationException(displaykey.Validator.UnsupportedAuditLineError)
  }

}
