package gw.lob.pa
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses java.lang.UnsupportedOperationException

@Export
class PALineCoveragesValidator extends PolicyLineValidation<entity.PersonalAutoLine> {

  private static final var COVERAGES_WIZARD_STEP = "PALine"
  
  property get paLine() : entity.PersonalAutoLine { return Line }
  
  construct(valContext : PCValidationContext, policyLine : entity.PersonalAutoLine) {
    super(valContext, policyLine)
  }

  /**
   * Validate the PA Line Coverages.
   *
   * Checks the following:
   * <ul>
   *   <li>Uninsured Motorist limits are valid</li>
   *   <li>Uninsured Motorist requirements are met</li>
   *   <li>Under Uninsured Motorist limits</li>
   *   <li>Coverages are mutually exclusive.</li>
   * </ul>
   */
  override function doValidate() {
    uninsuredMotoristLimits()
    uninsuredMotoristRequired()
    underInsuredMotoristLimits()
    mutuallyExclusiveCoverages()
  }

  private function mutuallyExclusiveCoverages() {
    Context.addToVisited(this, "mutuallyExclusiveCoverages")
    for (vehicle in paLine.Vehicles) {   
      if (vehicle.PACollisionCov.PACollisionBroadTerm.Value) {
        if (vehicle.PACollision_MA_MI_LimitedExists) {
          Result.addError(vehicle, "default", displaykey.Web.Policy.PA.Validation.MutuallyExclusiveCollisionCov(vehicle.DisplayName), COVERAGES_WIZARD_STEP)
        }
      }
    }
  }
  
  private function uninsuredMotoristLimits() {
    if (not paLine.PAUMBICovExists and not paLine.PAUMPDCovExists) {
      return
    }

    //Uninsured Motorists limits cannot exceed Liability Limits
    var liabPackValue = paLine.PALiabilityCov.PALiabilityTerm.PackageValue
    var liabPerPersonBI = 0
    var liabPerAccidentBI = 0
    var liabPerAccidentPD = 0
    var umPerPersonBI = 0
    var umPerAccidentBI = 0
    var umPerAccidentPD = 0

    if (liabPackValue.PackageTerms.Count == 3) {
      liabPerPersonBI = liabPackValue.PackageTerms.firstWhere(\ p -> p.AggregationModel == "pp" and p.RestrictionModel == "bi").Value as int
      liabPerAccidentBI = liabPackValue.PackageTerms.firstWhere(\ p -> p.AggregationModel == "ea" and p.RestrictionModel == "bi").Value as int
      liabPerAccidentPD = liabPackValue.PackageTerms.firstWhere(\ p -> p.AggregationModel == "ea" and p.RestrictionModel == "pd").Value as int
    } else {
      liabPerPersonBI = liabPackValue.PackageTerms[0].Value as java.lang.Integer
      liabPerAccidentBI = liabPackValue.PackageTerms[0].Value as java.lang.Integer
      liabPerAccidentPD = liabPackValue.PackageTerms[0].Value as java.lang.Integer
    }
    if (paLine.PAUMBICovExists) {
      if (paLine.PAUMBICov.PAUMBITerm.PackageValue.PackageTerms.Count > 1){
        umPerPersonBI = paLine.PAUMBICov.PAUMBITerm.PackageValue.PackageTerms.firstWhere(\ p -> p.AggregationModel == "pp" and p.RestrictionModel == "bi").Value as int
        umPerAccidentBI = paLine.PAUMBICov.PAUMBITerm.PackageValue.PackageTerms.firstWhere(\ p -> p.AggregationModel == "ea" and p.RestrictionModel == "bi").Value as int
      } else {
        umPerPersonBI = paLine.PAUMBICov.PAUMBITerm.PackageValue.PackageTerms[0].Value as java.lang.Integer
        umPerAccidentBI = paLine.PAUMBICov.PAUMBITerm.PackageValue.PackageTerms[0].Value as java.lang.Integer
      }
    }
    if (paLine.PAUMPDCovExists ) {
      umPerAccidentPD = paLine.PAUMPDCov.PAUMPDLimitTerm.Value as java.lang.Integer
    }

    if (umPerPersonBI > liabPerPersonBI or umPerAccidentBI > liabPerAccidentBI or umPerAccidentPD > liabPerAccidentPD) {
      Result.addError(paLine, ValidationLevel.TC_DEFAULT,
        displaykey.Web.Policy.PA.Validation.UninsuredMotoristLimits, COVERAGES_WIZARD_STEP)
    }
  }

  private function uninsuredMotoristRequired() {
    if ((paLine.BaseState == "MA" or paLine.BaseState == "NY") and not paLine.PAUMBICovExists) {
      Result.addError(paLine, ValidationLevel.TC_DEFAULT,
        displaykey.Web.Policy.PA.Validation.UninsuredMotoristsRequiredInState, COVERAGES_WIZARD_STEP)
    }
  }

  private function underInsuredMotoristLimits() {
    if (not paLine.PAUIMBICovExists) {
      return
    }

    //Cannot select under insured w/o Uninsured
    if (paLine.PAUIMBICovExists and not paLine.PAUMBICovExists) {
      Result.addError(paLine, ValidationLevel.TC_DEFAULT,
        displaykey.Web.Policy.PA.Validation.UnderInsuredMotoristRequiresUninsured, COVERAGES_WIZARD_STEP)
    }

    //Underinsured limits cannot exceed Uninsured limits
    var uimPerPersonBI = 0
    var uimPerAccidentBI = 0
    var umPerPersonBI = 0
    var umPerAccidentBI = 0

    if (paLine.PAUIMBICov.PAUIMBITerm.PackageValue.PackageTerms.Count == 2) {
      uimPerPersonBI = paLine.PAUIMBICov.PAUIMBITerm.PackageValue.PackageTerms.firstWhere(\ p -> p.AggregationModel == "pp" and p.RestrictionModel == "bi").Value as int
      uimPerAccidentBI = paLine.PAUIMBICov.PAUIMBITerm.PackageValue.PackageTerms.firstWhere(\ p -> p.AggregationModel == "ea" and p.RestrictionModel == "bi").Value as int
    } else {
      uimPerPersonBI = paLine.PAUIMBICov.PAUIMBITerm.PackageValue.PackageTerms[0].Value as java.lang.Integer
      uimPerAccidentBI = paLine.PAUIMBICov.PAUIMBITerm.PackageValue.PackageTerms[0].Value as java.lang.Integer
    }
    if (paLine.PAUMBICovExists) {
      if (paLine.PAUMBICov.PAUMBITerm.PackageValue.PackageTerms.Count > 1){
        umPerPersonBI = paLine.PAUMBICov.PAUMBITerm.PackageValue.PackageTerms.firstWhere(\ p -> p.AggregationModel == "pp" and p.RestrictionModel == "bi").Value as int
        umPerAccidentBI = paLine.PAUMBICov.PAUMBITerm.PackageValue.PackageTerms.firstWhere(\ p -> p.AggregationModel == "ea" and p.RestrictionModel == "bi").Value as int
      } else {
        umPerPersonBI = paLine.PAUMBICov.PAUMBITerm.PackageValue.PackageTerms[0].Value as java.lang.Integer
        umPerAccidentBI = paLine.PAUMBICov.PAUMBITerm.PackageValue.PackageTerms[0].Value as java.lang.Integer
      }
    }

    if (uimPerPersonBI > umPerPersonBI or uimPerAccidentBI > umPerAccidentBI) {
      Result.addError(paLine, ValidationLevel.TC_DEFAULT,
        displaykey.Web.Policy.PA.Validation.UnderInsuredLimitsNotToExceedUninsured, COVERAGES_WIZARD_STEP)
    }
  }

  override function validateLineForAudit() {
    throw new UnsupportedOperationException(displaykey.Validator.UnsupportedAuditLineError)
  }

}
