package gw.webservice.pc.pc800.gxmodel

uses gw.api.productmodel.ClausePatternLookup
uses gw.api.productmodel.CovTermPatternLookup

uses java.lang.IllegalArgumentException

enhancement BusinessAutoLineModelEnhancement : gw.webservice.pc.pc800.gxmodel.businessautolinemodel.types.complex.BusinessAutoLine {

  function populate(line : BusinessAutoLine){
    SimpleValuePopulator.populate(this, line)
    // populate additioanl insureds
    for(additionalInsured in this.AdditionalInsureds.Entry){
      for(detail in additionalInsured.entity_PolicyAddlInsured.PolicyAdditionalInsuredDetails.Entry){
        var contacModel = additionalInsured.AccountContactRole.AccountContact.Contact
        var contact = contacModel.$TypeInstance.findOrCreateContact(line.Branch.Policy.Account)
        var additionalInsuredDetail = line.addNewAdditionalInsuredDetailForContact(contact)
        additionalInsuredDetail.AdditionalInsuredType = detail.AdditionalInsuredType
      }
    }
    // populate jurisdictions
    for(jurisdiction in this.Jurisdictions.Entry){
      var j = line.addJurisdiction(jurisdiction.State)
      for(cov in jurisdiction.Coverages.Entry){
        populateClause(j, cov.$TypeInstance)
      }
      for(cov in jurisdiction.Conditions.Entry){
        populateClause(j, cov.$TypeInstance)
      }
      for(cov in jurisdiction.Exclusions.Entry){
        populateClause(j, cov.$TypeInstance)
      }
      if(jurisdiction.HiredAutoBasis <> null){
        j.HiredAutoCoverageSelected = true
        j.HiredAutoBasis.Basis = jurisdiction.HiredAutoBasis.Basis
        j.HiredAutoBasis.IfAnyExposure = jurisdiction.HiredAutoBasis.IfAnyExposure
      }
      if(jurisdiction.NonOwnedBasis <> null){
        j.NonOwnedCoverageSelected = true
        j.NonOwnedBasis.NumEmployees = jurisdiction.NonOwnedBasis.NumEmployees
        j.NonOwnedBasis.NumVolunteers = jurisdiction.NonOwnedBasis.NumVolunteers
        j.NonOwnedBasis.NumPartners = jurisdiction.NonOwnedBasis.NumPartners
      }
    }
    // populate coverage
    this.BALineCoverages.Entry.each(\ b -> {
      var pattern = ClausePatternLookup.getCoveragePatternByCode(b.Pattern.Code)
      if(pattern == null){
        throw new IllegalArgumentException("Could not find coverage ${b.Pattern.Code}")
      }
      if(pattern.OwningEntityType <> "BusinessAutoLine"){
        throw new IllegalArgumentException("Coverage pattern ${pattern} does not apply to BusinessAutoLine")
      }
      line.setCoverageExists(pattern, true)
      var coverage = line.getCoverage(pattern)
      for(t in b.CovTerms.Entry){
        var covTermPattern = CovTermPatternLookup.getByCode(t.PatternCode)
        var covTerm = coverage.getCovTerm(covTermPattern)
        covTerm.setValueFromString(t.DisplayValue)
      }
    })
    // populate vehicle
    for(v in this.Vehicles.Entry){
      var vehicle = new BusinessVehicle(line.Branch)
      SimpleValuePopulator.populate(v.$TypeInstance, vehicle)
      var policyLocation = line.Branch.PolicyLocations.firstWhere(\ p -> p.LocationNum == v.Location.LocationNum)
      if(policyLocation == null){
        throw new IllegalArgumentException("Could not find policy location with location number ${v.Location.LocationNum}")
      }
      vehicle.Location = policyLocation
      line.addAndNumberVehicle(vehicle)
      for(cov in v.Coverages.Entry){
        vehicle.setCoverageExists(cov.Pattern.Code, true)
        cov.$TypeInstance.populateCoverage(vehicle.getCoverage(cov.Pattern.Code))
      }
    }
    // populate drivers
    for(d in this.Drivers.Entry){
      var driver = new CommercialDriver(line.Branch)
      SimpleValuePopulator.populate(d.$TypeInstance, driver)
      line.addToDrivers(driver)
    }
    // populate modifiers
    for(m in this.BAModifiers.Entry){
      var modifier = line.getModifier(m.PatternCode)
      for(r in m.RateFactors.Entry){
        var rateFactor = modifier.getRateFactor(r.RateFactorType)
        rateFactor.AssessmentWithinLimits = r.Assessment
        rateFactor.Justification = r.Justification
      }
    }
  }
  
  private function populateClause(j : BAJurisdiction, cov : gw.webservice.pc.pc800.gxmodel.clausemodel.types.complex.Clause){
    j.setCoverageConditionOrExclusionExists(cov.Pattern.Code, true)
    var c = j.getCoverageConditionOrExclusion(cov.Pattern.Code)
    cov.populateCoverage(c)
  }
}