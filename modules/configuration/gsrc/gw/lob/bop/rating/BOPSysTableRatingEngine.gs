package gw.lob.bop.rating

uses gw.api.domain.financials.PCFinancialsLogger
uses gw.api.util.JurisdictionMappingUtil
uses gw.rating.AbstractRatingEngine
uses gw.rating.CostData

uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.lang.Iterable
uses java.util.Date
uses java.util.Set
uses entity.windowed.BOPBuildingVersionList
uses entity.windowed.BOPBuildingCovVersionList
uses entity.windowed.BOPBuildingCovCostVersionList
uses entity.windowed.BOPCovBuildingCostVersionList
uses entity.windowed.BOPLocationCovVersionList
uses entity.windowed.BOPLocationCovCostVersionList

@Export
class BOPSysTableRatingEngine extends AbstractRatingEngine<BOPLine> {
  var _baseRatingDate : Date

  construct(bopLineArg : BOPLine) {
    super(bopLineArg)
    // set the base Rating using the first policyperiod in the term.
    // this will be used for U/W lookup and other basic items
    // rating date by object will be set separately
    _baseRatingDate = bopLineArg.Branch.FirstPeriodInTerm.getReferenceDateForCurrentJob( bopLineArg.BaseState )

  }

  override protected function existingSliceModeCosts() : Iterable<Cost> {
    return PolicyLine.Costs.where(\c -> c typeis BOPBuildingCovCost or
                                   c typeis BOPCovBuildingCost or
                                   c typeis BOPCovCost or
                                   c typeis BOPLocationCovCost or
                                   c typeis BOPMoneySecCovCost)
  }

    // Used by the extractCostDatasFromExistingCosts method.  Must be implemented if that method is going to be called
  override protected function createCostDataForCost(c : Cost) : CostData {
    switch(typeof c) {
      case BOPBuildingCovCost:  return new BOPBuildingCovCostData(c, RateCache)
      case BOPCovBuildingCost:  return new BOPCovBuildingCostData(c, RateCache)
      case BOPCovCost:          return new BOPCovCostData(c, RateCache)
      case BOPLocationCovCost:  return new BOPLocationCovCostData(c, RateCache)
      case BOPMoneySecCovCost:  return new BOPMoneySecCovCostData(c, RateCache)
      default: throw "Unepxected cost type ${c.DisplayName}"
    }
  }

  protected override function rateSlice(lineVersion : BOPLine) {
    assertSliceMode(lineVersion)
    var logMsg = "Rating ${lineVersion} ${lineVersion.SliceDate} version..."
    PCFinancialsLogger.logInfo( logMsg  )
     if (lineVersion.Branch.isCanceledSlice()) {
       // Do nothing if this is a canceled slice
     } else {
       // Rate line-level coverages
       for (cov in lineVersion.BOPLineCoverages) {
         rateLineCoverage(cov)
       }

       for (location in lineVersion.BOPLocations) {
         for (cov in location.Coverages) {
           rateLocationCoverage(cov)
         }

         for (building in location.Buildings) {
           for (cov in building.Coverages) {
             rateBuildingCoverage(cov)
           }
         }
       }
    }
    PCFinancialsLogger.logInfo( logMsg + "done" )
  }

  override function preLoadCostArrays() {
    var locations = PolicyLine.VersionList.BOPLocations
    locations.arrays<BOPLocationCovVersionList>("Coverages")
             .arrays<BOPLocationCovCostVersionList>("Costs")

    var buildings = locations.arrays<BOPBuildingVersionList>("Buildings")
    buildings.arrays<BOPCovBuildingCostVersionList>("Costs")

    buildings.arrays<BOPBuildingCovVersionList>("Coverages")
             .arrays<BOPBuildingCovCostVersionList>("Costs")
  }

  private function rateLineCoverage(cov : BusinessOwnersCov) {
    switch(typeof cov) {
      case BOPEmpDisCov :    rateBOPEmpDisCov(cov)
                             break
      case BOPForgeAltCov :  rateBOPForgeAltCov(cov)
                             break
      case BOPLiabilityCov : rateBOPLiabilityCov(cov)
                             break
      default : PCFinancialsLogger.logDebug( "Not rating ${(typeof cov)}")
    }
  }

  private function rateBOPEmpDisCov(cov : BOPEmpDisCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPCovCostData(start, end, cov.Currency, RateCache, cov.BOPLine.BaseState, cov.FixedId)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis              = (cov.BOPEmpDisNumEmpTerm.Value == null ? 0 : cov.BOPEmpDisNumEmpTerm.Value)
    //get rating date for this coverage  and line
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, _line)
    cost.ActualBaseRate     = 2.5
    cost.ActualAdjRate      = cost.ActualBaseRate * getEmpDishonestyRate(cov) * getUWCompanyRateFactor(cov.BOPLine)
    cost.ActualTermAmount   = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  private function getEmpDishonestyRate(cov : BOPEmpDisCov) : BigDecimal {
    var limit = cov.BOPEmpDisLimitTerm.OptionValue
    switch( limit ) {
      case "5000"  : return 0.6
      case null    : // drops through
      case "10000" : return 1.0
      case "25000" : return 2.0
      case "50000" : return 4.4
      case "100000": return 8.8
    }
    PCFinancialsLogger.logDebug( "Employee dishonesty limit not found: " + limit + ", returning 1.0 rate factor." )
    return 1.0
  }

  private function rateBOPForgeAltCov(cov : BOPForgeAltCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPCovCostData(start, end, cov.Currency, RateCache, cov.BOPLine.BaseState, cov.FixedId)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis              = 1.0
    //get rating date for this coverage  and line
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, _line)
    cost.ActualBaseRate     = 700
    cost.ActualAdjRate      = cost.ActualBaseRate * getForgeryLimitRate(cov) * getUWCompanyRateFactor(cov.BOPLine)
    cost.ActualTermAmount   = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  function getForgeryLimitRate(cov : BOPForgeAltCov) : BigDecimal {
    var limit = cov.BOPForgeAltLimitTerm.OptionValue
    switch( limit ) {
      case "5000" : return 0.6
      case null   : // drops through
      case "10000": return 1.0
      case "25000": return 2.3
      case "50000": return 4.0
    }
    PCFinancialsLogger.logDebug( "Forgery limit '" + limit + "' not found; using default 1.0 factor." )
    return 1.0
  }

  private function rateBOPLiabilityCov(cov : BOPLiabilityCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    for ( building in cov.BOPLine.BOPLocations*.Buildings ) {
      var cost = new BOPCovBuildingCostData(start, end, cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(building.BOPLocation.Location), cov.FixedId, building.FixedId)
      cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
      cost.Basis   = (building.ClassCode.Basis.Description == "Liability Limit" ? getLiabilityBasis(cov) : building.BasisAmount)
      //get rating date for this coverage  and line
      //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, _line)
      cost.ActualBaseRate = 0.180
      cost.ActualAdjRate    = cost.ActualBaseRate * getLiabilityIncrAggFactor(cov) * getUWCompanyRateFactor(cov.BOPLine)
      cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate * getEUFactor( building ) ).setScale( this.RoundingLevel, this.RoundingMode )
      addCost(cost)
    }
  }

  function getLiabilityBasis(cov : BOPLiabilityCov) : BigDecimal
  {
    var limit = cov.BOPLiabilityTerm.PackageValue
    switch( limit )
    {
      case null:
      case "300/600/600"   : // drops through
      case "300/900/600"   : return 300000
      case "500/1000/1000" : // drops through
      case "500/1500/1000" : return 500000
      case "1000/2000/2000": // drops through
      case "1000/3000/2000": return 1000000
      case "2000/4000/4000": // drops through
      case "2000/6000/4000": return 2000000
    }
    PCFinancialsLogger.logDebug( "Liability limit '" + limit + "' not found; using default 300000 basis." )
    return 300000
  }

  function getLiabilityIncrAggFactor(cov : BOPLiabilityCov) : BigDecimal
  {
    var limit = cov.BOPLiabilityTerm.PackageValue
    switch( limit )
    {
      case null:
      case "300/600/600"   : // drops through
      case "500/1000/1000" : // drops through
      case "1000/2000/2000": // drops through
      case "2000/4000/4000": return 1.0
      case "300/900/600"   : // drops through
      case "500/1500/1000" : // drops through
      case "1000/3000/2000": // drops through
      case "2000/6000/4000": return 1.1
    }
    PCFinancialsLogger.logDebug( "Liability limit '" + limit + "' not found; using default 1.0 factor." )
    return 1.0
  }

  function getEUFactor( building : BOPBuilding ) : BigDecimal
  {
    var euFactor = building.ClassCode.Basis.RateFactor
    if( building.ClassCode.Basis == null )
    {
      euFactor = 0.01
    }
    if( euFactor == null )
    {
      throw( "Missing RateFactor for building " + building + ". Please define it in the Class Code Basis system table." )
    }
    if( euFactor > 1 or euFactor < 0 )
    {
      throw( "Invalid RateFactor for building " + building + ": " + euFactor + " (must be between 0 and 1). Please define properly in the Class Code Basis system table." )
    }
    return euFactor
  }

  private function rateLocationCoverage(cov : BOPLocationCov) {
    switch(typeof cov) {
      case BOPMoneySecCov: rateBOPMoneySecCov(cov, true) // Note: We rate this coverage twice
                           rateBOPMoneySecCov(cov, false)
                           break
      case BOPOutSignCov:  rateBOPOutSignCov(cov)
                           break
      default : PCFinancialsLogger.logDebug( "Not rating ${(typeof cov)}")
    }
  }

  private function rateBOPMoneySecCov( cov : BOPMoneySecCov, onPremises : boolean ) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPMoneySecCovCostData(start, end, cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(cov.BOPLocation.Location), cov.FixedId, onPremises)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    //get rating date for this coverage  and BOPLocation
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BOPLocation)
    if ( onPremises ) {
      cost.Basis   = cov.BOPMoneyOnPremLimTerm.Value
      cost.ActualBaseRate = 0.0187
    } else {
      cost.Basis   = cov.BOPMoneyOffPremLimTerm.Value
      cost.ActualBaseRate = 0.0225
    }
    cost.ActualAdjRate = cost.ActualBaseRate * getUWCompanyRateFactor(cov.BOPLocation.BOPLine)
    cost.ActualTermAmount  = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  private function rateBOPOutSignCov(cov : BOPOutSignCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPLocationCovCostData(start, end, cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(cov.BOPLocation.Location), cov.FixedId)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis   = 1
    //get rating date for this coverage  and BOPLocation
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BOPLocation)
    cost.ActualBaseRate = 1
    cost.ActualAdjRate = cost.ActualBaseRate * getOutdoorSignsLimitRate(cov) * getUWCompanyRateFactor(cov.BOPLocation.BOPLine)
    cost.ActualTermAmount  = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  function getOutdoorSignsLimitRate(cov : BOPOutSignCov) : BigDecimal
  {
    var limit = cov.BOPOutdoorSignLimTerm.Value
    if( limit == null )
    {
      return 1.0
    }
    return limit * 0.004
  }

  private function rateBuildingCoverage(cov : entity.BOPBuildingCov) {
    switch(typeof cov) {
      case BOPBuildingCov:         rateBOPBuildingCov(cov)
                                   break
      case BOPBusIncPayrollCov:    rateBOPBusIncPayrollCov(cov)
                                   break
      case BOPMechBreakdownCov:    rateBOPMechBreakdownCov(cov)
                                   break
      case BOPPersonalPropCov:     rateBOPPersonalPropCov(cov)
                                   break
      case BOPReceivablesCov:      rateBOPReceivablesCov(cov)
                                   break
      case BOPTenantsLiabilityCov: rateBOPTenantsLiabilityCov(cov)
                                   break
      case BOPValuablePapersCov:   rateBOPValuablePapersCov(cov)
                                   break
    }
  }

  private function rateBOPBuildingCov(cov : BOPBuildingCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPBuildingCovCostData(start, end, cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(cov.BOPBuilding.BOPLocation.Location), cov.FixedId)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis = cov.BOPBldgLimTerm.Value
    //get rating date for this coverage  and BOPBuilding
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BOPBuilding)
    cost.ActualBaseRate = 0.136
    cost.ActualAdjRate = cost.ActualBaseRate
      * getConstructionFactor(cov.BOPBuilding)
      * getSprinklerFactor(cov.BOPBuilding)
      * getFireProtectionFactor(cov.BOPBuilding)
      * getValuationFactor(cov)
      * getBuildingDeductFactor(cov.BOPBuilding.BOPLocation.BOPLine)
      * getUWCompanyRateFactor(cov.BOPBuilding.BOPLocation.BOPLine)
    cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate / 100 ).setScale( this.RoundingLevel, this.RoundingMode ) // per $100 of coverage
    addCost(cost)
  }

  // This is used to look-up a rating factor for the valuation method
  function getValuationFactor(cov : BOPBuildingCov) : BigDecimal
  {
    var code = cov.BOPBldgValuationTerm.Value.Code
    switch( code )
    {
      case null      : // drops through
      case "ReplCost": return 1.0
      case "ActCost" : return 0.9
    }
    PCFinancialsLogger.logDebug( "Valuation method code '" + code + "' not found; using default 1.0 factor." )
    return 1.0
  }

  private function rateBOPBusIncPayrollCov(cov : BOPBusIncPayrollCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPBuildingCovCostData(start, end, cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(cov.BOPBuilding.BOPLocation.Location), cov.FixedId)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis = cov.BusIncomeOrdPayrollTerm.Value - 30  // first 30 days are free
    //get rating date for this coverage  and BOPBuilding
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BOPBuilding)
    cost.ActualBaseRate = 400
    cost.ActualAdjRate = cost.ActualBaseRate * getUWCompanyRateFactor(cov.BOPBuilding.BOPLocation.BOPLine)
    cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate / 30 ).setScale( this.RoundingLevel, this.RoundingMode ) // per 30 days of coverage
    addCost(cost)
  }

  private function rateBOPMechBreakdownCov(cov : BOPMechBreakdownCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPBuildingCovCostData(start, end, cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(cov.BOPBuilding.BOPLocation.Location), cov.FixedId)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis   = 1
    //get rating date for this coverage  and BOPBuilding
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BOPBuilding)
    cost.ActualBaseRate = getStdRate(cov)
    cost.ActualAdjRate = cost.ActualBaseRate * getUWCompanyRateFactor(cov.BOPBuilding.BOPLocation.BOPLine)
    cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  function getStdRate(cov : BOPMechBreakdownCov) : BigDecimal
  {
    if ( cov.BOPMechBreakdownLimTerm.Value < 100000 )
    {
      return 200
    }
    else
    {
      return 500
    }
  }

  private function rateBOPPersonalPropCov(cov : BOPPersonalPropCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPBuildingCovCostData(start, end, cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(cov.BOPBuilding.BOPLocation.Location), cov.FixedId)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis   = cov.BOPBPPBldgLimTerm.Value
    //get rating date for this coverage  and BOPBuilding
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BOPBuilding)
    cost.ActualBaseRate = 0.284
    cost.ActualAdjRate = cost.ActualBaseRate
      * getConstructionFactor(cov.BOPBuilding)
      * getFireProtectionFactor(cov.BOPBuilding)
      * getAlarmFactor(cov.BOPBuilding)
      * (cov.BOPBuilding.BOPBuildingCovExists ? getValuationFactor(cov.BOPBuilding.BOPBuildingCov) : 1.0)
      * getBuildingDeductFactor(cov.BOPBuilding.BOPLocation.BOPLine)
      * getUWCompanyRateFactor(cov.BOPBuilding.BOPLocation.BOPLine)
    cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate / 100 ).setScale( this.RoundingLevel, this.RoundingMode ) // per $100 of coverage
    addCost(cost)
  }

  private function rateBOPReceivablesCov(cov : BOPReceivablesCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPBuildingCovCostData(start, end, cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(cov.BOPBuilding.BOPLocation.Location), cov.FixedId)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis   = cov.BOPARonPremLimTerm.Value
    //get rating date for this coverage  and BOPBuilding
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BOPBuilding)
    cost.ActualBaseRate = 0.0036
    cost.ActualAdjRate = cost.ActualBaseRate * getUWCompanyRateFactor(cov.BOPBuilding.BOPLocation.BOPLine)
    cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  private function rateBOPTenantsLiabilityCov(cov : BOPTenantsLiabilityCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPBuildingCovCostData(start, end, cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(cov.BOPBuilding.BOPLocation.Location), cov.FixedId)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis   = getTenantsLiabLimitBasis(cov)
    //get rating date for this coverage  and BOPBuilding
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BOPBuilding)
    cost.ActualBaseRate =  0.03
    cost.ActualAdjRate = cost.ActualBaseRate * getUWCompanyRateFactor(cov.BOPBuilding.BOPLocation.BOPLine)
    cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate / 100 ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  function getTenantsLiabLimitBasis(cov : BOPTenantsLiabilityCov) : BigDecimal {
    var basis = cov.BOPTenantsLiabLimTerm.Value
    if( basis > 50000 )
    {
      basis = basis - 50000
    }
    return basis
  }

  private function rateBOPValuablePapersCov(cov : BOPValuablePapersCov) {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new BOPBuildingCovCostData(start, end, cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(cov.BOPBuilding.BOPLocation.Location), cov.FixedId)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.Basis   = cov.BOPValPaperOnPremLimTerm.Value
    //get rating date for this coverage  and BOPBuilding
    //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.BOPBuilding)
    cost.ActualBaseRate = 0.0036
    cost.ActualAdjRate = cost.ActualBaseRate * getUWCompanyRateFactor(cov.BOPBuilding.BOPLocation.BOPLine)
    cost.ActualTermAmount = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    addCost(cost)
  }

  protected override function rateWindow(lineVersion : BOPLine) {
    assertSliceMode(lineVersion)

    var logMsg = "Rating across policy term..."
    PCFinancialsLogger.logInfo( logMsg )
    rateAddlInsFlatCharges(lineVersion)
    rateMinimumPremium(lineVersion)
    rateTaxes(lineVersion)
    PCFinancialsLogger.logInfo( logMsg + "done" )
  }

  private function rateAddlInsFlatCharges(lineVersion : BOPLine) {
    if ( lineVersion.Branch.RefundCalcMethod != "flat" )  // context.CancelMethod returns null if the period is not canceled
    {
      for ( additionalInsured in getRepresentativeAdditionalInsureds(lineVersion) )
      {
        PCFinancialsLogger.logInfo( "Rating flat charges on '" +  additionalInsured + "'" )
        var cost = new BOPAddnlInsuredCostData(lineVersion.Branch.PeriodStart, lineVersion.Branch.PeriodEnd, lineVersion.PreferredCoverageCurrency, RateCache, lineVersion.BaseState, additionalInsured.FixedId)
        cost.NumDaysInRatedTerm = lineVersion.Branch.NumDaysInPeriod
        cost.Basis              = 1
        //get rating date for this coverage  and line
        //var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, _line)
        cost.ActualBaseRate            = 15
        cost.ActualAdjRate      = cost.ActualBaseRate
        cost.ActualTermAmount         = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
        cost.ActualAmount             = cost.ActualTermAmount
        addCost(cost)
      }
    }
  }

  private function getRepresentativeAdditionalInsureds(lineVersion : BOPLine) : Set<PolicyAddlInsured>
  {
    return lineVersion.Branch.VersionList.PolicyContactRoles.map( \ contactVL -> contactVL.AllVersions.first() )
      .whereTypeIs( PolicyAddlInsured ).where( \ addIns -> addIns.PolicyLine == lineVersion ).toSet()
  }

  private function rateMinimumPremium(lineVersion : BOPLine) {
    if( lineVersion.Branch.RefundCalcMethod != "flat" ) { // context.CancelMethod returns null if the period is not canceled
      var minPremium = 435bd.ofCurrency(lineVersion.Branch.PreferredSettlementCurrency)  // Use a sample value for the policy-level minimum premium
      var subtotal = CostDatas.sum(\c -> c.ActualAmount)

      if ( subtotal < minPremium ) {
        var cost = new BOPMinPremiumCostData(lineVersion.Branch.PeriodStart, lineVersion.Branch.PeriodEnd, lineVersion.Branch.PreferredSettlementCurrency, RateCache, lineVersion.BaseState)
        cost.NumDaysInRatedTerm = lineVersion.Branch.NumDaysInPeriod
        cost.Basis              = subtotal
        cost.ActualBaseRate            = minPremium
        cost.ActualAdjRate      = cost.ActualBaseRate
        cost.ActualTermAmount         = cost.ActualAdjRate - cost.Basis
        cost.ActualAmount             = cost.ActualTermAmount
        addCost(cost)
      }
    }
  }

  private function rateTaxes(lineVersion : BOPLine) {
    var taxBases = CostDatas
      .partition( \ cost -> (cost as BOPCostData).State )
      .mapValues( \ costs -> costs.sum(\c -> c.ActualAmountBilling.Amount)) // want this in settlement currency
    taxBases.eachKeyAndValue( \ state, basis -> rateTax( lineVersion, state, basis ) )
  }

  private function rateTax(lineVersion : BOPLine, state : Jurisdiction, basis : BigDecimal )
  {
    var cost = new BOPTaxCostData(lineVersion.Branch.PeriodStart, lineVersion.Branch.PeriodEnd, TaxRatingCurrency, RateCache, state)
    cost.NumDaysInRatedTerm = lineVersion.Branch.NumDaysInPeriod
    cost.Basis              = basis
    cost.ActualBaseRate            = getStateTaxRate( cost.State )
    cost.ActualAdjRate      = cost.ActualBaseRate
    cost.ActualTermAmount         = ( cost.Basis * cost.ActualAdjRate ).setScale( this.RoundingLevel, this.RoundingMode )
    cost.ActualAmount             = cost.ActualTermAmount
    addCost(cost)
  }

  // Generic BOP-Specific Helpers

  private function getUWCompanyRateFactor(line : BusinessOwnersLine) : BigDecimal {
    return line.Branch.getUWCompanyRateFactor(_baseRatingDate, line.BaseState.Code)
  }

  private property get RoundingLevel() : int {
    return Branch.Policy.Product.QuoteRoundingLevel
  }

  private property get RoundingMode() : RoundingMode {
    return Branch.Policy.Product.QuoteRoundingMode
  }

  private function getConstructionFactor(building : BOPBuilding) : BigDecimal
  {
    var construction = building.ConstructionType
    switch( construction )
    {
      case "F"  : return 1.0
      case "JM" : return 0.9
      case "NC" : return 0.9
      case "MNC": return 0.7
      case "R"  : return 0.6
    }
    PCFinancialsLogger.logDebug( "Construction type '" + construction + "' not found; using default 1.0 factor." )
    return 1.0
  }

  private function  getSprinklerFactor(building : BOPBuilding) : BigDecimal
  {
    var code = building.Building.SprinklerCoverage
    switch( code )
    {
      case null:
      case "0"  : return 1.0
      case "10" : return 1.0
      case "20" : return 1.0
      case "30" : return 1.0
      case "40" : return 1.0
      case "50" : return 1.0
      case "60" : return 0.98
      case "70" : return 0.95
      case "80" : return 0.90
      case "90" : return 0.80
      case "100": return 0.75
    }
    PCFinancialsLogger.logDebug( "Sprinkler coverage code '" + code + "' not found; using default 1.0 factor." )
    return 1.0
  }

  private function getFireProtectionFactor(building : BOPBuilding) : BigDecimal {
    var code = building.BOPLocation.Location.FireProtectClass
    switch( code )
    {
      case null: return 1.0
      case "1": return 0.8
      case "2": return 0.9
      case "3": return 1.0
      case "4": return 2.0
      case "5": return 3.0
    }
    PCFinancialsLogger.logDebug( "Fire protection code '" + code + "' not found; using default 1.0 factor." )
    return 1.0
  }

  private function getAlarmFactor(building : BOPBuilding) : BigDecimal {
    var code = building.Building.BuildingAlarmType
    switch( code )
    {
      case null     : return 1.5
      case "local"  : return 1.0
      case "central": // drops through
      case "police" : return 0.9
    }
    PCFinancialsLogger.logDebug( "Alarm code '" + code + "' not found; using default 1.5 factor." )
    return 1.5
  }

  private function getBuildingDeductFactor(line : BusinessOwnersLine) : BigDecimal
  {
    var ded = line.BOPPropertyCov.BOPPropBuildDedTerm.OptionValue.Description
    switch( ded )
    {
      case null:
      case "500"  : return 1.0
      case "1,000": return 0.98
      case "2,500": return 0.95
    }
    PCFinancialsLogger.logDebug( "Building deductible '" + ded + "' not found; using default 1.0 factor." )
    return 1.0
  }

}
