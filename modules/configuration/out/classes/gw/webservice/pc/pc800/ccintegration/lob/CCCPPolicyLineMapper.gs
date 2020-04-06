package gw.webservice.pc.pc800.ccintegration.lob

uses gw.api.domain.covterm.CovTerm
uses gw.api.domain.covterm.TypekeyCovTerm
uses gw.webservice.pc.pc800.ccintegration.CCBasePolicyLineMapper
uses gw.webservice.pc.pc800.ccintegration.CCPolicyGenerator
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.CCRiskUnit_Coverages
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.CCPolicy_RiskUnits
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCBuildingRU
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPropertyCoverage
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCCoverage
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCCovTerm
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCPolicySummaryProperty
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCFinancialCovTerm
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCClassificationCovTerm
uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCNumericCovTerm
uses java.util.ArrayList
uses java.lang.Integer

@Export
class CCCPPolicyLineMapper extends CCBasePolicyLineMapper {

  var _cpLine : CPLine
  var _RUCount : Integer

  construct(line : PolicyLine, policyGen : CCPolicyGenerator) {
    super(line, policyGen)
    _cpLine = line as CPLine
  }

  // Create a summary list of covered buildings for the PolicySummary that is returned for a search result (not a full policy mapping)
  override function mapPropertySummaries(propertyList : ArrayList<CCPolicySummaryProperty>) {
    var count = propertyList.Count   // Use for numbering the properties across multiple lines

    for (cploc in _cpLine.CPLocations.sortBy(\ l -> l.Location.LocationNum)) {
      if (meetsLocationFilteringCriteria(cploc.Location)) {
        for (bld in cploc.Buildings.sortBy(\ b -> b.Building.BuildingNum)) {
          if (_policyGen.meetsPolicySystemIDFilteringCriteria(bld.TypeIDString)) {
            var ccBld = new CCPolicySummaryProperty()
            ccBld.PolicySystemID = bld.TypeIDString
            propertyList.add(ccBld)

            count = count + 1
            ccBld.PropertyNumber = count

            var loc = cploc.PolicyLocation
            ccBld.Location = loc.LocationNum.toString()
            ccBld.BuildingNumber = bld.Building.BuildingNum.toString()

            // CCPolicySummaryProperty.Address is deprecated as of 8.0.1. Use AddressLine1 and AddressLine2 instead.
            ccBld.Address = loc.AddressLine1
            if (loc.AddressLine2.HasContent) {
              ccBld.Address = ccBld.Address + ", " + loc.AddressLine2
            }

            ccBld.AddressLine1 = loc.AddressLine1
            ccBld.AddressLine2 = loc.AddressLine2
            ccBld.City = loc.City
            ccBld.Description = trimRUDescription(bld.Building.Description)
          }
        }
      }
    }

  }

  override function getLineCoverages() : List<entity.Coverage> {
    return _cpLine.CPLineCoverages as List<entity.Coverage>
  }

//  override function setLineSpecificFields() {
//  }

  override function createRiskUnits() {
    // Keep a count as we add risk units.  This may start > 0 if other lines have been processed first.
    _RUCount = _ccPolicy.RiskUnits == null ? 0 : _ccPolicy.RiskUnits.Count
    var startingCount = _RUCount
    var skipCount = 0   // Used to track how many "properties" were filtered out

    // Create risk units for each building
    for (cploc in _cpLine.CPLocations.sortBy(\ l -> l.Location.LocationNum)) {
      if (meetsLocationFilteringCriteria(cploc.Location)) {
        // Get the Location
        var ccLoc = _policyGen.getOrCreateCCLocation( cploc.Location )

        // Although the data model indicates that it is possible to have coverages at the location-level
        // there are no current examples of this for CP, so there is no mapping for that here.

        // Process all the buildings on location
        for (bld in cploc.Buildings.sortBy(\ b -> b.Building.BuildingNum)) {
          if (_policyGen.meetsPolicySystemIDFilteringCriteria(bld.TypeIDString)) {
            var ccBuilding = _policyGen.getOrCreateCCBuilding(bld.Building)

            // Create a new risk unit
            var ru = new CCBuildingRU()
            _ccPolicy.RiskUnits.add(new CCPolicy_RiskUnits(ru))

            _RUCount = _RUCount + 1
            ru.RUNumber = _RUCount
            ru.Building = ccBuilding
            ru.PolicyLocation = ccLoc
            ru.Description = trimRUDescription(bld.Building.Description)
            ru.PolicySystemID = bld.TypeIDString

            // Process building-level coveragesminOccurs="0"
            for (cov in bld.Coverages.sortBy(\ c -> c.Pattern.Priority)) {
              var ccCov = new CCPropertyCoverage()
              populateCoverage(ccCov, cov)
              ru.Coverages.add(new CCRiskUnit_Coverages( ccCov ))
            }

            // For building-level additional interests (e.g., lienholders), add a location-level contact in CC
            for (addInterest in bld.AdditionalInterests) {
              addRULevelAdditionalInterest(addInterest.ID, ru, addInterest.PolicyAddlInterest.ContactDenorm)
            }
          } else { // Filtered out the building so add 1 to the number skipped
            skipCount = skipCount + 1
          }
        }
      } else {  // Filtered out the location
        skipCount = skipCount + cploc.Buildings.Count + 1  // Count buildings + 1 for the location-level risk
      }
    }

    addToPropertiesCount(_RUCount - startingCount + skipCount)
  }

  override function handleCovTermSpecialCases(pcCov : Coverage, pcCovTerm : CovTerm, ccCov : CCCoverage, ccCovTerms : CCCovTerm[]) {

    super.handleCovTermSpecialCases(pcCov, pcCovTerm, ccCov, ccCovTerms)

    // Handle coinsurance
    if (((pcCov.PatternCode == "CPBldgCov") and (pcCovTerm.PatternCode == "CPBldgCovCoinsurance")) or
        ((pcCov.PatternCode == "CPBldgBusIncomeCov") and (pcCovTerm.PatternCode == "CPBldgBusIncomeCovCoinsurance")) or
        ((pcCov.PatternCode == "CPBldgStockCov") and (pcCovTerm.PatternCode == "CPBldgStockCovCoinsurance")) or
        ((pcCov.PatternCode == "CPBldgBPPCov") and (pcCovTerm.PatternCode == "CPBldgBPPCovCoinsurance")))
    {
      (ccCov as CCPropertyCoverage).Coinsurance = mapCoinsurance(pcCovTerm.ValueAsString)
    }

    // Handle valuation method (Actual Cash Value vs. Replacement Cost)
    if (((pcCov.PatternCode == "CPBldgCov") and (pcCovTerm.PatternCode == "CPBldgCovValuationMethod")) or
        ((pcCov.PatternCode == "CPBldgStockCov") and (pcCovTerm.PatternCode == "CPBldgStockCovValuationMethod")) or
        ((pcCov.PatternCode == "CPBldgBPPCov") and (pcCovTerm.PatternCode == "CPBldgBPPValuationMethod")))
    {
      // Map the values in PC that have corresponding values in CC
      (ccCov as CCPropertyCoverage).CoverageBasis = mapValuationMethod((pcCovTerm as TypekeyCovTerm).Value.Code)
    }

    //Handle blanket coverage
    if (pcCov typeis CPBuildingCov) {
      if (pcCov.CPBlanket != null) { // This coverage is part of a blanket
        if (pcCov.CPBlanket.CPBlanketCovExists) {
          // If the coverage is part of a blanket and the blanket coverage exists (it always should exist), then
          // use the values on the blanket coverage to override the cov terms on the coverage directly (for certain terms)
          var blanketCov = pcCov.CPBlanket.CPBlanketCov

          // If it has not already been added, create an extra cov term on the CC coverage to indicate that this
          // coverage is part of a blanket
          if (!blanketCovTermExists(ccCov)) {
            addblanketCovTerm(ccCov, blanketCov) }

          // Apply blanket cov term overrides, if applicable
          var term = ccCovTerms[0]
          switch (pcCovTerm.PatternCode) {
            case "CPBldgCovLimit":
            case "CPBPPCovLimit":
            case "CPBldgStockCov":
            case "CPBldgExtraExpenseCovLimit":
            case "BusIncomeMfgLimit":
            case "BusIncomeRentalLimit":
            case "BusIncomeOtherLimit":
              // Use blanket limit instead
              if (term typeis CCFinancialCovTerm) {  // it should be
                term.FinancialAmount = blanketCov.CPBlanketLimitTerm.Value?.ofCurrency(pcCov.Currency)
              }
              break
            case "CPBldgCovDeductible":
            case "CPBPPCovDeductible":
            case "CPBldgStockCovDeductible":
              // Use blanket deductible instead
              if (term typeis CCFinancialCovTerm) {  // it should be
                term.FinancialAmount = blanketCov.CPBlanketDeductibleTerm.Value?.ofCurrency(pcCov.Currency)
              }
              break
            case "CPBldgCovCoinsurance":
            case "CPBldgBPPCovCoinsurance":
            case "CPBldgStockCovCoinsurance":
              if (term typeis CCNumericCovTerm) {  // it should be
                term.NumericValue = blanketCov.CPBlanketCoinsuranceTerm.Value
              }
              // Also override the coverage-level coinsurance field
              (ccCov as CCPropertyCoverage).Coinsurance = mapCoinsurance(blanketCov.CPBlanketCoinsuranceTerm.ValueAsString)
              break
            default:
              // For anything else, do nothing.
          }
        }
      }
    }  // End of blanket coverage handling

  }

  private function blanketCovTermExists(ccCov : CCCoverage) : Boolean {
    if (ccCov.CovTerms != null) {
      for (covTerm in ccCov.CovTerms) {
        if (covTerm typeis CCClassificationCovTerm) {
          if ("pc_custom_blanket".equalsIgnoreCase(covTerm.Code)) {return true}
        }
      }
    }
    return false
  }

  private function addblanketCovTerm(ccCov: CCCoverage, blanketCov : CPBlanketCov) {
    addCustomClassificationCovTerm(ccCov, blanketCov.TypeIDString, "pc_custom_blanket", 1000,
                                   null, displaykey.Integration.CCIntegration.BlanketCovTermDescription)
  }

}
