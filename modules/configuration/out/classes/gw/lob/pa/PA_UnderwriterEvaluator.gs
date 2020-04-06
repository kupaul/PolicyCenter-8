package gw.lob.pa

uses gw.lang.reflect.IType
uses gw.lob.common.AbstractUnderwriterEvaluator
uses gw.policy.PolicyEvalContext

uses java.util.Set
uses gw.pl.currency.MonetaryAmount
uses gw.api.util.CurrencyUtil

@Export
class PA_UnderwriterEvaluator extends AbstractUnderwriterEvaluator {

  construct(policyEvalContext : PolicyEvalContext) {
    super(policyEvalContext)
  }

  override function canEvaluate() : boolean {
    var allowedJobs : Set<IType> = {Submission, PolicyChange, Reinstatement, Renewal, Rewrite, Issuance, RewriteNewAccount}
    return allowedJobs.contains(typeof(_policyEvalContext.Period.Job))
  }

  override function onPrequote() {
    fiveOrMoreVehicles()
    vehicleVINBeginsWithFRE()
    zipOfPrimaryGaraging()
    otherVehicleType()
    otherNonMotorcycleVehicle()
    highValueVehicle()
    collisionDeductible()
    comprehensiveDeductible()
    goodDriverDiscountDocumentation()
    anyDriverUnder25()
    primaryDriverUnder25()
    goodDriverDiscountQualified()
    stateOfGaraging()
    excludedDriver()
    producerChanged()
  }

  override function onDefault() {
    beforeQuoteReleaseTotalPremium()
    mVRAccidentsAndViolations()
  }

  private function fiveOrMoreVehicles() {
    if(_policyEvalContext.Period.PersonalAutoLine.Vehicles.length >= 5){
      var numberOfVehicles = _policyEvalContext.Period.PersonalAutoLine.Vehicles.length
      var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.TooManyVehicles.ShortDesc
      var longDescription = \ -> displaykey.UWIssue.PersonalAuto.TooManyVehicles.LongDesc(numberOfVehicles)
      _policyEvalContext.addIssue("PANumberOfVehicles", "PANumberOfVehicles",
          shortDescription, longDescription, numberOfVehicles)
    }
  }

  private function vehicleVINBeginsWithFRE() {
    for (v in _policyEvalContext.Period.PersonalAutoLine.Vehicles) {
      if (v.Vin != null && v.Vin.startsWithIgnoreCase( "FRE" )) {
        var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.Ferrari.ShortDesc
        var longDescription = \ -> displaykey.UWIssue.PersonalAuto.Ferrari.LongDesc(v.Vin)
        _policyEvalContext.addIssue("PAVINStartsWithFRE", "Vehicle:${v.FixedId.toString()}",
           shortDescription, longDescription)
      }
    }
  }

  private function zipOfPrimaryGaraging() {
    var primaryAddress = _policyEvalContext.Period.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact.PrimaryAddress
    var primaryAddressZip = primaryAddress.PostalCode.split("-").first()
    var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.GarageZip.ShortDesc
    for (v in _policyEvalContext.Period.PersonalAutoLine.Vehicles) {
      if (v.GarageLocation.PostalCode == null) {
        var longDescription = \ -> displaykey.UWIssue.PersonalAuto.GarageZip.LongDesc(v, v.GarageLocation.PostalCode, primaryAddress.PostalCode)
        _policyEvalContext.addIssue("PAGaragingZip", "Vehicle:${v.FixedId.toString()}",
            shortDescription, longDescription)
      } else {
        var garageLocationZip = v.GarageLocation.PostalCode.split("-").first()
        if (garageLocationZip != primaryAddressZip) {
          var longDescription =
            \ -> displaykey.UWIssue.PersonalAuto.GarageZip.LongDesc(v,
                  v.GarageLocation.PostalCode,
                  primaryAddress.PostalCode)
          _policyEvalContext.addIssue("PAGaragingZip", "Vehicle:${v.FixedId.toString()}",
              shortDescription, longDescription)
        }
      }
    }
  }

  private function otherVehicleType() {
    for (v in _policyEvalContext.Period.PersonalAutoLine.Vehicles) {
      if (v.VehicleType == "Other") {
        var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.OtherVehicle.ShortDesc
        var longDescription = \ -> displaykey.UWIssue.PersonalAuto.OtherVehicle.LongDesc(v)
        _policyEvalContext.addIssue("PAOtherVehicleType", "Vehicle:${v.FixedId.toString()}",
          shortDescription, longDescription)
      }
    }
  }

  private function otherNonMotorcycleVehicle() {
    for (v in _policyEvalContext.Period.PersonalAutoLine.Vehicles) {
      if (v.VehicleType == "Other" and v.BodyType != "Motorcycle") {
        var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.NonMotorcycle.ShortDesc
        var longDescription = \ -> displaykey.UWIssue.PersonalAuto.NonMotorcycle.LongDesc(v)
        _policyEvalContext.addIssue("PAOtherVehicleTypeNonMotorcycle", "Vehicle:${v.FixedId.toString()}",
          shortDescription, longDescription)
      }
    }
  }

  private function highValueVehicle() {
    for (v in _policyEvalContext.Period.PersonalAutoLine.Vehicles) {
      if (v.CostNew.Amount > 100000bd) {
        var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.HighValueVehicle.ShortDesc
        var longDescription = \ -> displaykey.UWIssue.PersonalAuto.HighValueVehicle.LongDesc(v, CurrencyUtil.renderAsCurrency(v.CostNew))
        _policyEvalContext.addIssue("PAHighValueAuto", "Vehicle:${v.FixedId.toString()}",
            shortDescription, longDescription, v.CostNew)
      }
    }
  }

  private function collisionDeductible() {
    for (v in _policyEvalContext.Period.PersonalAutoLine.Vehicles) {
      var deductibleAmount = v.PACollisionCov.PACollDeductibleTerm.OptionValue.Value
      if (deductibleAmount != null) {
        var deductible = new MonetaryAmount(deductibleAmount, v.PACollisionCov.Currency)
        var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.CollisionDeductible.ShortDesc
        var longDescription = \ -> displaykey.UWIssue.PersonalAuto.CollisionDeductible.LongDesc(v, CurrencyUtil.renderAsCurrency(deductible))
        _policyEvalContext.addIssue("PACollisionDeductible", "Vehicle:${v.FixedId.toString()}",
            shortDescription, longDescription, deductible)
      }
    }
  }

  private function comprehensiveDeductible() {
    for (v in _policyEvalContext.Period.PersonalAutoLine.Vehicles) {
      var deductibleAmount = v.PAComprehensiveCov.PACompDeductibleTerm.OptionValue.Value
      if (deductibleAmount != null) {
        var deductible = new MonetaryAmount(deductibleAmount, v.PAComprehensiveCov.Currency)
        var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.ComprehensiveDeductible.ShortDesc
        var longDescription = \ -> displaykey.UWIssue.PersonalAuto.ComprehensiveDeductible.LongDesc(v, CurrencyUtil.renderAsCurrency(deductible))
        _policyEvalContext.addIssue("PACompDeductible", "Vehicle:${v.FixedId.toString()}",
            shortDescription, longDescription, deductible)
      }
    }
  }

  private function goodDriverDiscountDocumentation() {
    var goodDrivers = _policyEvalContext.Period.PersonalAutoLine.PolicyDrivers
        .where(\ driver -> driver.ApplicableGoodDriverDiscount
        and not driver.Excluded)
    for (d in goodDrivers) {
      var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.GoodDriverDoc.ShortDesc
      var longDescription = \ -> displaykey.UWIssue.PersonalAuto.GoodDriverDoc.LongDesc(d.FirstName, d.LastName)
      _policyEvalContext.addIssue("PAGoodDriverDiscountEvidence",
          "Driver:${d.FixedId.toString()}", shortDescription, longDescription)
    }
  }

  private function anyDriverUnder25() {
    _policyEvalContext.Period.PersonalAutoLine.PolicyDrivers.where(\ pd -> not pd.Excluded)
        .each(\ driver -> {
            if (driver.DateOfBirth != null) {
              var age = driver.Age
              if (age < 25) {
                var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.AnyDriverUnder25.ShortDesc
                var longDescription = \ ->displaykey.UWIssue.PersonalAuto.AnyDriverUnder25.LongDesc(driver.DisplayName, age)
                _policyEvalContext.addIssue("PADriverUnder25", "Driver:${driver.FixedId.toString()}",
                    shortDescription, longDescription, age)
              }
            }
         })
  }

  private function primaryDriverUnder25() {
    _policyEvalContext.Period.PersonalAutoLine.Vehicles.each(\ vehicle -> {
      var driver = vehicle.PrimaryDriver.PolicyDriver
      if (driver.DateOfBirth != null and driver.Age < 25) {
        var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.PrimaryDriverUnder25.ShortDesc
        var longDescription = \ -> displaykey.UWIssue.PersonalAuto.PrimaryDriverUnder25.LongDesc(driver.DisplayName, driver.Age)
        _policyEvalContext.addIssue("PAPrimaryDriverUnder25", "Driver:${driver.FixedId.toString()}",
           shortDescription, longDescription, driver.Age)
      }
    })
  }

  private function goodDriverDiscountQualified() {
    var qualifiedButNotAppliedGoodDrivers = _policyEvalContext.Period.PersonalAutoLine.PolicyDrivers
        .where(\ driver -> !driver.ApplicableGoodDriverDiscount
                            and (driver.AccountContactRole.AccountContact.getRole("Driver") as Driver).GoodDriverDiscount
                            and not driver.Excluded)

    for (d in qualifiedButNotAppliedGoodDrivers) {
      var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.GoodDriverQualified.ShortDesc
      var longDescription = \ -> displaykey.UWIssue.PersonalAuto.GoodDriverQualified.LongDesc(d.FirstName, d.LastName)
      _policyEvalContext.addIssue("PAUnappliedGoodDriverDiscount",
          "Driver:${d.FixedId.toString()}",
            shortDescription, longDescription)
    }
  }

  private function stateOfGaraging() {
    var vehicles = _policyEvalContext.Period.PersonalAutoLine.Vehicles
    for (v in vehicles) {
      var state = v.AccountLocation.State
      var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.GarageState.ShortDesc
      var longDescription = \ -> displaykey.UWIssue.PersonalAuto.GarageState.LongDesc(v, state)
      _policyEvalContext.addIssue("PAGarageState", "Vehicle:${v.FixedId.toString()}",
          shortDescription, longDescription, state)
    }
  }

  private function excludedDriver() {
    _policyEvalContext.Period.PersonalAutoLine.PolicyDrivers.where(\ d -> d.Excluded)
      .each(\ driver -> {
        var shortDescription = displaykey.UWIssue.PersonalAuto.ExcludedDriver.ShortDesc
        var longDescription = displaykey.UWIssue.PersonalAuto.ExcludedDriver.LongDesc(driver.DisplayName)
        _policyEvalContext.addIssue("PAExcludedDriver", "Driver:${driver.FixedId.toString()}", \ -> shortDescription, \ ->longDescription)
    })
  }

  private function beforeQuoteReleaseTotalPremium() {
    if(_policyEvalContext.CheckingSet == UWIssueCheckingSet.TC_PREQUOTERELEASE) {
      var totalPremium = _policyEvalContext.Period.TotalPremiumRPT
      var shortDescription = \ -> displaykey.UWIssue.PersonalAuto.TotalPremium.ShortDesc
      var longDescription = \ -> displaykey.UWIssue.PersonalAuto.TotalPremium.LongDesc(CurrencyUtil.renderAsCurrency(totalPremium))
      _policyEvalContext.addIssue("PATotalPremium", "PATotalPremium", shortDescription, longDescription, totalPremium)
    }
  }

  private function mVRAccidentsAndViolations() {
    if(_policyEvalContext.CheckingSet == UWIssueCheckingSet.TC_MVR) {
      var policyDrivers = _policyEvalContext.Period.PersonalAutoLine.PolicyDrivers.where(\ p -> p.DoNotOrderMVR == false)
      for(policyDriver in policyDrivers){
        var pdMVR = policyDriver.PolicyDriverMVR
        if(pdMVR == null and !_policyEvalContext.Period.EditLocked) continue
        /*            Accidents           */
        //check if the number of accidents are different
          //the policyDriver.NumberOfAccidents typekey goes up to "5 or more"
        var pdNumOfAcc =  policyDriver.NumberOfAccidents == null ? 0 : java.lang.Integer.parseInt(policyDriver.NumberOfAccidents.Code)
        var pdMVRNumOfAcc = pdMVR == null ? 0 : pdMVR.getAccidentsToCompareToTypeKey()
        var accidentsDifference = pdMVRNumOfAcc - pdNumOfAcc
        /*            Violations           */
        //check if the number of violations are different
        //the policyDriver.NumberOfAccidents typekey goes up to "5 or more"
        var pdNumOfVio = policyDriver.NumberOfViolations == null ? 0 : java.lang.Integer.parseInt(policyDriver.NumberOfViolations.Code)
        //since the policyDriver.NumberOfAccidents is restricted to 5 as a maximum, need to restrict the policyDriverMVR.NumberOfViolations as well
        var pdMVRNumOfVio = pdMVR == null ? 0 : pdMVR.getViolationsToCompareToTypeKey()
        var violationsDifference = pdMVRNumOfVio - pdNumOfVio

        /*
         * if either accidents or violations differ between what is on the policy driver and the policy driver mvr entities then an
         * then an UW issue should be raised
         */
        if(accidentsDifference <> 0 or violationsDifference <> 0){
          var shortDescription = displaykey.UWIssue.PersonalAuto.PAMVRAccidentsViolations.shortDesc
          accidentsDifference = java.lang.Math.abs(accidentsDifference)
          violationsDifference = java.lang.Math.abs(violationsDifference)
          var longDescription = displaykey.UWIssue.PersonalAuto.PAMVRAccidentsViolations.longDesc(policyDriver.DisplayName, accidentsDifference, violationsDifference)
          _policyEvalContext.addIssue("PAMVRAccidentsViolations", "Driver:${policyDriver.FixedId.toString()}", \ -> shortDescription, \ ->longDescription)
        }
      }
    }
  }
}
