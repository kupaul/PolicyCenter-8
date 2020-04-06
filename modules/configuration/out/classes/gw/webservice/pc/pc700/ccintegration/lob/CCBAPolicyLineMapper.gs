package gw.webservice.pc.pc700.ccintegration.lob
uses gw.webservice.pc.pc700.ccintegration.CCBasePolicyLineMapper
uses gw.webservice.pc.pc700.ccintegration.CCPolicyGenerator
uses java.util.ArrayList
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicySummaryVehicle
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCVehicle
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCVehicleRU
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCVehicleCoverage

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.lob.CCBAPolicyLineMapper instead")
class CCBAPolicyLineMapper extends CCBasePolicyLineMapper {

  var _baLine : BusinessAutoLine;

  construct(line : PolicyLine, policyGen : CCPolicyGenerator) {
    super(line, policyGen)
    _baLine = line as BusinessAutoLine;
  }

  // Create a summary list of vehicles for the PolicySummary that is returned for a search result (not a full policy mapping)
  override function mapVehicleSummaries(vehicleList : ArrayList<CCPolicySummaryVehicle>) {
    for (pcVehicle in _baLine.Vehicles.sortBy(\ v -> v.VehicleNumber) ) {
      if (meetsVehicleFilteringCriteria(pcVehicle)) {
        var ccVehicle = new CCPolicySummaryVehicle();
        vehicleList.add(ccVehicle);
        ccVehicle.PolicySystemID = pcVehicle.TypeIDString;
        ccVehicle.Color = pcVehicle.Color;
        ccVehicle.LicensePlate = pcVehicle.LicensePlate;
        ccVehicle.State = pcVehicle.LicenseState.Code
        ccVehicle.Make = pcVehicle.Make;
        ccVehicle.Model = pcVehicle.Model;
        ccVehicle.Vin = pcVehicle.Vin;
        ccVehicle.VehicleNumber = pcVehicle.VehicleNumber;
      }
    }
  }

  override function getLineCoverages() : List<entity.Coverage> {
    return _baLine.BALineCoverages as List<entity.Coverage>
  }

  override function setLineSpecificFields() {
    _ccPolicy.TotalVehicles += _baLine.Vehicles.Count
  }

  override function createRiskUnits() {
    // Map all the vehicles and their coverages
    for( pcVehicle in _baLine.Vehicles.sortBy(\ v -> v.VehicleNumber) ) {
      if (meetsVehicleFilteringCriteria(pcVehicle)) {
        var ccVehicle = new CCVehicle()
        ccVehicle.PolicySystemID = pcVehicle.TypeIDString
        ccVehicle.Color = pcVehicle.Color
        ccVehicle.LicensePlate = pcVehicle.LicensePlate
        ccVehicle.Make = pcVehicle.Make
        ccVehicle.Model = pcVehicle.Model
        ccVehicle.State = pcVehicle.LicenseState.Code
        ccVehicle.Vin = pcVehicle.Vin
        ccVehicle.Year = pcVehicle.Year
        ccVehicle.Style = mapBodyType(pcVehicle.BodyType.Code)
        var ccVehicleRU = new CCVehicleRU()
        ccVehicleRU.RUNumber = pcVehicle.VehicleNumber
        ccVehicleRU.VehicleLocation = _policyGen.getOrCreateCCLocation( pcVehicle.Location )
        ccVehicleRU.Vehicle = ccVehicle
        ccVehicleRU.Description = pcVehicle.DisplayName
        ccVehicleRU.PolicySystemID = pcVehicle.TypeIDString
        _ccPolicy.addToRiskUnits( ccVehicleRU )

        // Create vehicle-level coverages
        for (pcCov in pcVehicle.Coverages.sortBy(\ c -> c.Pattern.Priority))
        {
          var ccCov = new CCVehicleCoverage()
          populateCoverage(ccCov, pcCov)
          ccVehicleRU.addToCoverages( ccCov )
        }

        // Create vehicle-level coverages for each juridiction-level coverage for the jurisdiction of the vehicle
        for (pcCov in pcVehicle.BAJurisdiction.Coverages.sortBy(\ c -> c.Pattern.Priority)) {
          var ccCov = new CCVehicleCoverage()
          populateCoverage(ccCov, pcCov)
          ccVehicleRU.addToCoverages( ccCov )
        }

        // Create vehicle-level lienholders
        for (pcAddInt in pcVehicle.AdditionalInterests) {
          addVehicleOwner(ccVehicle, pcAddInt.PolicyAddlInterest.ContactDenorm);
        }
      }
    }

    // Map all the commercial auto drivers
    for (driver in _baLine.Drivers) {
      if (_policyGen.meetsDriverFilteringCriteria(driver.LastName)) {
        var ccDriver = _contactGen.getOrCreatePersonFromCommercialDriver(driver)
        _ccPolicy.addToCoveredParty(ccDriver)
      }
    }

  }

  private function meetsVehicleFilteringCriteria(pcVehicle : BusinessVehicle) : boolean {
    // If there is filtering criteria for PolicySystemID, then decide based on that
    if (_policyGen.hasPolicySystemIDFilteringCriteria()) {
      return _policyGen.meetsPolicySystemIDFilteringCriteria(pcVehicle.TypeIDString)
    }

    // Otherwise, check if all of the other filtering are met
    return (_policyGen.meetsVINFilteringCriteria(pcVehicle.Vin) and
            _policyGen.meetsLicensePlateFilteringCriteria(pcVehicle.LicensePlate))
  }

}
