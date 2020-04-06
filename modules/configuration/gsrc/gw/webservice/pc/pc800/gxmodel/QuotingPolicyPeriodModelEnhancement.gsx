package gw.webservice.pc.pc800.gxmodel

uses gw.api.productmodel.ClausePatternLookup
uses gw.api.productmodel.CovTermPatternLookup
uses gw.api.productmodel.CoveragePattern

uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException

enhancement QuotingPolicyPeriodModelEnhancement : gw.webservice.pc.pc800.gxmodel.quotingpolicyperiodmodel.types.complex.PolicyPeriod {

  protected function populatePALine(line : PersonalAutoLine) {
    SimpleValuePopulator.populate(this, line)
    // populate coverage
    if (this.PersonalAutoLine.PALineCoverages != null) {
      this.PersonalAutoLine.PALineCoverages.Entry.each(\ b -> {
        var pattern = ClausePatternLookup.getByCode(b.Pattern.Code) as CoveragePattern
        if(pattern == null){
          throw new IllegalArgumentException("Could not find coverage ${b.Pattern.Code}")
        }
        if (pattern.OwningEntityType <> "PersonalAutoLine"){
          throw new IllegalArgumentException("Coverage pattern ${pattern} does not apply to PersonalAutoLine")
        }
        line.setCoverageExists(pattern, true)
        var coverage = line.getCoverage(pattern)
        for (t in b.CovTerms.Entry){
          var covTermPattern = CovTermPatternLookup.getByCode(t.PatternCode)
          var covTerm = coverage.getCovTerm(covTermPattern)
          covTerm.setValueFromString(t.DisplayValue)
        }
      })
    }
    
    for (v in this.PersonalAutoLine.Vehicles.Entry) {
      var vehicle = new PersonalVehicle(line.Branch)
      SimpleValuePopulator.populate(v.$TypeInstance, vehicle)
      line.addAndNumberVehicle(vehicle)
      var location = line.Branch.PolicyLocations.singleWhere(\ p -> p.LocationNum == v.GarageLocation.LocationNum)
      vehicle.GarageLocation = location
      SimpleValuePopulator.populate(v.GarageLocation.$TypeInstance, vehicle.GarageLocation)
      SimpleValuePopulator.populate(v.GarageLocation.AccountLocation.$TypeInstance, vehicle.GarageLocation.AccountLocation)

      for(cov in v.Coverages.Entry){
        vehicle.setCoverageExists(cov.Pattern.Code, true)
        cov.$TypeInstance.populateCoverage(vehicle.getCoverage(cov.Pattern.Code))
      }
    }
    
    for (d in this.PersonalAutoLine.PolicyDrivers.Entry) {
      var driver = line.Branch.addNewPolicyContactRoleForContact(line.Branch.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact, "PolicyDriver") as PolicyDriver
      line.Branch.PrimaryNamedInsured.DateOfBirth = d.DateOfBirth
      d.DateOfBirth = null //prevents the exception: java.lang.IllegalArgumentException: The property "PolicyDriver.DateOfBirth" only works with database-backed properties defined in the data model configuration files.
      
      SimpleValuePopulator.populate(d.$TypeInstance, driver)
      var driverRole = driver.AccountContactRole as Driver
      var person = driverRole.AccountContact.Contact as Person
      var contactModel = d.AccountContactRole.AccountContact.Contact
      SimpleValuePopulator.populate(contactModel.$TypeInstance, person)
      var personModel = contactModel.entity_Person
      SimpleValuePopulator.populate(personModel.$TypeInstance, person)
      SimpleValuePopulator.populate(contactModel.PrimaryAddress.$TypeInstance, person.PrimaryAddress)
      driverRole.NumberofAccidents = d.AccountContactRole.entity_Driver.NumberofAccidents
      driverRole.NumberofViolations = d.AccountContactRole.entity_Driver.NumberofViolations
      driver.LicenseNumber = d.entity_PolicyDriver.LicenseNumber
      driver.LicenseState = d.entity_PolicyDriver.LicenseState
      driver.initializeIncidentSummary()
      line.addToPolicyDrivers(driver)
      for (vehicle in d.entity_PolicyDriver.VehicleDrivers.Entry) {
        var vehicleDriver = new VehicleDriver(line.Branch)
        vehicleDriver.PolicyDriver = driver
        vehicleDriver.PercentageDriven = vehicle.PercentageDriven
        var vehicles = line.Vehicles.where(\ v -> v.Vin == vehicle.Vehicle.Vin)
        if (vehicles.Count != 1) {
          throw new IllegalStateException(displaykey.Web.Policy.PA.Validation.VinNumbers)
        }
        vehicleDriver.Vehicle = vehicles[0]
        vehicleDriver.Vehicle.addToDrivers(vehicleDriver)
      }
    }    

  }
  
  function populatePolicyPeriod(period : PolicyPeriod) {
    SimpleValuePopulator.populate(this, period)
    if (period.PersonalAutoLineExists) {
      populatePALine(period.PersonalAutoLine)
    }
  }
}
