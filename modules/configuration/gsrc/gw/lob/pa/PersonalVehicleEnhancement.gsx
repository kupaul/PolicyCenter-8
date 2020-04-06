package gw.lob.pa

uses gw.api.productmodel.CoveragePattern
uses gw.plugin.vin.IVinPlugin
uses gw.plugin.Plugins
uses gw.coverage.AllCoverageCopier
uses java.lang.Exception
uses gw.api.util.MonetaryAmounts
uses gw.pl.currency.MonetaryAmount
uses gw.api.productmodel.CoveragePattern

enhancement PersonalVehicleEnhancement : PersonalVehicle {

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
  
  /**
   * Returns the primary driver for this vehicle. The primary driver is defined as the VehicleDriver
   * which has the highest PercentageDriven. If multiple drivers have the same percentage, the one
   * whose DisplayName appears first alphabetically will be selected. If no drivers are listed for
   * the vehicle then null is returned.
   */
  property get PrimaryDriver() : VehicleDriver {
    var orderedDrivers = this.Drivers.orderByDescending(\ driver -> driver.PercentageDriven).thenBy(\ driver -> driver.DisplayName)
    return orderedDrivers.first()
  }

  /**
   * Returns the total percentage driven of this vehicle, which is calculated by adding the
   * PercentageDriven of all Drivers on the vehicle.
   */
  property get TotalPercentageDriven() : int {
    return this.Drivers.toList().reduce( 0, \ totalPercentage, driver -> totalPercentage + driver.PercentageDriven )
  }

  /**
   * Adds a Vehicle Driver join entity between this Vehicle and the given PolicyDriver
   * @param driver
   */
  function addPolicyDriver(driver : PolicyDriver) : VehicleDriver {
    var vehicleDriver : VehicleDriver = new VehicleDriver(this.Branch)
    vehicleDriver.PolicyDriver = driver
    this.addToDrivers( vehicleDriver )
    return vehicleDriver
  }

  /**
   * The available drivers are all policy drivers that aren't already assigned to this vehicle.
   */
  property get AvailableDrivers() : PolicyDriver[] {
    var nonExcludedDrivers = this.PALine.PolicyDrivers.where(\ driver -> not(driver.Excluded))
    return nonExcludedDrivers.subtract(this.Drivers.map(\ vDriver -> vDriver.PolicyDriver)).toTypedArray()
  }

  function getVehicleLocationDisplay() : String {
    if (this.GarageLocation == null) {
      return this.DisplayName
    }
    return this.DisplayName + " (" + this.GarageLocation.DisplayName + ")"
  }
  
  /**
   * Gets the AccountLocation from the GarageLocation
   */
  property get AccountLocation() : AccountLocation {
    return this.GarageLocation.AccountLocation
  }
  
  /**
   * Sets the AccountLocation and ensures that GarageLocation is also set properly
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
    if (policyLoc == null && acctLoc != null) {
      policyLoc = this.PolicyPeriod.newLocation(acctLoc)
      for(var tc in policyLoc.TerritoryCodes)
        tc.fillWithFirst()      
    }

    if (policyLoc != null) {
      this.GarageLocation = policyLoc
    }
  }
  
  // costs for the vehicle with the vehicle as the coverable
  property get VehicleCost() : MonetaryAmount {
    var total = MonetaryAmounts.zeroOf(this.PolicyPeriod.PreferredSettlementCurrency)
    if (this.PolicyPeriod.TotalCostRPT == null) {
      return total
    }
    var covPatterns = this.PolicyLine.Pattern.getCoverageCategory("PAPPhysDamGrp").coveragePatternsForEntity(PersonalVehicle)
    for (covPattern in covPatterns) {
      var costs = this.PALine.getAllCostsForCoverage(this, covPattern)
      if (costs.size() > 0) {
        total += costs.sum(\c -> c.ActualAmountBilling)
      }
    }
    return total
  }
  
  // costs for the vehicle with the line as the coverable
  property get LineCost() : MonetaryAmount {
    var total = MonetaryAmounts.zeroOf(this.PolicyPeriod.PreferredSettlementCurrency)
    if (this.Branch.TotalCostRPT == null) {
      return total
    }
    var liabilityCategory = this.PolicyLine.Pattern.getCoverageCategory("PAPLiabGrp")
    var liabilityCovPatterns = liabilityCategory.coveragePatternsForEntity(PersonalAutoLine)
    for (covPattern in liabilityCovPatterns) {
      var costs = this.PALine.getAllCostsForCoverage(this.PALine, covPattern)
      if (costs.size() > 0) {
        // Assumes line costs for a given covPattern are the same for all vehicles
        total += costs.first().ActualAmountBilling
      }
    }
    var pipCategory = this.PolicyLine.Pattern.getCoverageCategory("PAPip")
    if (pipCategory <> null) {
      var pipCovPatterns = pipCategory.coveragePatternsForEntity(PersonalAutoLine)
      for (covPattern in pipCovPatterns) {
        var costs = this.PALine.getAllCostsForCoverage(this.PALine, covPattern)
        if (costs.size() > 0) {
          // Assumes line costs for a given covPattern are the same for all vehicles
          total += costs.first().ActualAmountBilling
        }
      }
    }
    return total
  }
  
  property get TotalCost() : MonetaryAmount {
    return VehicleCost.add(LineCost)
  }

  @Deprecated("Use this.PALine.getAllCostsForCoverage(Coverable, CoveragePattern) directly.")
  function getCostForCoverageAndVehicle(covered : Coverable, covPat : CoveragePattern) : Cost {
    // Return first on getAllCostsForCoverage will return a non-deterministic Cost if there
    // is more than one cost associated with the covered and covPat.  Use getAllCostsForCoverage
    // instead and explicitly filter/choose the appropriate costs.
    return (this.PALine.getAllCostsForCoverage(covered, covPat).first())
  }

  /**
   * Copies the complete coverage pattern from this vehicle to the given target vehicles.
   */
  function copyCoverages(toVehicles : PersonalVehicle[]) {
    var coverageCopier = new AllCoverageCopier(this)
    coverageCopier.ShouldCopyAll = true
    toVehicles.each(\ v -> coverageCopier.copyInto(v))
  }
  
}



