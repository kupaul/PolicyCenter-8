package gw.lob.pa.rating

uses gw.api.domain.covterm.PackageCovTerm
uses gw.api.domain.financials.PCFinancialsLogger
uses gw.api.productmodel.CoveragePattern
uses gw.api.util.JurisdictionMappingUtil
uses gw.financials.Prorater
uses gw.rating.AbstractRatingEngine
uses gw.rating.CostData
uses gw.rating.RateAdjFactorSearchCriteria

uses java.lang.Iterable
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.util.Date

@Export
class PASysTableRatingEngine extends AbstractRatingEngine<PersonalAutoLine> {

  var _baseRatingDate : Date

  construct(paLineArg : PersonalAutoLine) {
    super(paLineArg)
    // set the base Rating using the first policyperiod in the term.
    // this will be used for U/W lookup and other basic items
    // rating date by object will be set separately
    _baseRatingDate = paLineArg.Branch.FirstPeriodInTerm.getReferenceDateForCurrentJob( paLineArg.BaseState )
  }

  static function rate(paLineArg : PersonalAutoLine) {
    var engine = new PASysTableRatingEngine(paLineArg)
    engine.rate()
  }

  override function createCostDataForCost(c : Cost) : CostData {
    switch (typeof c) {
      case PersonalAutoCovCost: return new PersonalAutoCovCostData(c, RateCache)
      case PersonalVehicleCovCost: return new PersonalVehicleCovCostData(c, RateCache)
      case PersonalAutoPIPCovCost : return new PersonalAutoPIPCovCostData(c, RateCache)
      default : throw "Unknown cost type ${(typeof c).Name}"
    }
  }

  protected override function existingSliceModeCosts() : Iterable<Cost> {
    return PolicyLine.Costs.where(\ c -> c typeis PersonalVehicleCovCost or
                                    c typeis PersonalAutoCovCost or
                                    c typeis PersonalAutoPIPCovCost)
  }

  override protected function rateSlice(lineVersion : PersonalAutoLine) {
    assertSliceMode(lineVersion)
    var logMsg = "Rating ${lineVersion} ${lineVersion.SliceDate} version..."
    PCFinancialsLogger.logInfo(logMsg)
     if (lineVersion.Branch.isCanceledSlice()) {
       // Do nothing if this is a canceled slice
     } else {
       var vehicles = lineVersion.Vehicles

       // Rate line-level coverages per vehicle
       for (cov in lineVersion.PALineCoverages) {
         for (veh in vehicles) {
           rateLineCoverage(cov, veh)
         }
       }

       // Rate all vehicle level coverages
       for (veh in vehicles) {
         for (cov in veh.Coverages) {
           addCost(rateVehicleCoverage(cov))
         }
       }
    }
    PCFinancialsLogger.logInfo(logMsg + "done")
  }

  protected function rateLineCoverage(cov : PersonalAutoCov, vehicle : PersonalVehicle) {
    assertSliceMode(cov)
    switch (typeof cov) {
      case PALiabilityCov:  ratePALiabilityCov(cov, vehicle)
                            break
      case PAMedPayCov:     ratePAMedPayCov(cov, vehicle)
                            break
      case PAPIP_AR:        ratePAPIP_AR(cov, vehicle)
                            break
      case PAPIP_KY:        ratePAPIP_KY(cov, vehicle)
                            break
      case PAPIP_NJ:        ratePAPIP_NJ(cov, vehicle)
                            break
      case PAUIMBICov:      ratePAUIMBICov(cov, vehicle)
                            break
      case PAUMBICov:       ratePAUMBICov(cov, vehicle)
                            break
      case PAUMPDCov:       ratePAUMPDCov(cov, vehicle)
                            break
      default:
         PCFinancialsLogger.logDebug("Not rating ${(typeof cov)}")
    }
  }

  private function ratePALiabilityCov(cov : PALiabilityCov, vehicle : PersonalVehicle) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, PolicyLine)
    var baseRate = getRateFactor("papLiabilityRate", "base", ratingDate )
    var adjRate = baseRate
                   * getRateFactor("papLiabLimit", cov.PALiabilityTerm, ratingDate )
                   * getVehicleDriversRatingFactor(vehicle, ratingDate)
                   * getNoLossDiscountFactor(PolicyLine, ratingDate)
                   * getUWCompanyRateFactor(cov.PALine)
    addCost( rateLineCoverage_impl(cov, vehicle, baseRate, adjRate) )
  }

  private function ratePAMedPayCov(cov : PAMedPayCov, vehicle : PersonalVehicle)  {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, PolicyLine)
    var baseRate = getRateFactor("papMedPayLimit", cov.PAMedLimitTerm.OptionValue.OptionCode, ratingDate)
    var adjRate = baseRate
                   * getVehicleDriversRatingFactor(vehicle, ratingDate)
                   * getNoLossDiscountFactor(PolicyLine, ratingDate)
                   * getUWCompanyRateFactor(cov.PALine)
    addCost( rateLineCoverage_impl(cov, vehicle, baseRate, adjRate))
  }

  private function ratePAPIP_NJ(cov : PAPIP_NJ, vehicle : PersonalVehicle) {
    ratePAPIP_NJBasic(cov, vehicle)
    ratePAPIP_NJOptional(cov, vehicle)
  }

  private function ratePAPIP_NJBasic(cov : PAPIP_NJ, vehicle : PersonalVehicle) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, PolicyLine)
    var baseRate = getRateFactor("papLiabilityRate", "base", ratingDate)
                   * getRateFactor("papLiabLimit", "100K", ratingDate )
    var lookup = cov.PAPIPNJ_MEDLIMITTerm.OptionValue.OptionCode + "/" + cov.PAPIPNJ_MEDDEDUCTTerm.OptionValue.OptionCode
    var pipFactor          = this.getRateFactor( "papPIPrate", "base", typekey.Jurisdiction.TC_NJ, ratingDate )
    var pipSecondaryFactor = this.getRateFactor( "papPBuIPStack", cov.PAPIPNJ_MEDsecondaryTerm.ValueAsString, typekey.Jurisdiction.TC_NJ, ratingDate )
    //this.getRateFactor( "papPIPTortLimit", cov.BAPipNJTortLimitTerm, typekey.State.TC_NJ, ratingDate )
    var acceptMedOnly = "decline"
    if (cov.PAPIPNJ_MEDONLYTerm.Value) { acceptMedOnly = "accept"}
    var medFactor          = new RateAdjFactorSearchCriteria( "papPIPLimit", _baseRatingDate)
                               .match( lookup, acceptMedOnly,  typekey.Jurisdiction.TC_NJ )
    var adjRate = baseRate
                    * pipFactor
                    * pipSecondaryFactor
                    * medFactor
                    * getUWCompanyRateFactor(cov.PALine)
    addCost( ratePIPCoverage_Impl(cov, vehicle, baseRate, adjRate, typekey.PAPIPCovCostType.TC_BASIC) )
  }

  private function ratePAPIP_NJOptional(cov : PAPIP_NJ, vehicle : PersonalVehicle) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, vehicle)
    var baseRate = new RateAdjFactorSearchCriteria( "papPIPOption", ratingDate )
                     .match( cov.PAPIPNJ_OTHER_LIMSTerm.PackageValue.PackageCode, typekey.Jurisdiction.TC_NJ)
    var adjRate = baseRate * getUWCompanyRateFactor(cov.PALine)
    addCost( ratePIPCoverage_Impl(cov, vehicle, baseRate, adjRate, typekey.PAPIPCovCostType.TC_OPTIONAL) )
  }

  private function ratePAPIP_KY(cov : PAPIP_KY, vehicle : PersonalVehicle) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, vehicle)
    var liabilityRate       = this.getRateFactor( "papLiabilityRate", "base", typekey.Jurisdiction.TC_KY, ratingDate )
    var liability100KFactor = this.getRateFactor( "papLiabLimit", "100K", typekey.Jurisdiction.TC_KY, ratingDate )
    var baseRate = liabilityRate * liability100KFactor
    var limitFactor : BigDecimal = 1.0
    var pipFactor        = this.getRateFactor( "papPIPrate", "base", typekey.Jurisdiction.TC_KY, ratingDate )
    if (cov.PAPIPKY_GuestONLYTerm.Value == null or !cov.PAPIPKY_GuestONLYTerm.Value) {
      limitFactor      = this.getRateFactor( "papPIPLimit", cov.PAPIPKY_AggLimitTerm.ValueAsString, typekey.Jurisdiction.TC_KY, ratingDate )
    }
    var adjRate = baseRate * pipFactor * limitFactor
                    * getUWCompanyRateFactor(cov.PALine)
    addCost( ratePIPCoverage_Impl( cov, vehicle, baseRate, adjRate, typekey.PAPIPCovCostType.TC_BASIC) )
  }

  private function ratePAPIP_AR(cov : PAPIP_AR, vehicle : PersonalVehicle) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, vehicle)
    var baseRate = this.getRateFactor( "bapPIPDeathCovRate", "base", typekey.Jurisdiction.TC_AR, ratingDate )
    //rate wage loss
    if (cov.PAPIP_AR_WorkLossTerm.Value) {
      baseRate = baseRate + this.getRateFactor( "bapPIPWageCovRate", "base", typekey.Jurisdiction.TC_AR, ratingDate )
    }
    //rate med
    // this ALWAYS rates to zero, so skip it
    //baseRate = this.getRateFactor( "bapPIPMedCovARRate", "base", typekey.State.TC_AR, ratingDate )
    var adjRate = baseRate * getUWCompanyRateFactor(cov.PALine)
    addCost( ratePIPCoverage_Impl( cov, vehicle, baseRate, adjRate, typekey.PAPIPCovCostType.TC_BASIC)  )
  }

  private function ratePIPCoverage_Impl(cov : PersonalAutoCov, vehicle : PersonalVehicle,
            baseRate : BigDecimal, adjRate : BigDecimal, costType : typekey.PAPIPCovCostType) : PersonalAutoPIPCovCostData {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new PersonalAutoPIPCovCostData(start, end, cov.Currency, RateCache, vehicle.FixedId, cov.FixedId, costType)
    populateCostData(cost, baseRate, adjRate)
    return cost
  }

  private function ratePAUIMBICov(cov : PAUIMBICov, vehicle : PersonalVehicle) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, PolicyLine)
    var baseRate = getRateFactor("papUIMBIRate", "base", ratingDate )
    var adjRate = baseRate
                   * getRateFactor("papUIMBILimit", cov.PAUIMBITerm.PackageValue.PackageCode, ratingDate )
                   * getVehicleDriversRatingFactor(vehicle, ratingDate)
                   * getNoLossDiscountFactor(PolicyLine, ratingDate)
                   * getUWCompanyRateFactor(cov.PALine)
    addCost(  rateLineCoverage_impl(cov, vehicle, baseRate, adjRate)  )
  }

  private function ratePAUMBICov(cov : PAUMBICov, vehicle : PersonalVehicle) {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, PolicyLine)
    var baseRate = getRateFactor("papUMBIRate", "base", ratingDate )
    var adjRate= baseRate
                   * getRateFactor("papUMBILimit", cov.PAUMBITerm.PackageValue.PackageCode, ratingDate )
                   * getVehicleDriversRatingFactor(vehicle, ratingDate)
                   * getNoLossDiscountFactor(PolicyLine, ratingDate)
                   * getUWCompanyRateFactor(cov.PALine)
    addCost(  rateLineCoverage_impl(cov, vehicle, baseRate, adjRate) )
  }

  private function ratePAUMPDCov(cov : PAUMPDCov, vehicle : PersonalVehicle)  {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, PolicyLine)
    var baseRate = getRateFactor("papUMPDRate", "base", ratingDate )
    var adjRate = baseRate
                   * getRateFactor("papUMPDLimit", cov.PAUMPDLimitTerm.OptionValue.OptionCode, ratingDate )
                   * getVehicleDriversRatingFactor(vehicle, ratingDate)
                   * getNoLossDiscountFactor(PolicyLine, ratingDate)
                   * getUWCompanyRateFactor(cov.PALine)
    addCost(  rateLineCoverage_impl(cov, vehicle, baseRate, adjRate) )
  }

  private function rateLineCoverage_impl(cov : PersonalAutoCov, vehicle : PersonalVehicle, baseRate : BigDecimal, adjRate : BigDecimal) : PersonalAutoCovCostData {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new PersonalAutoCovCostData(start, end, cov.Currency, RateCache, vehicle.FixedId, cov.FixedId)
    populateCostData(cost, baseRate, adjRate)
    return cost
  }

  private function rateVehicleCoverage(cov : PersonalVehicleCov) : PersonalVehicleCovCostData {
    assertSliceMode(cov)
    switch (typeof cov) {
      case PACollisionCov: return ratePACollisionCov(cov)
      case PAComprehensiveCov: return ratePAComprehensiveCov(cov)
      case PARentalCov: return ratePARentalCov(cov)
      case PATowingLaborCov: return ratePATowingLaborCov(cov)
//      case PAbyCoverage: return ratePAbyCoverage(cov)
//      case PAbyCoverable: return ratePAbyCoverable(cov)
      default:
        PCFinancialsLogger.logDebug("Not rating ${(typeof cov)}")
        return null
    }
  }

/*  private function ratePAbyCoverable(cov : PAbyCoverable) : PersonalVehicleCovCostData {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.PersonalVehicle)
    var baseRate = getRateFactor("papLiabilityRate", "base", ratingDate )
    var adjRate = baseRate
    return rateVehicleCoverage_impl(cov, baseRate, adjRate)
  }

  private function ratePAbyCoverage(cov : PAbyCoverage) : PersonalVehicleCovCostData {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.PersonalVehicle)
    var baseRate = getRateFactor("papLiabilityRate", "base", ratingDate )
    var adjRate = baseRate
    return rateVehicleCoverage_impl(cov, baseRate, adjRate)
  }
*/

  private function ratePACollisionCov(cov : PACollisionCov) : PersonalVehicleCovCostData {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.PersonalVehicle)
    var baseRate = getRateFactor("papCollRate", "base", ratingDate )
    var adjRate = baseRate
                   * getRateFactor("papCollDeductible", cov.PACollDeductibleTerm.OptionValue.OptionCode, ratingDate )
                   * getAgeFactor(cov.PersonalVehicle, ratingDate)
                   * getRateFactorInRange("papVehicleCostNew", cov.PersonalVehicle.CostNew as double, cov, ratingDate )
                   * getVehicleDriversRatingFactor(cov.PersonalVehicle, ratingDate)
                   * getNoLossDiscountFactor(cov.PersonalVehicle.PALine, ratingDate)
                   * getUWCompanyRateFactor(cov.PersonalVehicle.PALine)
    return rateVehicleCoverage_impl(cov, baseRate, adjRate)
  }

  private function ratePAComprehensiveCov(cov : PAComprehensiveCov) : PersonalVehicleCovCostData {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.PersonalVehicle)
    var baseRate = getRateFactor("papCompRate", "base", ratingDate )
    var adjRate = baseRate
                   * getRateFactor("papCompDeductible", cov.PACompDeductibleTerm.OptionValue.OptionCode, ratingDate )
                   * getAgeFactor(cov.PersonalVehicle, ratingDate)
                   * getRateFactorInRange("papVehicleCostNew", cov.PersonalVehicle.CostNew as double, cov, ratingDate )
                   * getVehicleDriversRatingFactor(cov.PersonalVehicle, ratingDate)
                   * getNoLossDiscountFactor(cov.PersonalVehicle.PALine, ratingDate)
                   * getUWCompanyRateFactor(cov.PersonalVehicle.PALine)
    return rateVehicleCoverage_impl(cov, baseRate, adjRate)
  }

  private function ratePARentalCov(cov : PARentalCov) : PersonalVehicleCovCostData {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.PersonalVehicle)
    var baseRate = getRateFactor("papRentalRate", "base", ratingDate )
    var adjRate = baseRate
                   * getNoLossDiscountFactor(cov.PersonalVehicle.PALine, ratingDate)
                   * getUWCompanyRateFactor(cov.PersonalVehicle.PALine)
    return rateVehicleCoverage_impl(cov, baseRate, adjRate)
  }

  private function ratePATowingLaborCov(cov : PATowingLaborCov) : PersonalVehicleCovCostData {
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.PersonalVehicle)
    var baseRate = getRateFactor("papTowingRate", "base", ratingDate )
    var adjRate = baseRate
                   * getNoLossDiscountFactor(cov.PersonalVehicle.PALine, ratingDate)
                   * getUWCompanyRateFactor(cov.PersonalVehicle.PALine)
    return rateVehicleCoverage_impl(cov, baseRate, adjRate)
  }

  private function rateVehicleCoverage_impl(cov : PersonalVehicleCov, baseRate : BigDecimal, adjRate : BigDecimal) : PersonalVehicleCovCostData {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var cost = new PersonalVehicleCovCostData(start, end, cov.Currency, RateCache, cov.FixedId)
    populateCostData(cost, baseRate, adjRate)
    return cost
  }

   protected function populateCostData(cost : CostData, baseRate : BigDecimal, adjRate : BigDecimal) {
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    cost.StandardBaseRate = baseRate
    cost.StandardAdjRate = adjRate
    cost.Basis   = 1 // Assumes 1 vehicle year
    cost.StandardTermAmount = adjRate.setScale(RoundingLevel, this.RoundingMode)
    cost.copyStandardColumnsToActualColumns()
  }

  private function rateMultiPolicyDiscount(line : PersonalAutoLine) {
    var modifierVL = line.VersionList.PAModifiers.firstWhere(\ m -> m.AllVersions.first().PatternCode == "PAMultiPolicyDiscount")
    if (modifierVL == null) {
      return
    }

    var p = Prorater.forFinancialDays(TC_PRORATABYDAYS)
    for (modifier in modifierVL.AllVersions) {
      var discount = modifier.TypeKeyModifier
      var factor = new RateAdjFactorSearchCriteria("papMultiPolicyDiscount", _baseRatingDate).match(discount, line.BaseState)
      if (factor <> 1) {
        var start = modifier.EffectiveDate

        // Bail out if this slice is cancelled
        if (line.Branch.CancellationDate != null and line.Branch.CancellationDate <= start) {
          break
        }

        // Choose the earlier of the modifier expiration and the cancellation date, if any
        var end = modifier.ExpirationDate
        if (line.Branch.CancellationDate != null and line.Branch.CancellationDate < end) {
          end = line.Branch.CancellationDate
        }

        var cost = new PAMultiPolicyDiscCostData(start, end, line.Branch.PreferredSettlementCurrency, RateCache)
        cost.NumDaysInRatedTerm = p.financialDaysBetween(start, end)
        cost.Basis              = CostDatas.where(\c -> c.EffectiveDate <= start and start < c.ExpirationDate)
                                            .sum(\ c -> c.amountBetween(start, end, RoundingLevel, RoundingMode))
        cost.ActualBaseRate     = factor - 1
        cost.ActualAdjRate      = cost.ActualBaseRate
        cost.ActualTermAmount   = (cost.Basis * cost.ActualAdjRate).setScale(RoundingLevel, this.RoundingMode)
        cost.ActualAmount       = cost.ActualTermAmount
        addCost(cost)
      }
    }
  }

  protected override function rateWindow(line : PersonalAutoLine) {
    var logMsg = "Rating across policy term..."
    PCFinancialsLogger.logInfo(logMsg)
    assertSliceMode(line) // we need to be in slice mode to create costs, but we're creating costs for the whole window
    rateMultiPolicyDiscount(line)
    rateCancellationShortRatePenalty(line)
    rateTaxes(line)
    PCFinancialsLogger.logInfo(logMsg + "done")
  }

  function rateCancellationShortRatePenalty(line : PersonalAutoLine) {
    var subtotal = CostDatas.sum(\ c -> c.ActualAmount)
    if (line.Branch.RefundCalcMethod == "shortrate" and subtotal != 0) {
      var cost = new PAShortRatePenaltyCostData(line.Branch.PeriodStart, line.Branch.PeriodEnd, line.Branch.PreferredSettlementCurrency, RateCache)
      cost.NumDaysInRatedTerm = line.Branch.NumDaysInPeriod
      cost.Basis              = subtotal
      cost.StandardBaseRate   = ShortRatePenaltyRate
      cost.StandardAdjRate    = cost.StandardBaseRate
      cost.StandardTermAmount = (cost.Basis * cost.StandardAdjRate).setScale(RoundingLevel, this.RoundingMode)
      cost.StandardAmount     = cost.StandardTermAmount
      cost.copyStandardColumnsToActualColumns()
      addCost(cost)
    }
  }

  protected function rateTaxes(line : PersonalAutoLine) {
    // In NY or FL, round to pennies
    var level = (line.BaseState == "NY" or line.BaseState == "FL") ? 2 : this.RoundingLevel
    var subtotal = CostDatas.sum(\ c -> c.ActualAmountBilling.Amount)
    if (subtotal != 0) {
      var cost = new PersonalAutoTaxCostData(Branch.PeriodStart, Branch.PeriodEnd, TaxRatingCurrency, RateCache)
      cost.NumDaysInRatedTerm = line.Branch.NumDaysInPeriod
      cost.ChargePattern = ChargePattern.TC_TAXES
      cost.Basis              = subtotal
      cost.StandardBaseRate     = getStateTaxRate(line.BaseState)
      cost.StandardAdjRate      = cost.StandardBaseRate
      cost.StandardTermAmount   = (cost.Basis * cost.StandardAdjRate).setScale(level, this.RoundingMode)
      cost.copyStandardColumnsToActualColumns()
      cost.updateAmountFields(level, this.RoundingMode, Branch.PeriodStart)
      addCost(cost)
    }
  }

  private function getRateFactor(factorName : String, term : PackageCovTerm, ratingDate : Date) : BigDecimal {
    return getRateFactor(factorName, term.PackageValue.PackageCode, ratingDate )
  }

  private function getRateFactor(factorName : String, lookup : String, ratingDate : Date) : BigDecimal {
    return new RateAdjFactorSearchCriteria(factorName, ratingDate)
             .match(lookup, PolicyLine.BaseState)
  }

  protected function getRateFactor( factorName : String, lookup : String, state : Jurisdiction, ratingDate : Date ) : BigDecimal
  {
    return new RateAdjFactorSearchCriteria( factorName, ratingDate ).match( lookup, state )
  }

  private function getRateFactorInRange(factorName : String, lookup : Number, cov : PersonalVehicleCov, ratingDate : Date) : BigDecimal {
    return new RateAdjFactorSearchCriteria(factorName, ratingDate).matchInRange(lookup, JurisdictionMappingUtil.getJurisdiction(cov.PersonalVehicle.GarageLocation))
  }

  private function getUWCompanyRateFactor(line : entity.PersonalAutoLine) : BigDecimal {
    return line.Branch.getUWCompanyRateFactor(_baseRatingDate, line.BaseState)
  }

  protected property get RoundingLevel() : int {
    return Branch.Policy.Product.QuoteRoundingLevel
  }

  protected property get RoundingMode() : RoundingMode {
    return Branch.Policy.Product.QuoteRoundingMode
  }

  private function getNoLossDiscountFactor(line : entity.PersonalAutoLine, ratingDate : Date) : BigDecimal {
    if ( line.PAModifiers.hasMatch( \ modifier -> modifier.Pattern.Code == "PANoLossDiscount" and modifier.BooleanModifier ) ) {
      return new RateAdjFactorSearchCriteria( "papNoLossDiscount", ratingDate ).match( line.BaseState )
    }
    return 1.0
  }

  private function getVehicleDriversRatingFactor(vehicle : PersonalVehicle, ratingDate : Date) : BigDecimal
  {
    var factor = vehicle.Drivers.map( \ vehDriver -> getDriverRatingFactor(vehDriver, ratingDate) ).sum()
    return factor == 0.0 ? BigDecimal.ONE : factor
  }

  private function getAgeFactor(vehicle : PersonalVehicle, ratingDate : Date) : BigDecimal
  {
    var age = (vehicle.Year == null ? null : ratingDate.YearOfDate - vehicle.Year)  // For the newest model year, this could give 0 or -1 (for a 2006 model year in 2005)
    return new RateAdjFactorSearchCriteria( "papVehicleAge", ratingDate ).matchInRange( age, vehicle.PALine.BaseState )
  }

  private function getDriverRatingFactor(driver : VehicleDriver, ratingDate : Date) : BigDecimal
  {
    return getAgeFactor(driver) * getGoodDriverDiscount(driver, ratingDate) * driver.PercentageDriven / 100
  }

  private function getAgeFactor(driver : VehicleDriver) : BigDecimal
  {
    var dateOfBirth = driver.PolicyDriver.DateOfBirth
    if ( dateOfBirth == null )
    {
      return 1.0
    }
    return (80 + (2005 - dateOfBirth.YearOfDate)) / 100
  }

  private function getGoodDriverDiscount(driver : VehicleDriver, ratingDate : Date) : BigDecimal
  {
    if ( driver.PolicyDriver.ApplicableGoodDriverDiscount )
    {
      return new RateAdjFactorSearchCriteria( "papGoodDriverDiscount", ratingDate ).match( driver.Vehicle.PALine.BaseState )
    }
    return 1.0
  }
}
