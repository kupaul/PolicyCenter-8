package gw.lob.ba.rating

uses gw.api.domain.covterm.OptionCovTerm
uses gw.api.domain.covterm.PackageCovTerm
uses gw.api.domain.covterm.TypekeyCovTerm
uses gw.api.domain.financials.PCFinancialsLogger
uses gw.api.productmodel.CoveragePattern
uses gw.api.util.JurisdictionMappingUtil
uses gw.api.util.StateJurisdictionMappingUtil
uses gw.rating.AbstractRatingEngine
uses gw.rating.CostData
uses gw.rating.RateAdjFactorSearchCriteria

uses java.lang.Iterable
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.util.Date
uses java.util.Map

@Export
class BASysTableRatingEngine extends AbstractRatingEngine<BusinessAutoLine> {

  var _baseRatingDate : Date

  construct(baLineArg : BusinessAutoLine) {
    super(baLineArg)
    // set the base Rating using the first policyperiod in the term.
    // this will be used for U/W lookup and other basic items
    // rating date by object will be set separately
    _baseRatingDate = baLineArg.Branch.FirstPeriodInTerm.getReferenceDateForCurrentJob( baLineArg.BaseState )
  }

  override protected function existingSliceModeCosts() : Iterable<Cost> {
    return PolicyLine.Costs.where(\c -> c typeis BAStateCovVehicleCost or
                                   c typeis BAStateCovCost or
                                   c typeis BusinessVehicleCovCost or
                                   c typeis BALineCovCost or
                                   c typeis BALineCovNonownedCost or
                                   c typeis BAStateCovVehiclePIPCost)
  }

    // Used by the extractCostDatasFromExistingCosts method.  Must be implemented if that method is going to be called
  override protected function createCostDataForCost(c : Cost) : CostData {
    switch(typeof c) {
      case BAStateCovVehiclePIPCost: return new BAStateCovVehiclePIPCostData(c, RateCache)
      case BAStateCovVehicleCost:    return new BAStateCovVehicleCostData(c, RateCache)
      case BAStateCovCost:           return new BAStateCovCostData(c, RateCache)
      case BusinessVehicleCovCost:   return new BusinessVehicleCovCostData(c, RateCache)
      case BALineCovCost:            return new BALineCovCostData(c, RateCache)
      case BALineCovNonownedCost:    return new BALineCovNonownedCostData(c, RateCache)
      default: throw "Unepxected cost type ${c.DisplayName}"
    }
  }

  protected override function rateSlice(lineVersion : BusinessAutoLine) {
    assertSliceMode(lineVersion)
    var logMsg = "Rating ${lineVersion} ${lineVersion.SliceDate} version..."
    PCFinancialsLogger.logInfo( logMsg  )
    if (lineVersion.Branch.isCanceledSlice()) {
      // Do nothing if this is a canceled slice
    } else {
      for (cov in lineVersion.BALineCoverages) {
        rateLineCov( cov )
      }
      for (stateCov in lineVersion.Jurisdictions*.Coverages) {
        rateStateCov(stateCov)
      }

      for (vehCov in lineVersion.Vehicles*.Coverages) {
        rateVehicleCov(vehCov)
      }

    }
    PCFinancialsLogger.logInfo( logMsg + "done" )
  }

  private function rateLineCov(cov : BusinessAutoCov) {
    switch (typeof cov) {
      case BAOwnedLiabilityCov: rateBAOwnedLiabilityCov(cov)
                                break
      case BAOwnedMedPayCov: rateBAOwnedMedPayCov(cov)
                              break
      //line level coverages, but rated by state
      case BAHiredCollisionCov: rateBAHiredCollisionCov(cov)
                                break
      case BAHiredCompCov:      rateBAHiredCompCov(cov)
                                break
      case BAHiredLiabilityCov: rateBAHiredLiabilityCov(cov)
                                break
      case BAHiredUIMCov:       rateBAHiredUIMCov(cov)
                                break
      case BAHiredUMCov:        rateBAHiredUMCov(cov)
                                break
      case BANonownedLiabCov:  rateBANonownedLiabCov(cov)
                                break
      default : PCFinancialsLogger.logDebug( "Not rating ${(typeof cov)}")
    }
  }

  private function rateStateCov(cov : BAStateCov) {
    switch(typeof cov) {
      case BAOwnedUIMBICov:     rateBAOwnedUIMBICov(cov)
                                break
      case BAOwnedUIMPDCov:     rateBAOwnedUIMPDCov(cov)
                                break
      case BAOwnedUMBICov:      rateBAOwnedUMBICov(cov)
                                break
      case BAOwnedUMPDCov:      rateBAOwnedUMPDCov(cov)
                                break
      case CAPIP_NJ:            rateCAPIP_NJ(cov)
                                break
      case CAPIP_KY:            rateCAPIP_KY(cov)
                                break
      case CA_PIP_AR:           rateCA_PIP_AR(cov)
                               break
      default : PCFinancialsLogger.logDebug( "Not rating ${(typeof cov)}")
    }
  }

  private function rateBAOwnedLiabilityCov(cov : BAOwnedLiabilityCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var ratingDate : java.util.Date
    var vehicles = cov.BALine.Vehicles
    for ( vehicle in vehicles )
    {
      ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BALine)
      var limitFactor = getRateFactor( "bapLiabLimit", cov.BAOwnedLiabilityLimitTerm,
          JurisdictionMappingUtil.getJurisdiction(vehicle.Location), ratingDate )
      var jur = cov.BALine.getJurisdiction(JurisdictionMappingUtil.getJurisdiction(vehicle.Location))
      var cost = new BALineCovCostData(start, end, cov.Currency, RateCache, jur, cov.FixedId, vehicle.FixedId)
      cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
      cost.Basis = 1
      cost.ActualBaseRate = getRateFactor( "bapLiabilityRate", "base",
          JurisdictionMappingUtil.getJurisdiction(vehicle.Location), ratingDate )
      cost.ActualAdjRate = cost.ActualBaseRate
                      * limitFactor
                      * getRadiusFactor(vehicle, ratingDate)
                      * getAntiLockBrakesDiscountFactor(vehicle, ratingDate)
                      * getSafeDrivingCertDiscountFactor(vehicle, ratingDate)
                      * getUWCompanyRateFactor(cov.BALine.BaseState)

      cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
      addCost(cost)
    }
  }

  private function rateBAOwnedMedPayCov(cov : BAOwnedMedPayCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var vehicles = cov.BALine.Vehicles
    for ( vehicle in vehicles )
    {
      var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BALine)
      var jur = cov.BALine.getJurisdiction(JurisdictionMappingUtil.getJurisdiction(vehicle.Location) )
      var cost = new BALineCovCostData(start, end, cov.Currency, RateCache, jur, cov.FixedId, vehicle.FixedId)
      cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
      cost.Basis = 1
      cost.ActualBaseRate = getRateFactor( "bapMedPayLimit", cov.BAOwnedMedPayLimitTerm,
          JurisdictionMappingUtil.getJurisdiction(vehicle.Location), ratingDate )
      cost.ActualAdjRate = cost.ActualBaseRate * getUWCompanyRateFactor(cov.BALine.BaseState)
      cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
      addCost(cost)
    }
  }

  private function rateBAOwnedUIMBICov(cov : BAOwnedUIMBICov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BAJurisdiction)
    var limitFactor = this.getRateFactor( "bapUIMBILimit", cov.BAOwnedUIMBITerm, cov.BAJurisdiction.State, ratingDate )
    rateStateCovPerVehicle_impl(cov, getRateFactor( "bapUIMBIRate", "base", cov.BAJurisdiction.State, ratingDate ),
        \ baseRate, vehicle -> baseRate * limitFactor * getUWCompanyRateFactor(cov.BAJurisdiction.State))
  }

  private function rateBAOwnedUIMPDCov(cov : BAOwnedUIMPDCov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BAJurisdiction)
    var limitFactor = this.getRateFactor( "bapUIMPDLimit", cov.BAUIMPDLimitTerm, cov.BAJurisdiction.State, ratingDate )
    rateStateCovPerVehicle_impl(cov, getRateFactor( "bapUIMPDRate", "base", cov.BAJurisdiction.State, ratingDate ),
        \ baseRate, vehicle -> baseRate * limitFactor * getUWCompanyRateFactor(cov.BAJurisdiction.State))
  }

  private function rateBAOwnedUMBICov(cov : BAOwnedUMBICov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BAJurisdiction)
    var limitFactor = this.getRateFactor( "bapUMBILimit", cov.BAOwnedUMBITerm, cov.BAJurisdiction.State, ratingDate )
    rateStateCovPerVehicle_impl(cov, getRateFactor( "bapUMBIRate", "base", cov.BAJurisdiction.State, ratingDate ),
        \ baseRate, vehicle -> baseRate * limitFactor * getUWCompanyRateFactor(cov.BAJurisdiction.State))
  }

  private function rateBAOwnedUMPDCov(cov : BAOwnedUMPDCov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BAJurisdiction)
    var limitFactor = this.getRateFactor( "bapUMPDLimit", cov.BAUMPDLimitTerm, cov.BAJurisdiction.State, ratingDate )
    rateStateCovPerVehicle_impl(cov, getRateFactor( "bapUMPDRate", "base", cov.BAJurisdiction.State, ratingDate ),
        \ baseRate, vehicle -> baseRate * limitFactor * getUWCompanyRateFactor(cov.BAJurisdiction.State))
  }

  private function rateStateCovPerVehicle_impl(cov : BAStateCov, baseRate : BigDecimal, adjRateCalc(baseRate : BigDecimal, v : BusinessVehicle) : BigDecimal) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var vehicles = cov.BAJurisdiction.BALine.Vehicles
                      .where( \ v -> v.Location.State == StateJurisdictionMappingUtil.getStateMappingForJurisdiction(cov.BAJurisdiction.State ))
    for ( vehicle in vehicles )
    {
      var cost = new BAStateCovVehicleCostData(start, end, cov.Currency, RateCache, cov.BAJurisdiction, cov.FixedId, vehicle.FixedId)
      cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
      cost.Basis = 1
      cost.ActualBaseRate = baseRate

      cost.ActualAdjRate = adjRateCalc(baseRate, vehicle)
      cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
      addCost(cost)
    }
  }

  private function rateBAHiredCollisionCov(cov : BAHiredCollisionCov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BALine)
    for (jurisdiction in cov.BALine.HiredAutoJurisdictions) {
      var baseRate = getRateFactor( "bapHiredAutoCollRate", "base", jurisdiction.State, ratingDate )
      var adjRate = baseRate * getUWCompanyRateFactor(jurisdiction.State)
      rateLineCovByState_Impl(cov, baseRate, adjRate, jurisdiction)
    }
  }

  private function rateBAHiredCompCov(cov : BAHiredCompCov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BALine)
    for (jurisdiction in cov.BALine.HiredAutoJurisdictions) {
      var baseRate = getRateFactor( "bapHiredAutoCompRate", "base", jurisdiction.State, ratingDate )
      var adjRate = baseRate * getUWCompanyRateFactor(jurisdiction.State)
      rateLineCovByState_Impl(cov, baseRate, adjRate, jurisdiction)
    }
  }

  private function rateBAHiredLiabilityCov(cov : BAHiredLiabilityCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BALine)

    for (jurisdiction in cov.BALine.HiredAutoJurisdictions) {
      var cost = new BALineCovCostData(start, end, cov.Currency, RateCache, jurisdiction, cov.FixedId, null)
      // Manipulate the basis accordingly
      cost.Basis = jurisdiction.HiredAutoBasis.Basis
      if ( cost.Basis == null ) {
        cost.Basis = 0  // Fix for case of "If Any" or otherwise not filled out
      }
      cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
      cost.ActualBaseRate = getRateFactor( "bapHiredAutoLiabRate", "base", jurisdiction.State, ratingDate )
      cost.ActualAdjRate = cost.ActualBaseRate * getUWCompanyRateFactor(jurisdiction.State)
      cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
      addCost(cost)
    }
  }

  private function rateBAHiredUIMCov(cov : BAHiredUIMCov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BALine)
    for (jurisdiction in cov.BALine.HiredAutoJurisdictions) {
      var baseRate = getRateFactor( "bapHiredAutoUIMRate", "base", jurisdiction.State, ratingDate )
      var adjRate = baseRate * getUWCompanyRateFactor(jurisdiction.State)
      rateLineCovByState_Impl(cov, baseRate, adjRate, jurisdiction)
    }
  }

  private function rateBAHiredUMCov(cov : BAHiredUMCov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BALine)
    for (jurisdiction in cov.BALine.HiredAutoJurisdictions) {
      var baseRate = getRateFactor( "bapHiredAutoUMRate", "base", jurisdiction.State, ratingDate )
      var adjRate = baseRate * getUWCompanyRateFactor(jurisdiction.State)
      rateLineCovByState_Impl(cov, baseRate, adjRate, jurisdiction)
    }
  }

  private function rateBANonownedLiabCov(cov : BANonownedLiabCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BALine)
    for (jurisdiction in cov.BALine.NonOwnedJurisdictions) {
      var nonOwnedBasis = jurisdiction.NonOwnedBasis
      for ( ctype in typekey.BANonOwnedLiabCovCostType.getTypeKeys( false ) ) {
        if ( nonOwnedBasis != null and getBasisByType(nonOwnedBasis, ctype) > 0 ) {
          var cost = new BALineCovNonownedCostData(start, end, cov.Currency, RateCache, jurisdiction, cov.FixedId, ctype)
          cost.NumDaysInRatedTerm = NumDaysInCoverageRatedTerm
          cost.Basis = getBasisByType(jurisdiction.NonOwnedBasis, ctype )
          cost.ActualBaseRate = getRateFactor( "bapNonOwnedAutoLiabRate", "base", jurisdiction.State, ratingDate )
          cost.ActualAdjRate = cost.ActualBaseRate * getUWCompanyRateFactor(jurisdiction.State)
          cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
          addCost(cost)
        }
      }
    }
  }

  private function rateLineCovByState_Impl(cov : BusinessAutoCov, baseRate : BigDecimal, adjRate : BigDecimal, jurisdiction : BAJurisdiction) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BALineCovCostData(start, end, cov.Currency, RateCache, jurisdiction, cov.FixedId, null)
    cost.Basis = 1
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.ActualBaseRate = baseRate
    cost.ActualAdjRate = adjRate
    cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  private function rateStatePIPCov_Impl(cov : BAStateCov, baseRate : BigDecimal,
          adjRate : BigDecimal, vehicle : BusinessVehicle,  costType : typekey.BAStateCovPIPCostType) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BAStateCovVehiclePIPCostData(start, end, cov.Currency, RateCache, cov.BAJurisdiction, cov.FixedId, vehicle.FixedId, costType)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis = 1
    cost.ActualBaseRate = baseRate
    cost.ActualAdjRate = adjRate
    cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  private function rateCAPIP_NJ(cov : CAPIP_NJ) {
    var vehicles = cov.BAJurisdiction.BALine.Vehicles.where( \ v -> v.Location.State == typekey.State.TC_NJ  )
    for ( vehicle in vehicles )
    {
      rateCAPIPBasicNJ(cov, vehicle)
      if (cov.PIPNJ_OTHER_LIMSTerm.PackageValue.PackageCode <> "PIPNJ_BASE0") {
        rateCAPIPOptionalNJ(cov, vehicle)
      }
    }
  }

  private function rateCAPIPBasicNJ(cov : CAPIP_NJ, vehicle : entity.BusinessVehicle) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, vehicle)
    var liabilityRate       = this.getRateFactor( "papLiabilityRate", "base", typekey.Jurisdiction.TC_NJ, ratingDate )
    var liability100KFactor = this.getRateFactor( "papLiabLimit", "100K", typekey.Jurisdiction.TC_NJ, ratingDate )
    var baseRate = liabilityRate * liability100KFactor

    var lookup = cov.PIPNJ_MEDLIMITTerm.OptionValue.OptionCode + "/" + cov.PIPNJ_MEDDEDUCTTerm.OptionValue.OptionCode
    var pipFactor          = this.getRateFactor( "papPIPrate", "base", typekey.Jurisdiction.TC_NJ, ratingDate )
    var pipSecondaryFactor = this.getRateFactor( "papPBuIPStack", cov.PIPNJ_MEDsecondaryTerm.ValueAsString, typekey.Jurisdiction.TC_NJ, ratingDate )
    //this.getRateFactor( "papPIPTortLimit", cov.BAPipNJTortLimitTerm, typekey.State.TC_NJ, ratingDate )
    var acceptMedOnly = "decline"
    if (cov.PIPNJ_MEDONLYTerm.Value) { acceptMedOnly = "accept"}
    var medFactor          = new RateAdjFactorSearchCriteria( "papPIPLimit", _baseRatingDate)
                               .match( lookup, acceptMedOnly,  typekey.Jurisdiction.TC_NJ )
    var adjRate = baseRate
                    * pipFactor
                    * pipSecondaryFactor
                    * medFactor
                    * getUWCompanyRateFactor(vehicle, ratingDate)
    rateStatePIPCov_Impl( cov, baseRate, adjRate, vehicle, typekey.BAStateCovPIPCostType.TC_BASIC )
  }

  private function rateCAPIPOptionalNJ(cov : CAPIP_NJ, vehicle : entity.BusinessVehicle) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, vehicle)
    var baseRate = new RateAdjFactorSearchCriteria( "papPIPOption", ratingDate )
                     .match( cov.PIPNJ_OTHER_LIMSTerm.PackageValue.PackageCode, typekey.Jurisdiction.TC_NJ)
    var adjRate = baseRate * getUWCompanyRateFactor(vehicle, ratingDate)
    rateStatePIPCov_Impl( cov, baseRate, adjRate, vehicle, typekey.BAStateCovPIPCostType.TC_OPTIONAL)
  }

  private function rateCAPIP_KY(cov : CAPIP_KY) {
    var vehicles = cov.BAJurisdiction.BALine.Vehicles.where( \ v -> v.Location.State == typekey.State.TC_KY  )
    for ( vehicle in vehicles )
    {
      var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, vehicle)
      var liabilityRate       = this.getRateFactor( "papLiabilityRate", "base", typekey.Jurisdiction.TC_KY, ratingDate )
      var liability100KFactor = this.getRateFactor( "papLiabLimit", "100K", typekey.Jurisdiction.TC_KY, ratingDate )
      var baseRate = liabilityRate * liability100KFactor

      var limitFactor : BigDecimal = 1.0
      var pipFactor        = this.getRateFactor( "papPIPrate", "base", typekey.Jurisdiction.TC_KY, ratingDate )
      if (cov.PIPKY_GuestONLYTerm.Value == null or !cov.PIPKY_GuestONLYTerm.Value) {
        limitFactor      = this.getRateFactor( "papPIPLimit", cov.PIPKY_AggLimitTerm.ValueAsString, typekey.Jurisdiction.TC_KY, ratingDate )
      }
      var adjRate = baseRate * pipFactor * limitFactor
                      * getUWCompanyRateFactor(vehicle, ratingDate)
      rateStatePIPCov_Impl( cov, baseRate, adjRate, vehicle, typekey.BAStateCovPIPCostType.TC_BASIC)
    }
  }

  private function rateCA_PIP_AR(cov : CA_PIP_AR) {
    var vehicles = cov.BAJurisdiction.BALine.Vehicles.where( \ v -> v.Location.State == typekey.State.TC_AR  )
    for ( vehicle in vehicles )
    {
      //rate for death benefit
      var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, vehicle)
      var baseRate = this.getRateFactor( "bapPIPDeathCovRate", "base", typekey.Jurisdiction.TC_AR, ratingDate )
      //rate wage loss
      if (cov.BAPIP_AR_WorkLossTerm.Value) {
        baseRate = baseRate + this.getRateFactor( "bapPIPWageCovRate", "base", typekey.Jurisdiction.TC_AR, ratingDate )
      }
      //rate med
      // this ALWAYS rates to zero, so skip it
      //baseRate = this.getRateFactor( "bapPIPMedCovARRate", "base", typekey.State.TC_AR, ratingDate )
      var adjRate = baseRate * getUWCompanyRateFactor(vehicle, ratingDate)
      rateStatePIPCov_Impl( cov, baseRate, adjRate, vehicle, typekey.BAStateCovPIPCostType.TC_BASIC)
    }
  }

  private function rateVehicleCov(cov : BusinessVehicleCov) {
    switch(typeof cov) {
      case BACollisionCov:     rateBACollisionCov(cov)
                               break
      case BAComprehensiveCov: rateBAComprehensiveCov(cov)
                               break
      case BARentalCov:        rateBARentalCov(cov)
                               break
      case BATowingLaborCov:   rateBATowingLaborCov(cov)
                               break
      default : PCFinancialsLogger.logDebug( "Not rating ${(typeof cov)}")
    }
  }

  private function rateBACollisionCov(cov : BACollisionCov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.Vehicle)
    var baseRate = this.getRateFactor( "bapCollRate", "base",
        JurisdictionMappingUtil.getJurisdiction(cov.Vehicle.Location), ratingDate )
    var deductibleFactor = this.getRateFactor( "bapCollDeductible", cov.BACollisionDeductTerm,
        JurisdictionMappingUtil.getJurisdiction(cov.Vehicle.Location), ratingDate )
    var adjRate = baseRate
                    * deductibleFactor
                    * getAntiTheftDiscountFactor(cov.Vehicle, ratingDate)
                    * getAgeFactor(cov.Vehicle, ratingDate)
                    * getCostNewFactor(cov.Vehicle, ratingDate)
                    * getUWCompanyRateFactor(cov.Vehicle, ratingDate)
    rateVehicleCov_impl( cov, baseRate, adjRate )
  }

  private function rateBAComprehensiveCov(cov : BAComprehensiveCov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.Vehicle)
    var baseRate = this.getRateFactor( "bapCompRate", "base",
        JurisdictionMappingUtil.getJurisdiction(cov.Vehicle.Location), ratingDate )

    var deductibleFactor = this.getRateFactor( "bapCompDeductible", cov.BAComprehensiveDdctTerm,
        JurisdictionMappingUtil.getJurisdiction(cov.Vehicle.Location), ratingDate )
    var adjRate = baseRate
                    * deductibleFactor
                    * getAntiLockBrakesDiscountFactor(cov.Vehicle, ratingDate)
                    * getSafeDrivingCertDiscountFactor(cov.Vehicle, ratingDate)
                    * getAgeFactor(cov.Vehicle, ratingDate)
                    * getCostNewFactor(cov.Vehicle, ratingDate)
                    * getUWCompanyRateFactor(cov.Vehicle, ratingDate)
    rateVehicleCov_impl( cov, baseRate, adjRate )
  }

  private function rateBARentalCov(cov : BARentalCov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.Vehicle)
    var baseRate = this.getRateFactor( "bapRentalRate", "base",
        JurisdictionMappingUtil.getJurisdiction(cov.Vehicle.Location), ratingDate )
    var adjRate = baseRate * getUWCompanyRateFactor(cov.Vehicle, ratingDate)
    rateVehicleCov_impl( cov, baseRate, adjRate )
  }

  private function rateBATowingLaborCov(cov : BATowingLaborCov) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.Vehicle)
    var baseRate = this.getRateFactor( "bapTowingRate", "base",
        JurisdictionMappingUtil.getJurisdiction(cov.Vehicle.Location), ratingDate)
    var adjRate = baseRate * getUWCompanyRateFactor(cov.Vehicle, ratingDate)
    rateVehicleCov_impl( cov, baseRate, adjRate )
  }

  protected override function rateWindow(lineVersion : BusinessAutoLine) {
    rateCancellationShortRatePenalty(lineVersion)
    rateMinimumPremium(lineVersion)
    rateStateTaxes(lineVersion)
  }

  private function rateCancellationShortRatePenalty(lineVersion : BusinessAutoLine) {
    var jurisMap = getRepresentativeJurisdictionAutoMap(lineVersion)
    if ( lineVersion.Branch.RefundCalcMethod == "shortrate" ) { // context.CancelMethod returns null if the period is not canceled
      var basesMap = getAmountSumByState( getCostsUpToRatedOrder( "CancelShortRatePenalty" ) )
      for ( st in basesMap.Keys ) {
        var subtotal = basesMap.get( st )
        if ( subtotal != 0 ) {
          var cost = new BAJurisdictionCostData(lineVersion.Branch.PeriodStart, lineVersion.Branch.PeriodEnd, lineVersion.Branch.PreferredSettlementCurrency, RateCache, "CancelShortRatePenalty",
          jurisMap.get(st).first(), "CancelShortRatePenalty", "NonStdPremium", "Premium")
          cost.NumDaysInRatedTerm = lineVersion.Branch.NumDaysInPeriod
          cost.Basis              = subtotal
          cost.ActualBaseRate            = ShortRatePenaltyRate
          cost.ActualAdjRate      = cost.ActualBaseRate
          cost.ActualTermAmount         = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
          cost.ActualAmount             = cost.ActualTermAmount
          addCost(cost)
        }
      }
    }
  }

  private function rateMinimumPremium(lineVersion : BusinessAutoLine) {
    if (lineVersion.Branch.RefundCalcMethod != "flat" ) {  // context.CancelMethod returns null if the period is not canceled
      var subtotal = getCostsUpToRatedOrder( "MinimumPremium" ).sum(\c -> c.ActualAmount)
      var minPremium = 435bd.ofCurrency(lineVersion.Branch.PreferredSettlementCurrency) // Use a sample value for the policy-level minimum premium
      if ( subtotal < minPremium ) { 
        var jur = lineVersion.maybeAddJurisdiction(lineVersion.BaseState)
        var cost = new BAMinimumPremiumCostData(lineVersion.Branch.PeriodStart, lineVersion.Branch.PeriodEnd, lineVersion.Branch.PreferredSettlementCurrency, RateCache, jur)
        cost.NumDaysInRatedTerm = lineVersion.Branch.NumDaysInPeriod
        cost.Basis              = subtotal
        cost.ActualBaseRate     = minPremium
        cost.ActualAdjRate      = cost.ActualBaseRate
        cost.ActualTermAmount   = cost.ActualAdjRate - cost.Basis
        cost.ActualAmount       = cost.ActualTermAmount
        addCost(cost)
      }
    }
  }

  private function rateStateTaxes(lineVersion : BusinessAutoLine) {
    var jurisMap = getRepresentativeJurisdictionAutoMap(lineVersion)
    var basesMap = getAmountSumByState( getCostsUpToRatedOrder( "StateTax" ) )
    for ( st in basesMap.Keys ) {
      var subtotal = basesMap.get( st )
      if ( subtotal != 0 ) {
        var jurisdictions = jurisMap.get(st)
        //var jurisdictionFixedId = jurisdictions*.FixedId.max() // get the latest
        var cost = new BAJurisdictionCostData(lineVersion.Branch.PeriodStart, lineVersion.Branch.PeriodEnd, TaxRatingCurrency, RateCache, "StateTax",
            jurisMap.get(st).first(), "StateTax", "TaxSurcharge", "Taxes")
        cost.NumDaysInRatedTerm = lineVersion.Branch.NumDaysInPeriod
        cost.Basis              = subtotal
        cost.ActualBaseRate            = getStateTaxRate( st )
        cost.ActualAdjRate      = cost.ActualBaseRate
        cost.ActualTermAmount         = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
        cost.ActualAmount             = cost.ActualTermAmount

        var effectiveDates = jurisdictions.flatMap(\ b -> b.VersionList.AllVersions*.EffectiveDate.toList())
        var expirationDates = jurisdictions.flatMap(\ b -> b.VersionList.AllVersions*.ExpirationDate.toList())
        cost.EffectiveDate = effectiveDates.min()
        cost.ExpirationDate = expirationDates.max()
        addCost(cost)
      }
    }
  }

  /**
   * Returns all BACosts that have a rated order priority less than the supplied ratedOrder.
   */
  private function getCostsUpToRatedOrder( ratedOrder : BARatedOrderType ) : List<BACostData>
  {
    return CostDatas.cast(BACostData).where( \ c -> c.RatedOrder.Priority < ratedOrder.Priority )
  }

  /**
   * Returns a map of state to the amount sum of the costs in that state.  If no costs are in that
   * state, the map returns 0.
   */
  private function getAmountSumByState(cDatas : List<BACostData>) : Map<Jurisdiction, BigDecimal> {
    return cDatas.partition( \ c -> c.JurisdictionArg.State ).mapValues( \ s -> s.sum(\c -> c.ActualAmountBilling.Amount) ).toAutoMap( \ s -> BigDecimal.ZERO )
  }

  private function rateVehicleCov_impl(cov : BusinessVehicleCov, baseRate : BigDecimal, adjRate : BigDecimal) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var jur = cov.Vehicle.BALine.getJurisdiction(JurisdictionMappingUtil.getJurisdiction(cov.Vehicle.Location))
    var cost = new BusinessVehicleCovCostData(start, end, cov.Currency, RateCache, jur, cov.FixedId, cov.Vehicle.FixedId)
//    cost.RatedOrder         = "CoveragePremium" // AHK - This is currently set when the cost is created; maybe it should live on BACostData instead
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis              = 1 // 1 vehicle
    cost.ActualBaseRate = baseRate
    cost.ActualAdjRate = adjRate
    cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  // -------------------------- Support Functions

  private function getUWCompanyRateFactor(state : Jurisdiction) : BigDecimal {
    return Branch.getUWCompanyRateFactor( _baseRatingDate, state )
  }

  private property get RoundingLevel() : int {
    return Branch.Policy.Product.QuoteRoundingLevel
  }

  private property get RoundingMode() : RoundingMode {
    return Branch.Policy.Product.QuoteRoundingMode
  }

  protected function getRateFactor( factorName : String, term : PackageCovTerm, state : Jurisdiction, ratingDate : Date ) : BigDecimal
  {
    return getRateFactor( factorName, term.PackageValue.PackageCode, state, ratingDate )
  }

  protected function getRateFactor( factorName : String, term : OptionCovTerm, state : Jurisdiction, ratingDate : Date ) : BigDecimal
  {
    return getRateFactor( factorName, term.OptionValue.OptionCode, state, ratingDate )
  }

  protected function getRateFactor( factorName : String, term : TypekeyCovTerm, state : Jurisdiction, ratingDate : Date ) : BigDecimal
  {
    return getRateFactor( factorName, term.Value.Code, state, ratingDate )
  }

  protected function getRateFactor( factorName : String, lookup : String, state : Jurisdiction, ratingDate : Date ) : BigDecimal
  {
    return new RateAdjFactorSearchCriteria( factorName, ratingDate ).match( lookup, state )
  }

  /**
   * Returns a map of State to BAJurisdiction where the jurisdiction is the first version
   * that ever existed in this line (in window version).  The map has the side-effect
   * that it creates a new BAJurisdiction on the line if asked for a state that it
   * does not contain.  This is useful for the uncommon case where a jurisdiction no
   * longer exists, but there are costs that need to be attributed to it.  This is a
   * bit dangerous so USE IT WITH CARE.
   */
  private function getRepresentativeJurisdictionAutoMap(lineVersion : BusinessAutoLine) : Map<Jurisdiction, List<BAJurisdiction>>
  {
    return lineVersion.VersionList.Jurisdictions.map( \ jurisVL -> jurisVL.AllVersions.first() )
      .partition( \ j -> j.State ).toAutoMap( \ st -> {return {createJurisdiction( lineVersion, st)}} )
  }

  /**
   * Create a jurisdiction on this business auto line and log a warning.
   */
  private function createJurisdiction( lineVersion : BusinessAutoLine, st : Jurisdiction ) : BAJurisdiction
  {
    var juris = lineVersion.addJurisdiction( st )
    PCFinancialsLogger.logWarning( "There are costs associated with " + st + " but the jurisdiction is missing.  Created new jurisdiction:" + juris.ID )
    return juris
  }

  private function getBasisByType( basis : BANonOwnedBasis, ctype : typekey.BANonOwnedLiabCovCostType ) : int
  {
    switch( ctype )
    {
      case typekey.BANonOwnedLiabCovCostType.TC_EMPLOYEES:
        return basis.NumEmployees
      case typekey.BANonOwnedLiabCovCostType.TC_PARTNERS:
        return basis.NumPartners
      case typekey.BANonOwnedLiabCovCostType.TC_VOLUNTEERS:
        return basis.NumVolunteers
      default:
        throw "Unknown type of BANonOwnedLiabCovCostType: " + ctype
    }
  }

  private function getRadiusFactor(vehicle : BusinessVehicle, ratingDate : Date) : BigDecimal
  {
    return new RateAdjFactorSearchCriteria( "bapVehicleRadius", ratingDate )
             .match( vehicle.VehicleRadius.Code, JurisdictionMappingUtil.getJurisdiction(vehicle.Location ))
  }

  private function getAntiLockBrakesDiscountFactor(vehicle : BusinessVehicle, ratingDate : Date) : BigDecimal
  {
    var antiLockBrakes = vehicle.BusinessVehicleModifiers.firstWhere(\ mod -> mod.Pattern.Code == "BAVehAntiLockBrakes").BooleanModifier
    return getVehicleDriverDiscountFactor( vehicle, ratingDate, antiLockBrakes, "bapAntiLockBrakesMod" )
  }

  private function getAntiTheftDiscountFactor(vehicle : BusinessVehicle, ratingDate : Date) : BigDecimal
  {
    var antiTheft = (vehicle.BusinessVehicleModifiers.firstWhere(\ mod -> mod.Pattern.Code == "BAVehAntiTheft").TypeKeyModifier <> null)
    return getVehicleDriverDiscountFactor( vehicle, ratingDate, antiTheft, "bapAntiTheftMod" )
  }

  private function getSafeDrivingCertDiscountFactor(vehicle : BusinessVehicle, ratingDate : Date) : BigDecimal
  {
    var safeDrivingCert = vehicle.BusinessVehicleModifiers.firstWhere(\ mod -> mod.Pattern.Code == "BAVehSafeDriver").BooleanModifier
    return getVehicleDriverDiscountFactor( vehicle, ratingDate, safeDrivingCert, "bapSafeDrivingMod" )
  }

  private function getVehicleDriverDiscountFactor( vehicle : BusinessVehicle, ratingDate : Date, isFactorTrue : boolean, factorName : String ) : BigDecimal
  {
    if (isFactorTrue) {
      return new RateAdjFactorSearchCriteria( factorName, ratingDate ).match( JurisdictionMappingUtil.getJurisdiction(vehicle.Location ))
    }
    return 1.0
  }

  private function getAgeFactor(vehicle : BusinessVehicle, ratingDate : Date) : BigDecimal
  {
    // For the newest model year, this could give 0 or -1 (for a 2006 model year in 2005)
    var age = (vehicle.Year != null ? ratingDate.YearOfDate - vehicle.Year : null)
    return new RateAdjFactorSearchCriteria( "bapVehicleAge", ratingDate ).matchInRange( age, JurisdictionMappingUtil.getJurisdiction(vehicle.Location) )
  }

  private function getCostNewFactor(vehicle : BusinessVehicle, ratingDate : Date) : BigDecimal
  {
    return new RateAdjFactorSearchCriteria( "bapVehicleCostNew", ratingDate ).matchInRange( vehicle.CostNew as Number, JurisdictionMappingUtil.getJurisdiction(vehicle.Location) )
  }

  private function getUWCompanyRateFactor(vehicle : BusinessVehicle, ratingDate : Date) : BigDecimal
  {
    return vehicle.BALine.Branch.getUWCompanyRateFactor( ratingDate, JurisdictionMappingUtil.getJurisdiction(vehicle.Location) )
  }
}
