package gw.lob.wc.rating

uses gw.api.domain.financials.PCFinancialsLogger
uses gw.rating.CostData
uses gw.rating.RateAdjFactorSearchCriteria
uses java.lang.Double
uses java.math.BigDecimal
uses java.math.RoundingMode
uses gw.api.util.JurisdictionMappingUtil
uses gw.financials.PolicyPeriodFXRateCache

/**
 * This class contains the methods needed to rate covered employees
 * This is an example implementation, it is expected that customers will use this as a pattern for their own
 * employee rater
 */

@Export
class WCCoveredEmployeeRater {

  private construct() {
  }

  /**
   * Computes the rate using a given rating engine for a given covered employee
   *
   * @param engine  The rating engine that would
   * @param covEmp  The covered employee we want rated
   *
   * @returns {@link gw.lob.wc.rating.WCCovEmpCostData} that contains the rating information
   */
  static function rate(engine : WCSysTableRatingEngine, covEmp : WCCoveredEmployee) : WCCovEmpCostData {
    var costData : WCCovEmpCostData
    var logMsg = " Rating " + covEmp + "..."
    PCFinancialsLogger.logDebug(logMsg)
    if (covEmp.NumDaysEffectiveForRating > 0) {
      // We can't just say this.WorkersCompLine.getJurisdiction(XYZ) because we're in window mode.  The traversal
      // of this->WorkersCompLine will use the last second of this's effective period to look up the line.
      // That's fine, but then when we traverse WorkersCompLine->getJurisdiction(XYZY) it'll use the last second
      // of the line's effective period to look for the jurisdiction.  This will fail if the jurisdiction was
      // removed in this job.
      var ratingDate = covEmp.WorkersCompLine.RepresentativeJurisdictions
                          .firstWhere(\ j -> j.State == getRatingState(covEmp)).getPriorRatingDate(covEmp.EffectiveDate)
      var manualRate = getManualRateAndUpdateMinimumPremiums(engine, covEmp, ratingDate)
      var uwCompFactor = covEmp.Branch.getUWCompanyRateFactor(ratingDate, getRatingState(covEmp))
      var uslhFactor = getUSLHFactor(covEmp, ratingDate)
      costData = rate_impl(engine, covEmp, manualRate, uwCompFactor, uslhFactor)  
    }
    PCFinancialsLogger.logDebug(logMsg + "done")
    return costData
  }

  // Only exposed for testing purposes
  protected static function rate_impl(engine : WCSysTableRatingEngine,
                                      covEmp : WCCoveredEmployee,
                                      manualRate : BigDecimal,
                                      uwCompFactor : Double,
                                      uslhFactor : BigDecimal) : WCCovEmpCostData  {
    var costData = new WCCovEmpCostData(covEmp.EffectiveDateForRating,
                                        covEmp.ExpirationDateForRating,
                                        engine.Branch.PreferredCoverageCurrency,
                                        engine.RateCache,
                                        covEmp.FixedId,
                                        covEmp.WorkersCompLine.WCWorkersCompCov.FixedId,
                                        JurisdictionMappingUtil.getJurisdiction(covEmp.Location))
    var existingCost = costData.getExistingCost(engine.PolicyLine)
    costData.NumDaysInRatedTerm = covEmp.NumDaysEffectiveForRating
    costData.Basis = covEmp.BasisForRating
    costData.SubjectToReporting = true
    
    costData.StandardBaseRate = (manualRate * uwCompFactor).setScale(4, RoundingMode.HALF_UP)
    costData.StandardAdjRate = computeAdjustedRate(costData.StandardBaseRate, uslhFactor)
    costData.StandardTermAmount = computeTermAmount(covEmp, costData.StandardAdjRate, costData.Basis)
    costData.StandardAmount = costData.StandardTermAmount
    
    costData.copyOverridesFromCost(existingCost)
    computeValuesFromCostOverrides(existingCost, costData, covEmp)
    engine.Payroll.put(getRatingState(covEmp), engine.Payroll.get(getRatingState(covEmp)) + costData.Basis)
    return costData
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private static function computeValuesFromCostOverrides(cost : Cost, costData : CostData, covEmp : WCCoveredEmployee) {
    if (cost.OverrideBaseRate != null) {
      costData.ActualBaseRate = cost.OverrideBaseRate
      costData.ActualAdjRate = cost.OverrideBaseRate
      costData.ActualTermAmount = computeTermAmount(covEmp, costData.ActualAdjRate, costData.Basis)
      costData.ActualAmount = costData.ActualTermAmount   
    }
    else if (cost.OverrideAdjRate != null) {
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = cost.OverrideAdjRate
      costData.ActualTermAmount = computeTermAmount(covEmp, costData.ActualAdjRate, costData.Basis)
      costData.ActualAmount = costData.ActualTermAmount 
    }
    else if (cost.OverrideAmount != null) {
      costData.Basis = 0
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = 0
      costData.ActualTermAmount = cost.OverrideAmount
      costData.ActualAmount = cost.OverrideAmount
    }
    else { 
      costData.copyStandardColumnsToActualColumns()
    }
  }
  
  private static function computeAdjustedRate(baseRate : BigDecimal, uslhFactor : BigDecimal) : BigDecimal {
    return (baseRate * uslhFactor).setScale(4, RoundingMode.HALF_UP)  
  }
  
  private static function computeTermAmount(covEmp : WCCoveredEmployee, adjRate : BigDecimal, basis : BigDecimal) : BigDecimal {
    return (adjRate * basis * covEmp.ClassCode.Basis.RateFactor).setScale(getRoundingLevel(covEmp), getRoundingMode(covEmp))  
  }
  
  /**
   * Gets the manual rate for this covered employee on the ratingDate and updates the minimum premium as necessary.
   * See the <code>RateWCClassCodeSearchCriteria</code> for the full details on how the find is done.  If no
   * rate is returned from the <code>rates_workers_comp</code> then a sample one is calculated based off of
   * the class code.  The sample rate is guaranteed to consistently return the same rate for the same class code.
   *
   * @param engine        the system table that contains the rating information
   * @param covEmp        the covered employee
   * @param ratingDate    the date used in the calculation
   *
   * @return              the rate for the covered employee on a given date
   */
  private static function getManualRateAndUpdateMinimumPremiums(engine : WCSysTableRatingEngine, covEmp : WCCoveredEmployee, ratingDate : DateTime) : BigDecimal {
    var criteria = new RateWCClassCodeSearchCriteria(ratingDate, covEmp.ClassCode, getRatingState(covEmp))
    var rate = criteria.match()

    var theRate : BigDecimal        // Number to return
    var theMinPremium : BigDecimal  // Value to store for minimum premium checking later
    if (rate == null) {
     theRate = calculateDemoRate(criteria.NormalizedClassCode as BigDecimal)  // seed with the normalized class code 
      theMinPremium = 50
      PCFinancialsLogger.logDebug("Could not find any rate for {Class Code=" + covEmp.ClassCode.Code + ", state=" + getRatingState(covEmp)+
            ", date=" + ratingDate + "}.  Using sample calculated rate of " + theRate)
    }
    else {
      theRate = rate.rate
      theMinPremium = rate.minPremium
    }
    engine.updateMinimumPremium(theMinPremium, getRatingState(covEmp), criteria.NormalizedClassCode)
    return theRate
  }
  
  /**
   * For demo purposes only, generate a consistent but completely unrealistic rate.
   */
  private static function calculateDemoRate(seed : BigDecimal) : BigDecimal {
    var demoRate = (seed / 1000) - 1.24
    if (demoRate < 1) {
      demoRate = 5 - demoRate
    }
    return demoRate
  }
  
  private static function getUSLHFactor(covEmp : WCCoveredEmployee, ratingDate : DateTime) : BigDecimal {
    return (covEmp.SpecialCov.Code == "uslh")
            ? new RateAdjFactorSearchCriteria("wcUSLHFactor", ratingDate).match("base", getRatingState(covEmp))
            : BigDecimal.ONE
  }
  
  private static function getRoundingLevel(emp : WCCoveredEmployee) : int {
    return emp.Branch.Policy.Product.QuoteRoundingLevel
  }
  
  private static function getRoundingMode(emp : WCCoveredEmployee) : RoundingMode {
    return emp.Branch.Policy.Product.QuoteRoundingMode
  }
  
  private static function getRatingState(emp : WCCoveredEmployee) : Jurisdiction {
    return JurisdictionMappingUtil.getJurisdiction(emp.Location)
  }
}
