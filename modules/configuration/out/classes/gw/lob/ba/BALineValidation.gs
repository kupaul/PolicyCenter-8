package gw.lob.ba

uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses gw.policy.PolicyAddlInsuredAndTypeUniqueValidation
uses java.lang.UnsupportedOperationException

/**
 * Validation for the {@link entity.BusinessAutoLine}.
 *
 * This validation includes the following checks:
 * <ul>
 *   <li>Additional Insureds have unique types</li>
 * </ul>
 */
@Export
class BALineValidation extends PolicyLineValidation<entity.BusinessAutoLine> {

  /**
   * @return the {@link entity.BusinessAutoLine} that validation is being run against
   */
  property get baLine() : entity.BusinessAutoLine { return Line }

  construct(valContext : PCValidationContext, polLine : entity.BusinessAutoLine) {
    super(valContext, polLine)
  }

  /**
   * Perform several validation tests for BALines.  Specifically:
   * * <ul>
   *   <li>Additional Insured and Type are unique</li>
   *   <li>VIN is unique</li>
   *   <li>Fleet Type matches Vehicle Info</li>
   *   <li>Liability coverage is valid</li>
   *   <li>Has at least one hired auto state</li>
   *   <li>Has at least one nonowned state</li>
   *   <li>Nonowned basis sums to be greater than zero</li>
   * </ul>
   */
  override function doValidate() {
    // perform validation for BA Line
    additionalInsuredAndTypeUnique()
    vinIsUnique()
    fleetTypeMatchesVehicleInfo()
    checkLiabilityCoverage()
    atLeastOneHiredAutoState()
    atLeastOneNonownedState()
    nonOwnedBasisSumGreaterThanZero()
    
    // chain validation to owned entities
    baLine.Vehicles.each( \ vehicle -> new BusinessVehicleValidation(Context, vehicle).validate() )
  }  

  /**************************************************************************************
   * Vehicles Step Validations
   **************************************************************************************/  

  /**
   * Provide a validation error if any of the following conditions are not met:
   * <ul>
   *   <li>Validate that the line with 10 or more vehicles, it is marked as "Fleet" and a line with less than ten is marked as "NonFleet"</li>
   *   <li>The fleet property is set on the line</li>
   *   <li>each vehicle has a valid class code</li>
   * </ul>
   */
  function fleetTypeMatchesVehicleInfo() {
    Context.addToVisited( this, "fleetTypeMatchesVehicleInfo" )    
    if (Context.isAtLeast("quotable")) {
      if (baLine.Fleet == null) {
        Result.addError(baLine, "quotable", displaykey.Web.Policy.BA.Validation.fleetType, "PolicyInfo")
      } else if (baLine.Fleet == "Fleet" and baLine.Vehicles.Count < 10 or
                 baLine.Fleet == "NonFleet" and baLine.Vehicles.Count >= 10) {
        Result.addError(baLine, "quotable", displaykey.Web.Policy.BA.Validation.NumberOfVehicles(baLine.Fleet.DisplayName, baLine.Vehicles.Count), "BusinessVehicles")
      } else {
        for (vehicle in baLine.Vehicles) {
          if (vehicle.validateVehicleClassCode() != null ) {
            Result.addError(baLine, "quotable", displaykey.Web.Policy.BA.Validation.ClassCode(vehicle.VehicleClassCode, vehicle.DisplayName, baLine.Fleet), "BusinessVehicles")
          }
        }
      }
    }
  }  
  
  private function additionalInsuredAndTypeUnique() {
    Context.addToVisited( this, "additionalInsuredAndTypeUnique" )
    for (var addlInsured in baLine.AdditionalInsureds) {
      new PolicyAddlInsuredAndTypeUniqueValidation(Context, addlInsured).validate()
    }
  }

  /**
   * Validate that each vehicle has a unique vin number within the policy
   */
  function vinIsUnique() {
    Context.addToVisited( this, "vinIsUnique" )
    //Vin numbers must be uniqu within a policy period
    for (vehicle in baLine.Vehicles) {
      var matches = baLine.Vehicles.countWhere( \ veh -> veh.Vin == vehicle.Vin)
      if (matches > 1) {
        Result.addError( baLine, "default", displaykey.Web.Policy.BA.Validation.VinNumbers )
      }
    }
  }
  
  /**************************************************************************************
   * Commercial Auto Step Validations
   **************************************************************************************/

  /**
   * Validate at least one of the hired auto coverages exists if a jurisdiction has HiredAutoCoveragesSelected
   */
  function atLeastOneHiredAutoState() {
    Context.addToVisited( this, "atLeastOneHiredAutoState" ) 
    var hasHiredAutoCovJuris = baLine.Jurisdictions.hasMatch(\ j -> j.HiredAutoCoverageSelected)
    if (baLine.BAHiredCollisionCovExists or baLine.BAHiredCompCovExists or baLine.BAHiredLiabilityCovExists or
        baLine.BAHiredSpecPerilCovExists or baLine.BAHiredUIMCovExists or baLine.BAHiredUMCovExists) {
      if (hasHiredAutoCovJuris == false) {
        Result.addError(baLine, "default", displaykey.Web.Policy.BA.Validation.AtLeastOneHiredAutoState, "baLineStep")
      }
    } else if (hasHiredAutoCovJuris) {
      Result.addError(baLine, "default", displaykey.Web.Policy.BA.Validation.AtLeastOneHiredAutoCov, "baLineStep")
    } 
  }

  /**
   * Validate the non-owned liability coverage exists if the Non-Owned Coverage is true on one of the jurisdictions.
   */
  function atLeastOneNonownedState() {
    Context.addToVisited( this, "atLeastOneNonownedState" ) 
    var hasNonownedCovJuris = baLine.Jurisdictions.hasMatch(\ j -> j.NonOwnedCoverageSelected)
    if (baLine.BANonownedLiabCovExists) {
      if (hasNonownedCovJuris == false) {
        Result.addError(baLine, "default", displaykey.Web.Policy.BA.Validation.AtLeastOneNonownedState, "baLineStep")
      }
    } else if (hasNonownedCovJuris) {
      Result.addError(baLine, "default", displaykey.Web.Policy.BA.Validation.AtLeastOneNonownedCov, "baLineStep")
    }
  }


  /**
   * Validate that for each jurisdiction where Non-Owned Coverage is true, the non-owned basis total is greater than 0
   */
  function nonOwnedBasisSumGreaterThanZero() {
    Context.addToVisited( this, "nonOwnedBasisSumGreaterThanZero" )
    var nonOwnedJuris =  baLine.Jurisdictions.where(\ j -> j.NonOwnedCoverageSelected)
    for (juris in nonOwnedJuris) {
      var numEmp = juris.NonOwnedBasis.NumEmployees as int
      var numPart = juris.NonOwnedBasis.NumPartners as int
      var numVol = juris.NonOwnedBasis.NumVolunteers as int
      var sum = numEmp + numPart + numVol
      if (sum <= 0) {
        Result.addError(baLine, "default", displaykey.Web.Policy.BA.Validation.NonOwnedBasisSumGreaterThanZero, "baLineStep")
      }
    }
  }

  /**
   * Validate that the liability coverage exists if there is at least one vehicle.
   * Validate that if BA Owned Liability Coverage Exists it is for an available package
   */
  function checkLiabilityCoverage() {
    Context.addToVisited( this, "checkLiabilityCoverage" ) 
    // liab is now a line coverage
    if (!baLine.BAOwnedLiabilityCovExists and baLine.Vehicles.Count > 0) {
      Result.addError(baLine, "quotable", displaykey.Web.Policy.BA.Validation.LiabilityRequired )
    }
    if (baLine.BAOwnedLiabilityCovExists) {
      var thepackage = baLine.BAOwnedLiabilityCov.BAOwnedLiabilityLimitTerm.PackageValue.PackageCode
      if (!baLine.isPackageAvailable(thepackage)) {
        Result.addError(baLine, "quotable", displaykey.Web.Policy.BA.Validation.LiabilityPackageInvalid(thepackage))          
      }
    }
  } 
   
  /**************************************************************************************
   * Validating Job Steps
   **************************************************************************************/

  /**
   * Perform validations for the Vehicles Wizard Step:
   * <ul>
   *   <li>vin numbers are unique</li>
   *   <li>fleet types are correct</li>
   * </ul>
   * @see #vinIsUnique()
   * @see #fleetTypeMatchesVehicleInfo()
   */
  static function validateVehiclesStep(baLine : BusinessAutoLine) {
    PCValidationContext.doPageLevelValidation( \ context -> {
      var validator = new BALineValidation(context, baLine)
      validator.vinIsUnique()
      validator.fleetTypeMatchesVehicleInfo()
    })
  }

  /**
   * Perform validations for the Policy Contacts Step: additional insureds are unique
   * @see #additionalInsuredAndTypeUnique()
   */
  static function validatePolicyContacts(line : BusinessAutoLine) {
    PCValidationContext.doPageLevelValidation( \ context -> new BALineValidation(context, line).additionalInsuredAndTypeUnique())
  }

  /**
   * Perform validations for the Commercial Auto Step:
   * <ul>
   *   <li>at least one hired auto state</li>
   *   <li>at least one non-owned state</li>
   *   <li>the non-woend basis sum is greater than 0</li>
   *   <li>additional insured types are unique</li>
   * </ul>
   * @see #atLeastOneHiredAutoState()
   * @see #atLeastOneNonownedState()
   * @see #nonOwnedBasisSumGreaterThanZero()
   */
  static function validateCommercialAutoStep(baLine : BusinessAutoLine) {
    PCValidationContext.doPageLevelValidation(\ context -> {
      var validator = new BALineValidation(context, baLine)
      validator.atLeastOneHiredAutoState()
      validator.atLeastOneNonownedState()
      validator.nonOwnedBasisSumGreaterThanZero()
      
      for (policyAddlInsured in baLine.AdditionalInsureds) {     
        var addlInsuredValidator = new gw.policy.PolicyAddlInsuredAndTypeUniqueValidation(context, policyAddlInsured)
        addlInsuredValidator.validate()
      }
    })
  }

  /**
   * Validation for Audit is not supported
   * throw an {@link java.lang.UnsupportedOperationException UnsupportedOperationException}.
   */
  override function validateLineForAudit() {
    throw new UnsupportedOperationException(displaykey.Validator.UnsupportedAuditLineError)
  }

}
