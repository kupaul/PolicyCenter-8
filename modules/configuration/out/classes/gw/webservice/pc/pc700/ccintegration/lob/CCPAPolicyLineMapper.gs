package gw.webservice.pc.pc700.ccintegration.lob
uses gw.webservice.pc.pc700.ccintegration.CCBasePolicyLineMapper
uses gw.api.domain.covterm.CovTerm
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCCoverage
uses gw.api.domain.covterm.PackageCovTerm
uses gw.api.financials.CurrencyAmount
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCVehicle
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCVehicleRU
uses gw.webservice.pc.pc700.ccintegration.CCPolicyGenerator
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCVehicleCoverage
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCCovTerm
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicySummaryVehicle
uses java.util.ArrayList

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.lob.CCPAPolicyLineMapper instead")
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
        ccVehicle.State = pcVehicle.LicenseState.Code
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
        ccVehicle.State = pcVehicle.LicenseState.Code
        ccVehicle.Vin = pcVehicle.Vin
        ccVehicle.Year = pcVehicle.Year
        ccVehicle.Style = mapBodyType(pcVehicle.BodyType.Code)
        var ccVehicleRU = new CCVehicleRU()
        ccVehicleRU.RUNumber = pcVehicle.VehicleNumber
        ccVehicleRU.VehicleLocation = _policyGen.getOrCreateCCLocation( pcVehicle.GarageLocation )
        ccVehicleRU.Vehicle = ccVehicle
        ccVehicleRU.Description = pcVehicle.DisplayName
        ccVehicleRU.PolicySystemID = pcVehicle.TypeIDString
        _ccPolicy.addToRiskUnits( ccVehicleRU )

        // Create vehicle-level coverages
        for( pcCov in pcVehicle.Coverages.sortBy(\ c -> c.Pattern.Priority) )
        {
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

  }

  /**
   * handleCovTermSpecialCases sets values for a few specific types of cov terms.
   * Since this is used for integrating with other systems, particularly CC, it uses
   * CurrencyAmount instead of MonetaryAmount.  This allows it to integrate with CC7 as
   * well as CC8
  */
  override function handleCovTermSpecialCases(pcCov : Coverage, pcCovTerm : CovTerm, ccCov : CCCoverage, ccCovTerms : CCCovTerm[]) {
    super.handleCovTermSpecialCases(pcCov, pcCovTerm, ccCov, ccCovTerms);

    // Handle the special case for rental car coverage of a max per day and max overall
    if( typeof pcCov == PARentalCov and pcCovTerm typeis PackageCovTerm )
    {
      var pct = pcCovTerm
      for( var packageTerm in pct.PackageValue.PackageTerms )
      {
        if( "DailyLimit" == packageTerm.Name )
        {
          ccCov.ExposureLimit = new CurrencyAmount(packageTerm.Value, pct.Clause.Currency)
        }
        else if( "AggLimit" == packageTerm.Name )
        {
          ccCov.IncidentLimit = new CurrencyAmount(packageTerm.Value, pct.Clause.Currency)
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
