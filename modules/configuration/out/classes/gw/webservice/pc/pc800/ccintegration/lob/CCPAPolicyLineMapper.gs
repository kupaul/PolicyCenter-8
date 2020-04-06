package gw.webservice.pc.pc800.ccintegration.lob
uses gw.api.domain.covterm.CovTerm
uses gw.api.domain.covterm.PackageCovTerm
uses gw.webservice.pc.pc800.ccintegration.CCBasePolicyLineMapper
uses gw.webservice.pc.pc800.ccintegration.CCPolicyGenerator
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.CCPolicy_RiskUnits
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.CCRiskUnit_Coverages
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCCoverage
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCVehicle
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCVehicleRU
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCVehicleCoverage
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCCovTerm
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPolicySummaryVehicle
uses java.util.ArrayList
uses gw.api.util.StateJurisdictionMappingUtil

@Export
class CCPAPolicyLineMapper extends CCBasePolicyLineMapper {

  var _paLine : PersonalAutoLine;

  construct(line : PolicyLine, policyGen : CCPolicyGenerator) {
    super(line, policyGen)
    _paLine = line as PersonalAutoLine;
  }

  // Create a summary list of vehicles for the PolicySummary that is returned for a search result (not a full policy mapping)
  override function mapVehicleSummaries(vehicleList : ArrayList<CCPolicySummaryVehicle>) {
    for (pcVehicle in _paLine.Vehicles.sortBy(\ v -> v.VehicleNumber) ) {
      if (meetsVehicleFilteringCriteria(pcVehicle)) {
        var ccVehicle = new CCPolicySummaryVehicle();
        vehicleList.add(ccVehicle);
        ccVehicle.PolicySystemID = pcVehicle.TypeIDString
        ccVehicle.Color = pcVehicle.Color;
        ccVehicle.LicensePlate = pcVehicle.LicensePlate;
        ccVehicle.State = StateJurisdictionMappingUtil.getJurisdictionMappingForState(pcVehicle.LicenseState).Code
        ccVehicle.Make = pcVehicle.Make;
        ccVehicle.Model = pcVehicle.Model;
        ccVehicle.Vin = pcVehicle.Vin;
        ccVehicle.VehicleNumber = pcVehicle.VehicleNumber;
      }
    }
  }

  override function getLineCoverages() : List<entity.Coverage> {
    return _paLine.PALineCoverages as List<entity.Coverage>
  }

  override function setLineSpecificFields() {
    _ccPolicy.TotalVehicles += _paLine.Vehicles.Count
  }

  override function createRiskUnits() {
    for( pcVehicle in _paLine.Vehicles.sortBy(\ v -> v.VehicleNumber) ) {
      if (meetsVehicleFilteringCriteria(pcVehicle)) {
        var ccVehicle = new CCVehicle()
        ccVehicle.PolicySystemID = pcVehicle.TypeIDString
        ccVehicle.Color = pcVehicle.Color
        ccVehicle.LicensePlate = pcVehicle.LicensePlate
        ccVehicle.Make = pcVehicle.Make
        ccVehicle.Model = pcVehicle.Model
        ccVehicle.State = StateJurisdictionMappingUtil.getJurisdictionMappingForState(pcVehicle.LicenseState).Code
        ccVehicle.Vin = pcVehicle.Vin
        ccVehicle.Year = pcVehicle.Year
        ccVehicle.Style = mapBodyType(pcVehicle.BodyType.Code)
        var ccVehicleRU = new CCVehicleRU()
        ccVehicleRU.RUNumber = pcVehicle.VehicleNumber
        if (pcVehicle.GarageLocation != null) {
          ccVehicleRU.VehicleLocation = _policyGen.getOrCreateCCLocation( pcVehicle.GarageLocation )
        }
        ccVehicleRU.Vehicle = new(ccVehicle)
        ccVehicleRU.Description = pcVehicle.DisplayName
        ccVehicleRU.PolicySystemID = pcVehicle.TypeIDString
        _ccPolicy.RiskUnits.add(new CCPolicy_RiskUnits( ccVehicleRU ))

        // Create vehicle-level coverages
        for( pcCov in pcVehicle.Coverages.sortBy(\ c -> c.Pattern.Priority) ) {
          var ccCov = new CCVehicleCoverage()
          populateCoverage(ccCov, pcCov)
          ccVehicleRU.Coverages.add(new CCRiskUnit_Coverages( ccCov ))
        }

        // Create vehicle-level lienholders
        for (pcAddInt in pcVehicle.AdditionalInterests) {
          addVehicleOwner(ccVehicle, pcAddInt.PolicyAddlInterest.ContactDenorm);
        }
      }
    }

  }

  override function handleCovTermSpecialCases(pcCov : Coverage, pcCovTerm : CovTerm, ccCov : CCCoverage, ccCovTerms : CCCovTerm[]) {
    super.handleCovTermSpecialCases(pcCov, pcCovTerm, ccCov, ccCovTerms);

    // Handle the special case for rental car coverage of a max per day and max overall
    if( typeof pcCov == PARentalCov and pcCovTerm typeis PackageCovTerm ) {
      var pct = pcCovTerm
      var currency = pcCov.Currency
      for( var packageTerm in pct.PackageValue.PackageTerms )
      {
        if( "DailyLimit" == packageTerm.Name && packageTerm.Value != null && packageTerm.Value != 0)
        {
          ccCov.ExposureLimit = packageTerm.Value?.ofCurrency(currency)
        }
        else if( "AggLimit" == packageTerm.Name && packageTerm.Value != null && packageTerm.Value != 0)
        {
          ccCov.IncidentLimit = packageTerm.Value?.ofCurrency(currency)
        }
      }
    }
  }

  private function meetsVehicleFilteringCriteria(pcVehicle : PersonalVehicle) : boolean {
    // If there is filtering criteria for PolicySystemID, then decide based on that
    if (_policyGen.hasPolicySystemIDFilteringCriteria()) {
      return _policyGen.meetsPolicySystemIDFilteringCriteria(pcVehicle.TypeIDString)
    }

    // Otherwise, check if all of the other filtering are met
    return (_policyGen.meetsVINFilteringCriteria(pcVehicle.Vin) and
            _policyGen.meetsLicensePlateFilteringCriteria(pcVehicle.LicensePlate))
  }

}
