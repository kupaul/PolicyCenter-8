package gw.lob.pa

enhancement PersonalVehicleQuickQuoteEnhancement : entity.PersonalVehicle {

  property get QuickQuotePrimaryDriver() : PolicyDriver {
    return this.Drivers.first().PolicyDriver
  }

  property set QuickQuotePrimaryDriver(driver : PolicyDriver) {
    var assignment = this.Drivers.first()
    if (assignment <> null) assignment.remove()
    if (driver != null) {
      assignment = this.addPolicyDriver(driver)
      assignment.PercentageDriven = 100
    }
  }
}
