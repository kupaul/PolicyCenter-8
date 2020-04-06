package gw.lob.wc.rating

uses gw.api.domain.financials.PCFinancialsLogger
uses gw.rating.RateAdjFactorSearchCriteria
uses gw.financials.Prorater
uses gw.plugin.policyperiod.impl.SysTableRatingPlugin
uses gw.rating.CostData
uses gw.rating.AbstractRatingEngine
uses gw.util.AutoMap

uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.util.ArrayList
uses java.util.Map

@Export
class WCSysTableRatingEngine extends AbstractRatingEngine<WorkersCompLine> {

  var _calculator = new WCRatingProcessorCalculator()

  var _minPremium      : BigDecimal as MinimumPremium
  var _minPremiumState : Jurisdiction as MinimumPremiumState
  var _minPremiumClass : String     as MinimumPremiumClass

  var _minPremiumAdd   : BigDecimal as MinimumPremiumAdd
  var _minPremiumAdj   : BigDecimal as MinimumPremiumAdjustment
  var _minPremiumBasis : BigDecimal as MinimumPremiumBasis

  var _expenseConst      : BigDecimal as ExpenseConstant
  var _expenseConstState : Jurisdiction      as ExpenseConstantState

  var _payroll = new AutoMap<Jurisdiction, BigDecimal>( \ key -> BigDecimal.ZERO )

  /**
   * The running count of payroll by state.  Additionally, Payroll is an
   * AutoMap that inserts a 0 value whenever it enounters a new key.
   */
  property get Payroll() : AutoMap<Jurisdiction, BigDecimal> { return _payroll }

  construct(line : WorkersCompLine) {
    super(line)
    MinimumPremium = 0
  }

  override function rateOnly() : Map<PolicyLine, List<CostData>> {
    rateCoveredEmployees()
    rateJurisdictionCosts()
    return CostDataMap
  }

  property get Period() : PolicyPeriod {
    return Branch
  }

  /**
   * Calculate the manual rates for all of the normal WCCoveredEmployee (location / class code) exposure units
   */
  private function rateCoveredEmployees()
  {
    var logMsg = "Rating covered employees..."
    PCFinancialsLogger.logInfo( logMsg )
    var allWCCoveredEmployees = PolicyLine.VersionList.WCCoveredEmployees.flatMap( \ empVL -> empVL.AllVersions )
    for ( emp in allWCCoveredEmployees )
    {
      addCost(WCCoveredEmployeeRater.rate( this, emp ))
    }

    PCFinancialsLogger.logInfo( logMsg + "done" )
  }

  /**
   * Calculate state-level additional premiums, premium adjustments, taxes, and surcharges
   *
   * This part of rating is driven by a series of "rating steps" for each jurisdiction and rating period.
   * For example, if the policy had exposure-level premiums in 2 states and 2 rating periods (from anniversary
   * rating), then the system would look up the rating steps for each state/period (4 lists of steps) and
   * execute each list of steps.  This allows the code for doing each step to be shared while allowing the
   * steps to vary by state and over time and allowing that complexity to be managed (mostly) by business users
   * who can just adjust the steps listed in the "WC Rating Steps" table.
   *
   * It is unfortunate but true that you cannot do all the calculation steps for each state/period set
   * independently.  There are certain steps in the process that require a calculation that includes premiums
   * for the entire policy.  For example, the calculation of minimum premium requires determining the premium
   * across all states and periods up to the min premium steps, then determining whether the min premium has
   * been met, and adding a min premium in one of the states (and periods), if not.  The system needs to process the
   * steps in all states/periods up to a certain point, then carry out some cross-state process, then continue
   * with the steps in each state.  I refer to these stopping points as "synchronization points".  All steps
   * with calc order <= some synch # are completed, then a special cross-state calc, then a continuation for
   * each state/period until the next synch point.
   *
   * Note that it is theoretically possible the rating algorithms for different states/periods to be
   * incompatible so that even with synch points, it is not possible to carry out the rules for both.
   * For example, if one adds min premium before premium discount and the other does not --
   * and since both operations require a cross-policy calc -- it is not possible to follow both
   * rules.  This sample rating logic makes no attempt to deal with incompatible rules that state regulators
   * might decide to require.)
   */
  private function rateJurisdictionCosts()
  {
    var logMsg = "Rating jurisdiction costs..."
    PCFinancialsLogger.logInfo( logMsg )

    // Define some calc order #s that represent synchronization points (calcs up to and including
    // this step before stopping)
    var synch1 = 389  // Just before min premium
    var synch2 = 400  // Standard premium, just before premium discount
    var synch3 = 500  // EAP, before adding taxes and surcharges

    // Mark all state-level costs as untouched

    // PC-14456: Need to write the code for this
    // Pre-calc waiver premiums since there is a min premium that can apply across periods for a given waiver.

    processWCRatingSteps( 0, synch1, true )

    determineMinimumPremiumAdjustment( getCurrentTotalCost() )

    processWCRatingSteps(synch1+1, synch2, true )

    determineLargestExpenseConstant( )

    // For Premium Discount, we just need the standard premium subtotal to be calc'd and stored for all the states.
    // This requires synchronization (so they all get to thst step), but not any other calcs.
    getRatingSubtotal( "wc_standard", all, null, null )

    processWCRatingSteps(synch2+1, synch3, false )

    processWCRatingSteps(synch3+1, 10000, false )

    PCFinancialsLogger.logInfo( logMsg + "done" )
  }

  function storeRatingSubtotal(amount : BigDecimal, subtotal : RateSubtotalType, granularity : WCRatingSubtotalGranularity, st : Jurisdiction, rpsd : String) {
    _calculator.storeRatingSubtotal( amount, subtotal, granularity, st, rpsd )
  }

  function getRatingSubtotal(subtotal : RateSubtotalType, granularity : WCRatingSubtotalGranularity, st : Jurisdiction, rpsd : String) : BigDecimal
  {
    return _calculator.getRatingSubtotal(subtotal, granularity, st, rpsd)
  }

  /**
   * Utility for adjusting rates to take into account assumptions about how they are used
   */
  function convertRateByUsage( rate : BigDecimal, usage : RateConversionType ) : BigDecimal
  {
    switch ( usage )
    {
      case "as_is"       : return rate
      case "credit"      : return rate.negate()
      case "diff_from_1" : return rate.subtract( BigDecimal.ONE )
      default:  // Otherwise, this is an unknown usage
        PCFinancialsLogger.logError("Rating error: encountered an unhandled rate conversion type: " + usage.Code + ". Defaulting to using rate as is.")
        return rate
    }
  }

  /**
   * Update the minimum premium if the supplied minimum premium is the largest seen so far, or,
   * if it is the same as the current minimum premium, but is in a state that comes earlier in the alphabet
   * (so rating results are consistent).
   */
  function updateMinimumPremium( theMinPremium : BigDecimal, rateState : Jurisdiction, normalizedClassCode : String )
  {
    if (theMinPremium > MinimumPremium
        or (theMinPremium == MinimumPremium and MinimumPremiumState > rateState) )
    {
      MinimumPremium      = theMinPremium
      MinimumPremiumState = rateState
      MinimumPremiumClass = normalizedClassCode
    }
  }

  /**
   * This function sets up a loop over all the rating periods and states and then makes a call to another funtion which actually
   * does all the work to look-up the list of steps to run and executes each step.
   * The from and to step #s allow the steps to be executed in blocks in order to do synchronized cross-policy calcs at the end of
   * each block.
   */
  function processWCRatingSteps(fromStep : int, toStep : int, atRatingPeriodLevel : boolean ) {
    var logMsg = "Processing WC Rating Steps " + fromStep + "--" + toStep + " at '" + (atRatingPeriodLevel ? "ratingPeriod" : "jurisdiction" ) + "' level..."
    PCFinancialsLogger.logDebug( logMsg )
    for (juris in PolicyLine.RepresentativeJurisdictions)
    {
      var ratingPeriods = atRatingPeriodLevel ? juris.RatingPeriods : new ArrayList<WCRatingPeriod>(){ new WCRatingPeriod( juris, juris.Branch.PeriodStart, juris.Branch.PeriodEnd, 1 ) }
      for ( ratingPeriod in ratingPeriods )
      {
        if ( ratingPeriod.NumRatingDays > 0 )
        {
          processWCRatingStepsByPeriod( ratingPeriod, fromStep, toStep, atRatingPeriodLevel )
        }
      }
    }
    PCFinancialsLogger.logDebug( logMsg )
  }

  /**
   * This function selects a list of rating steps from the "WC Rating Steps" system table and executes those steps.
   * It chooses steps for a given state and rating date and between 2 calcOrder numbers (inclusive).  This allows
   * a series of steps (e.g. 1-100) for all states to be processed, then some synchronized action (that looks at the data
   * up to this point across all states), then a continuation of steps for each state (e.g. 101-200).  Since the WC rating Steps
   * table allows a default set of steps (state = null), we have to establish for each state whether there are any state-specific
   * steps for the given date (but ignoring the from / to step limitations).  If there are NO steps for the state and date, then
   * the functions uses the default steps for that state/date for all step ranges.  (This avoid a problem where there are
   * state-specific steps but if you ask only for steps from 10-20 and there aren't any in that range, the system should not
   * use default ones just because there aren't any in that range.  It should only use the default steps if there aren't any AT ALL.)
   * The function defines some standard, reusable types of steps but also has a number of very specific types of steps for
   * handling common but complex WC rating needs.
   * <p>
   * The function separately requires the ratingDate (which defines the effective date of rating rules and rates) and the period
   * start and end dates (which define the rating period for split periods).  These might be different because, for example, the
   * first period in an anniversary rated WC policy could be from 1/1/07 - 6/1/07 but the rating date could be 10/1/06 (prior
   * anniversary date).  Rating steps and rates need to be looked up as of the rating date, but subtotals are calculated for premiums
   * within the period start/end dates and policy attributes (e.g. exp mod) are determined as of the period's start date.
   */
  private function processWCRatingStepsByPeriod( ratingPeriod : WCRatingPeriod, fromStep : int, toStep : int, atRatingPeriodLevel : boolean )
    {
    var logMsg = "Processing WC Rating Steps by Period " + ratingPeriod + " " + fromStep + "--" + toStep + " at '" + (atRatingPeriodLevel ? "ratingPeriod" : "jurisdiction") + "' level..."
    PCFinancialsLogger.logDebug( logMsg )

    // Use state-specific steps if there are any effective for the ratingDate, otherwise use default steps
    var queriedSteps = new WCRatingStepsSearchCriteria( ratingPeriod.RatingDate, ratingPeriod.Jurisdiction.State ).matchAllInRange( fromStep, toStep )

    // If we're in a premium report job, filter out the steps that don't belong.  Ideally this would be part of the query, but that's
    // kind of a pain to do in a GS finder right now, since the filtering is conditional on whether or not we're in a premium report
    // job
    var steps : List<WCRatingStepExt>
    if (Branch.Job typeis Audit && Branch.Audit.AuditInformation.AuditScheduleType == "PremiumReport") {
      steps = queriedSteps.iterator().toList().where( \ t -> t.includeInReports)
    } else {
      steps = queriedSteps.iterator().toList()
    }

    // Fetch and iterate through the steps, executing each one
    for (step in steps) {
      /*****************************/
      /* Main processing logic here*/
      /*****************************/

      PCFinancialsLogger.logDebug("Rating step, Order: " + step.calcOrder + ", Type: " + step.aggCostType.DisplayName
        + ", Action: " + step.stepAction + ", Custom: " + step.customAction
        + ", Subtotal: " + step.subtotal + ", Mod: " + step.modifierID + ", Factor: " + step.factorName )

      switch( step.stepAction )
      {
        case "subtotal":
          storeSubtotal( ratingPeriod, step, atRatingPeriodLevel )
          break
        case "modifier":
          addCost(ModifierRater.rate( ratingPeriod, step, atRatingPeriodLevel, this ))
          break
        case "fee":
          addCost(FeeRater.rate( ratingPeriod, step, atRatingPeriodLevel, this ))
          break

        case "custom":
          //***** Custom Action Handlers
          switch( step.customAction )
          {
            case "emp_liab":
              addCost(EmployersLiabilityIncreasedLimitsRater.rate( ratingPeriod, step, atRatingPeriodLevel, this ))
              break
            case "min_prem":
              addCost(PolicyLevelMinimumPremiumRater.rate(ratingPeriod, step, this))
              break
            case "exp_constant":
              addCost(ExpenseConstantRater.rate(ratingPeriod, step, this))
              break
            case "prem_discount":
              addCost(PremiumDiscountRater.rate(calcBlendedPremiumDiscountRate( ratingPeriod, step ), ratingPeriod, step, this))
              break
            case "terrorism":
              addCost(TerrorismPremiumRater.rate(ratingPeriod, step, this))
              break
            case "shortratepremium":
              rateShortRatePremium( ratingPeriod, step )
              break
            default: PCFinancialsLogger.logError("WC Rating: Encountered an unhandled custom step action: " + step.customAction )
          }
          break

        default: PCFinancialsLogger.logError("WC Rating: Encountered an unhandled step action: " + step.stepAction.Code )
      }
    }
    PCFinancialsLogger.logDebug( logMsg + "done" )
  }

  private function storeSubtotal( ratingPeriod : WCRatingPeriod, step : WCRatingStepExt, atRatingPeriodLevel : boolean )
  {
    var amount = getCostAmountSum(ratingPeriod)
    PCFinancialsLogger.logDebug("Subtotal: " + step.subtotal + " Level: " + (atRatingPeriodLevel ? "ratingPeriod" : "jurisdiction") + " State: " + ratingPeriod.Jurisdiction.State.Code + " Date: " + ratingPeriod.RatingStart + " Amount: " + amount)
    storeRatingSubtotal( amount, step.subtotal, atRatingPeriodLevel ? WCRatingSubtotalGranularity.ratingPeriod : WCRatingSubtotalGranularity.jurisdiction, ratingPeriod.Jurisdiction.State, ratingPeriod.RatingStart as String )
  }

  private function rateShortRatePremium( ratingPeriod : WCRatingPeriod, step : WCRatingStepExt )
  {
    if ( Branch.RefundCalcMethod == "shortrate" )
    {
      var shortRateFactor = new ShortRateFactorSearchCriteria( ratingPeriod.RatingDate, Branch ).match( ratingPeriod.Jurisdiction.State )
      addCost(ShortRatePremiumRater.rate(shortRateFactor.shortRateFactor, ratingPeriod, step, this))
    }
  }

  protected function getOrCalcSubtotal( ratingPeriod : WCRatingPeriod, step : WCRatingStepExt, atRatingPeriodLevel : boolean ) : BigDecimal
  {
    var basis : BigDecimal
    if ( step.subtotal == null )
    {
      basis = getCostAmountSum(ratingPeriod)  // Get the running total to date
    }
    else
    {
      basis = getRatingSubtotal( step.subtotal, atRatingPeriodLevel ? WCRatingSubtotalGranularity.ratingPeriod : WCRatingSubtotalGranularity.jurisdiction, ratingPeriod.Jurisdiction.State, ratingPeriod.RatingStart as String )  // fetch the subtotal
    }
    return basis
  }

  /**
   * Calculate the blended premium discount rate by applying the tiered <code>wcPremDiscount</code>
   * to premium ranges within the standard premium for the entire policy.  Currently, the discount
   * ranges in sample data are, <ul><li>$5,000-15,000 = -0.01
   * <li>$15,000-50,000 = -0.03
   * <li>$50,000-100,000 = -0.05
   * <li>100,000-100,000,000 = -0.08
   * </ul>
   * For example, if the total standard premium is $75,000, 10000 of it falls in the 0.01 range,
   * 35000 in the 0.03 range, and the last 25000 falls in the 0.05 range, resulting in a full
   * accumulated discount of 1302.65 (10000*0.01 + 35000*0.03 + 25000*0.05), and thus a blended
   * rate of 0.0174 (1302.65/75000).
   *
   * Finally, it returns 0 if there is no premium discount (usually because standard premium is too low).
   */
  private function calcBlendedPremiumDiscountRate( ratingPeriod : WCRatingPeriod, step : WCRatingStepExt ) : BigDecimal
  {
    if (Branch.Job typeis Audit && Branch.Audit.AuditInformation.IsPremiumReport) {
       var existingCost = ratingPeriod.getExistingWCJurisdictionCost( step )
       if (existingCost != null) {
         return existingCost.StandardAdjRate
       } else {
         return 0
       }
    } else {
      var blendedRate = 0 as BigDecimal
      var policyStandardPrem = getRatingSubtotal( "wc_standard", all, null, null )
      if ( policyStandardPrem > 0 )  // flat cancellations will have no standard premium
      {
        var factors = new RateAdjFactorSearchCriteria( "wcPremDiscount", ratingPeriod.RatingDate ).matchAll( ratingPeriod.Jurisdiction.State )
        var accumDiscount = 0 as BigDecimal
        for ( factor in factors )
        {
          if ( factor.minNumber < policyStandardPrem )
          {
            var maxForRange = policyStandardPrem < factor.maxNumber ? policyStandardPrem : factor.maxNumber
            var minForRange = factor.minNumber
            var premiumInRange = maxForRange - minForRange
            accumDiscount = accumDiscount + ( premiumInRange * factor.factor )
          }
        }
        blendedRate = ( accumDiscount / policyStandardPrem ).setScale( 4, this.RoundingMode )
      }
      return blendedRate
    }
  }

  protected property get RoundingLevel() : int
  {
    return Branch.Policy.Product.QuoteRoundingLevel
  }

  protected property get RoundingMode() : RoundingMode {
    return Branch.Policy.Product.QuoteRoundingMode
  }

  protected function getCostAmountSum(ratingPeriod : WCRatingPeriod) : BigDecimal {
    return CostDatas.where(\c -> matchesPeriod(c, ratingPeriod))
      .sum( \ c -> c.ActualAmount )
  }

  private function matchesPeriod(cost : CostData, ratingPeriod : WCRatingPeriod) : boolean {
    var start = ratingPeriod.RatingStart.trimToMidnight()
    var end = ratingPeriod.RatingEnd.trimToMidnight()
    if (cost typeis WCJurisdictionCostData) {
      var stateCost = cost
      return stateCost.EffectiveDate.trimToMidnight() >= start && stateCost.ExpirationDate.trimToMidnight() <= end && stateCost.State == ratingPeriod.Jurisdiction.State
    } else {
      var empCost = cost as WCCovEmpCostData
      return empCost.EffectiveDate.trimToMidnight() >= start && empCost.ExpirationDate.trimToMidnight() <= end && empCost.State == ratingPeriod.Jurisdiction.State
    }
  }

  protected function getCurrentTotalCost() : BigDecimal {
    return CostDatas.map( \ c -> c.ActualAmount ).sum()
  }

  /**
   * Determine the minimum premium adjustment, relative to the minPremSubtotal, and store it in the context.
   * If no minimum premium adjustment is necessary, then have the context store $0 for the minimum premium
   * adjustment.
   */
  private function determineMinimumPremiumAdjustment( minPremSubtotal : BigDecimal )
  {
    if ( Branch.RefundCalcMethod != "flat" )
    {
      // Prorate the "minimum premium to meet" in all cases except for short-rate cancellations.
      var numDaysToProrate = Branch.RefundCalcMethod == "shortrate" ? Branch.NumDaysInPeriod : Branch.NumDaysInUncanceledPeriod
      var numDaysInStandardPeriod = Branch.NumDaysInStandardPeriod
      if ( numDaysInStandardPeriod == null )
      {
        PCFinancialsLogger.logError( "Defaulting number of days in standard period to 1 year." )
        var p = Prorater.forFinancialDays(TC_PRORATABYDAYS)
        numDaysInStandardPeriod = p.financialDaysBetween(Branch.PeriodStart, Branch.PeriodStart.addYears( 1 ) )
      }

      var minPremiumToMeet = ( MinimumPremium * numDaysToProrate / numDaysInStandardPeriod ).setScale( this.RoundingLevel, this.RoundingMode )
      MinimumPremiumAdd        = minPremiumToMeet - minPremSubtotal
      MinimumPremiumAdjustment = minPremiumToMeet
      MinimumPremiumBasis      = minPremSubtotal
      // Also set the policy level minimum premium. PC-14456: should also store state and class somewhere
      //      this.PolicyPeriod.Quote.PolicyMinPremium.Amount = maxMinPrem
    }
  }

  /**
   * Find the jurisdiction with the highest expense constant (as of the first period's rating date).
   * If multiple jurisdictions have the same highest expense constant, then choose the one with an
   * alphabetically earlier state code, in order to have a deterministic result.
   */
  private function determineLargestExpenseConstant( )
  {
    ExpenseConstant = 0
    ExpenseConstantState = null
    for ( juris in PolicyLine.RepresentativeJurisdictions )
    {
      var expConst = new RateAdjFactorSearchCriteria( "wcExpenseConst", juris.getPriorRatingDate( Branch.PeriodStart ) ).match( "base", juris.State )
      if ( expConst > ExpenseConstant
           or ( expConst == ExpenseConstant and ExpenseConstantState > juris.State ) )
      {
        ExpenseConstant      = expConst
        ExpenseConstantState = juris.State
      }
    }
  }
}