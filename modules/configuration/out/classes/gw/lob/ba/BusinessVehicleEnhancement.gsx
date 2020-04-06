package gw.lob.ba

uses gw.api.domain.BusinessVehicleClassCodeSearch
uses gw.api.domain.VehicleClassCodeSearchCriteria
uses gw.api.domain.VehicleClassCodeSearchResult
uses gw.api.match.MatchableKey
uses gw.api.util.JurisdictionMappingUtil
uses gw.plugin.Plugins
uses gw.plugin.vin.IVinPlugin

uses java.lang.Exception

/**
 * Enhancement methods for {@link entity.BusinessVehicle}
 */
enhancement BusinessVehicleEnhancement : BusinessVehicle {

 /**
  * Update the state value for modifiers to make sure the mod state is correct and to prevent null constraint
  */
  function updateStateValueForModifiers() {
    var state = JurisdictionMappingUtil.getJurisdiction(this.Location)
    for (mod in this.BusinessVehicleModifiers) {
      mod.State = state
    }
  }
  
  /**
   * Makes a copy of the Vehicle, with its coverages and modifiers
   * @return BusinessVehicle - return copied vehicle
   */
  function cloneVehicleAndCoveragesAndModifiers() : BusinessVehicle {
    var newVehicle = this.copy() as BusinessVehicle
    newVehicle.setEffectiveWindow(this.SliceDate, this.Branch.PeriodEnd)
    newVehicle = newVehicle.getSlice(this.SliceDate)
    BusinessVehicle.Type.TypeInfo.getProperty("BasedOnValue").Accessor.setValue(newVehicle, null)
    newVehicle.VehicleNumber = null    // reset VehicleNumber to make sure it's renumbered
    this.BALine.addAndNumberVehicle(newVehicle)
    for (coverage in this.Coverages) {
      var newCoverage = coverage.copyCoverage() as BusinessVehicleCov
      newCoverage.setEffectiveWindow(this.SliceDate, this.Branch.PeriodEnd) 
      newVehicle.addToCoverages(newCoverage)
    }
    for (mod in this.BusinessVehicleModifiers) {
      var newMod = mod.shallowCopy() as BusinessVehicleModifier
      newMod.setEffectiveWindow(this.SliceDate, this.Branch.PeriodEnd)
      newVehicle.addToBusinessVehicleModifiers(newMod)
    }
    for(additionalInterest in this.AdditionalInterests){
      var contact = additionalInterest.PolicyAddlInterest.AccountContactRole.AccountContact.Contact
      var detail = newVehicle.addAdditionalInterestDetail(contact)
      detail.setEffectiveWindow(this.SliceDate, this.Branch.PeriodEnd)
      detail.AdditionalInterestType = additionalInterest.AdditionalInterestType
      detail.ContractNumber = additionalInterest.ContractNumber
      detail.CertRequired = additionalInterest.CertRequired
    }
    newVehicle.Vin = null
    return newVehicle
  }

  /**
   * Sets the VIN number on 'vehicle' to 'vin', and optionally updates
   * other fields on the vehicle. This method is invoked 
   * whenever the VIN number is changed on the vehicle screen.
   */
  function setValuesBasedOnVin(vin : String) {
    this.Vin = vin
    try {
      var plugin = Plugins.get(IVinPlugin)
      var vehicleInfo = plugin.getVehicleInfo(vin)
      if (vehicleInfo != null) {
        this.Make = vehicleInfo.Make
        this.Model = vehicleInfo.Model
        this.Color = vehicleInfo.Color
        this.Year = vehicleInfo.Year
      }
    } catch (e : Exception) {
      // no Vin plugin defined -- no need to populate other vehicle fields
    }
  }

  /*
   * Sets the VehicleClassCode on a vehicle.  It optionally
   * sets other fields.  This is used in the PickerInput
   * on the vehicle page.  It returns the code because the
   * PickerInput uses the code for display.
   */
  function setVehicleClassCode(classCode : VehicleClassCodeSearchResult) : String {
    this.VehicleClassCode = classCode.Code
    this.Industry = classCode.Industry
    this.IndustryUse = classCode.IndustryUse
    this.PrimaryUse = classCode.PrimaryUse
    this.VehicleRadius = classCode.Radius
    this.VehicleSizeClass = classCode.SizeClass
    return classCode.Code
  }

  /*
   * Sets the VehicleClassCode on a vehicle. It optionally
   * sets other fields. This translates
   */
  function validateVehicleClassCode() : String {
    var line = this.PolicyLine as BusinessAutoLine
    var searchCriteria = new VehicleClassCodeSearchCriteria(){:VehicleType = this.VehicleType, :FleetType = line.Fleet}
    var codes = BusinessVehicleClassCodeSearch.getVehicleClassCodes(searchCriteria)
    var classCode : VehicleClassCodeSearchResult
    for (code in codes) {
      if (code.Code == this.VehicleClassCode) {
        classCode = code
        break
      }
    }

    if (classCode != null) {
      this.VehicleClassCode = classCode.Code
      this.Industry = classCode.Industry
      this.IndustryUse = classCode.IndustryUse
      this.PrimaryUse = classCode.PrimaryUse
      this.VehicleRadius = classCode.Radius
      this.VehicleSizeClass = classCode.SizeClass
      return null
    } else {
      return displaykey.BusinessAuto.Vehicle.InvalidClassCode
    }
  }

  /**
   * @return a display string including the location in parenthesis if available, otherwise just a the display name.
   *
   * e.g. 2000 Ford Pinto CA 44LC3123 (1000 Main Street, NY NYC, 00132)
   * Note, this will depend on the display name of for {@link entity.BusinessVehicle BusinessVehicle}
   */
  property get VehicleLocationDisplay() : String {
    var baVehicles = this.PolicyPeriod.BusinessAutoLine.Vehicles
    if (baVehicles.hasMatch( \ veh -> veh.Location == null )) {
      return this.DisplayName
    }
    return this.DisplayName + " (" + this.Location.DisplayName + ")"
  }

  /**
   * @return true if the provided {@link entity.BusinesssVehicle BusinessVehicle} matches this BusinessVehicle.
   * @see gw.lob.ba.BusinessVehicleMatcher BusinessVehicleMatcher for details about how a vehicle will be matched.
   */
  function matches(candidate : BusinessVehicle) : boolean {
    var thisKey = new MatchableKey(this)
    var candidateKey = new MatchableKey(candidate)
    return thisKey == candidateKey
  }

  /**
   * Gets the AccountLocation from the Location
   */
  property get AccountLocation() : AccountLocation {
    return this.Location.AccountLocation
  }
  
  /**
   * Sets the AccountLocation and ensures that Location is also set properly
   */
  property set AccountLocation(acctLoc : AccountLocation) {
    // See if there's already a PolicyLocation which points to the AccountLocation.
    // There should be at most one.
    var policyLocs = this.PolicyPeriod.PolicyLocations.where(\ p -> p.AccountLocation == acctLoc)
    if (policyLocs.Count > 1) {
      throw "Expected only one PolicyLocation associated with the AccountLocation: " + acctLoc
    }
    var policyLoc = policyLocs.first()

    // Create a new PolicyLocation if neccessary
    if (policyLoc == null) {
      policyLoc = this.PolicyPeriod.newLocation(acctLoc)
    }

    this.Location = policyLoc
  }

  /**
   * Returns the garaging state of the vehicles
   * @return typekey.Jurisdiction
   */
  property get GaragingJurisdiction() : Jurisdiction {
    return JurisdictionMappingUtil.getJurisdiction(this.Location)
  }

  /**
   * @return the BAJurisdiction for the GaragingJurisdiction
   */
  property get BAJurisdiction() : BAJurisdiction {
    return (this.BALine as BusinessAutoLine).getJurisdiction(GaragingJurisdiction)
  }
  
}
