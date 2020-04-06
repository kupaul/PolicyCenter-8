package gw.lob.pa
uses gw.api.util.StateJurisdictionMappingUtil

enhancement PersonalAutoLineQuickQuoteEnhancement : entity.PersonalAutoLine {

  function addNewPolicyDriverForContact(contact : Contact, driverNum : int) : PolicyDriver {
    this.PolicyDrivers.where(\ p -> p.QuickQuoteNumber == driverNum)
      .each(\ p -> p.removeDriver())
    var policyDriver = this.addNewPolicyDriverForContact(contact)
    policyDriver.QuickQuoteNumber = driverNum
    policyDriver.initializeIncidentSummary()
    return policyDriver
  }

  function addNewPolicyDriverOfContactType(contactType : ContactType, driverNum : int) : PolicyDriver {
    var acctContact = this.Branch.Policy.Account.addNewAccountContactOfType(contactType)
    acctContact.addNewRole("Driver")
    return addNewPolicyDriverForContact(acctContact.Contact, driverNum)
  }

  property get DriversForQuickQuote() : PolicyDriver[] {
    return this.PolicyDrivers.where(\ d -> d.QuickQuoteNumber <> null)
  }

  property get PolicyDriver1(): PolicyDriver {
    return getPolicyDriverByQuickQuoteNumber(1)
  }
  
  property get PolicyDriver2(): PolicyDriver{
    return getPolicyDriverByQuickQuoteNumber(2)
  }

  private function getPolicyDriverByQuickQuoteNumber(n : int) : PolicyDriver {
    var driver = this.PolicyDrivers.firstWhere(\ d -> d.QuickQuoteNumber == n)
    if (driver == null) {
      assignQuickQuoteNumbersForDrivers()
      driver = this.PolicyDrivers.firstWhere(\ v -> v.QuickQuoteNumber == n)
    }
    return driver
  }
  
  function assignQuickQuoteNumbersForDrivers() {
    var qqDrivers = this.PolicyDrivers.where(\ v -> v.QuickQuoteNumber != null)
    //driver Quick Quote numbers exist but need to be adjusted (likely a driver was removed)
    if (qqDrivers.HasElements and !qqDrivers.hasMatch(\ d -> d.QuickQuoteNumber <= 1)) {
      adjustQuickQuoteNumbersForDrivers()
    }
    //no driver Quick Quote numbers exist and they need to be assigned to the drivers on the policy
    else {
      var accountHolderDrivers = this.PolicyDrivers.where(\ pDriver -> pDriver.AccountContactRole.AccountContact.hasRole(typekey.AccountContactRole.TC_ACCOUNTHOLDER))
      var orderedDrivers = this.PolicyDrivers.disjunction(accountHolderDrivers).toTypedArray()
      orderedDrivers = orderedDrivers.orderByDescending(\ pd -> pd.VehicleDrivers.sum(\ v -> v.PercentageDriven)).toTypedArray()
      orderedDrivers = accountHolderDrivers.concat(orderedDrivers)
      orderedDrivers.eachWithIndex(\ d, idx -> {d.QuickQuoteNumber = idx + 1}) //arbitrarily starts numbering from 1
    }
  }

  function adjustQuickQuoteNumbersForDrivers() {
    while (!this.PolicyDrivers.hasMatch(\ d -> d.QuickQuoteNumber == 1)) { //if no vehicle has the quick quote number 1, reduce all vehicle quick quote numbers
      this.PolicyDrivers.each(\ d -> {d.QuickQuoteNumber = d.QuickQuoteNumber != null ? d.QuickQuoteNumber - 1 : null})
    }
  }


  function addAndNumberVehicle(vehicle : PersonalVehicle, vehicleNum : int) {
    this.Vehicles.where(\ v -> v.QuickQuoteNumber == vehicleNum)
      .each(\ v -> v.remove())
    vehicle = new PersonalVehicle(this.Branch)
    this.addToVehicles(vehicle)
    this.PersonalVehicleAutoNumberSeq.number(vehicle, this.Vehicles, entity.PersonalVehicle.Type.TypeInfo.getProperty("VehicleNumber"))
    vehicle.QuickQuoteNumber = vehicleNum
    // set default values for required fields - this may need to be removed
    // when validation is expanded to be able to perform QQ specific
    // validations only
    vehicle.GarageLocation = this.Branch.PrimaryLocation
    vehicle.LicenseState = StateJurisdictionMappingUtil.getStateMappingForJurisdiction(this.Branch.BaseState)
    vehicle.VehicleType = VehicleType.TC_AUTO
  }

  property get Vehicle1(): PersonalVehicle {
    return getVehicleByQuickQuoteNumber(1)
  }
  
  property get Vehicle2(): PersonalVehicle{
    return getVehicleByQuickQuoteNumber(2)
  }

  private function getVehicleByQuickQuoteNumber(n : int) : PersonalVehicle {
    var vehicle = this.Vehicles.firstWhere(\ v -> v.QuickQuoteNumber == n)
    if (vehicle == null) {
      assignQuickQuoteNumbersForVehicles()
      vehicle = this.Vehicles.firstWhere(\ v -> v.QuickQuoteNumber == n)
    }
    return vehicle
  }

  function assignQuickQuoteNumbersForVehicles() {
    var qqVehicles = this.Vehicles.where(\ v -> v.QuickQuoteNumber != null)
    if (qqVehicles.HasElements and !qqVehicles.hasMatch(\v -> v.QuickQuoteNumber <= 1)) {
      adjustVehicleQuickQuoteNumber()
    } else {
      this.Vehicles.eachWithIndex(\ v, idx -> {v.QuickQuoteNumber = idx + 1}) //arbitrarily starts numbering from 1
    }
  }

  private function adjustVehicleQuickQuoteNumber() {
    while (!this.Vehicles.hasMatch(\ v -> v.QuickQuoteNumber == 1)) { //if no vehicle has the quick quote number 1, reduce all vehicle quick quote numbers
      this.Vehicles.each(\ v -> {v.QuickQuoteNumber = v.QuickQuoteNumber != null ? v.QuickQuoteNumber - 1 : null})
    }
  }

}