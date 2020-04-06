package gw.lob.ba
uses gw.api.util.JurisdictionMappingUtil

@Deprecated("Deprecated in PC7.0.1.  Use BusinessVehicleEnhancement.GaragingJurisdiction instead")
enhancement BusinessVehicleCompatibilityEnhancement : BusinessVehicle {  
  property get Jurisdiction() : BAJurisdiction {
    return (this.BALine as BusinessAutoLine).getJurisdiction( JurisdictionMappingUtil.getJurisdiction(this.Location ))
  }
}
