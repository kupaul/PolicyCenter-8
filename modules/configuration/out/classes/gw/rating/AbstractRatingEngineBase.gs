package gw.rating
uses gw.api.profiler.PCProfilerTag
uses gw.api.domain.financials.PCFinancialsLogger
uses gw.api.system.PCLoggerCategory
uses gw.api.util.CurrencyUtil
uses gw.financials.PolicyPeriodFXRateCache
uses gw.financials.PolicyPeriodTransactionCalculator
uses gw.financials.Prorater
uses gw.plugin.Plugins
uses gw.plugin.productmodel.IReferenceDatePlugin
uses gw.rating.CostData

uses java.lang.Integer
uses java.lang.Iterable
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.util.Date
uses java.util.Map
uses java.util.Collection
uses gw.util.AutoMap
uses java.lang.IllegalArgumentException
uses java.util.Collections
uses gw.plugin.policyperiod.IPolicyTermPlugin

/**
 * The AbstractRatingEngineBase class is the basis for all out-of-the-box rating engines.  This class
 * provides a basic structure for rating, and important utility methods to do things like
 * prorate and merge costs and determine if rating should be
 * done from the start of the period or merely from the change date forward.
 *
 * The general structure for out of the box demo rating engines is:
 * 1) rate slices - We find all the dates on which anything changes anywhere in the policy, and rate certain things
 *                  (like standard vehicle or building coverages) from that date until the next date something changes
 *                  We rate what we can per-slice because it makes it much easier to traverse the graph and not worry about
 *                  what changes when, simplifying the rating logic.
 *
 * 2) merge and prorate - Since rating per slice results in lots of little pieces of cost, we want to merge those that
 *                        are equivalent.  Most costs are merged if they have the same rates and basis, while "basis-scalable" costs
 *                        that are not prorated by time are merged slightly differently.  Once the costs are merged, any rate-scalable
 *                        costs have their term amount prorated into an actual amount
 *
 * 3) rate window costs - Costs that depend on the sum of previous costs, or that span the whole period rather than particular points
 *                        in time, are rated in "window" mode.  Window mode rating is generally highly order-dependent; for example
 *                        discounts should be rated first, followed by any cancellation penalty, followed by taxes.
 *
 * 4) persist costs - Once all the CostData objects are fully assembled and correct, they're persisted to the database as Cost entities
 */
@Export
abstract class AbstractRatingEngineBase<SL> {
  var _branch : PolicyPeriod as readonly Branch

  // All effective dates for Branch
  var _effDates : List<DateTime> as readonly AllEffectiveDates

  // The set of costs that is built up as rating progresses
  var _costDataMap : Map<PolicyLine, List<CostData>> as readonly CostDataMap

  // A handle to the plugin used to compute reference dates
  var _refDatePlugin : IReferenceDatePlugin as readonly ReferenceDatePlugin

  var _rateCache : PolicyPeriodFXRateCache as RateCache

  property get TaxRatingCurrency() : Currency {
    return Branch.PreferredSettlementCurrency
  }

  /**
   * Constructs a new rating engine instance based around the particular line.
   */
  construct(period : PolicyPeriod) {
    _branch = period
    _effDates = Branch.EffectiveDatesForRating
    _refDatePlugin = Plugins.get(gw.plugin.productmodel.IReferenceDatePlugin)
    _costDataMap = new AutoMap<PolicyLine, List<CostData>>(\ l -> {return {}})
    _rateCache = new PolicyPeriodFXRateCache(Branch)
  }

  /**
   * Given the specified Cost entity, this method should return the PolicyLine that the Cost belongs to.
   */
  abstract protected function getPolicyLineForCost(c : Cost) : PolicyLine

  /**
   * When rating from the change date forward, we need to extract any existing slice-mode costs and create CostData
   * objects to represent them.  We don't want to extract all costs, since that would include things like taxes,
   * which will be rated when we rate in window mode.  This method, then, should return any costs currently on
   * the period that correspond to costs that are generated during the rateSlice() method.
   *
   * This method needs to be implemented provided that the subclass doesn't completely override the rateOnly()
   * method and also doesn't override shouldRateThisSliceForward() to always return false.
   */
  protected function existingSliceModeCosts() : Iterable<Cost> {
    throw "Not implemented"
  }

  /**
   * The callout to rate a given slice of the policy.  The lineVersion argument will already have its slice date
   * set to the appropriate method, and this function will be called once per slice in the policy.
   *
   * This method needs to be implemented provided that the subclass doesn't completely override the rateOnly() method
   */
  protected function rateSlice(slice : SL) {
    throw "Not implemented"
  }

  /**
   * The callout to rate the policy in "window" mode, rating things that depend on the sum of the previous slice costs
   * or that need to span the entire period and be rated just once instead of per-slice.  The argument in this case
   * will be the first version of the line in effective time.
   *
   * This method needs to be implemented provided that the subclass doesn't completely override the rateOnly() method
   */
  protected function rateWindow(window : SL) {
    throw "Not implemented"
  }

  /**
   * Given the specified Cost entity, this method should create the appropriate CostData class.  This method is used
   * by the extractCostDatasFromExistingCosts, and must be able to handle any Cost returned by the existingSliceModeCosts()
   * method.
   *
   * This method needs to be implemented provided that the subclass doesn't completely override the rateOnly()
   * method and also doesn't override shouldRateThisSliceForward() to always return false.
   */
  protected function createCostDataForCost(c : Cost) : CostData {
    throw "createCostDataForCost is not implemented by this rating engine"
  }

  /**
   * Given the specified list of Dates, get a list of sliced objects of the type handled by this rating engine.
   *
   * This method needs to be implemented provided that the subclass doesn't completely override the rateOnly()
   * method and also doesn't override shouldRateThisSliceForward() to always return false.
   */
  protected function getVersionsOnDates(dates : List<Date>) : List<SL> {
    throw "getVersionsOnDates is not implemented by this rating engine"
  }

  /**
   * Given an object of the type handled by this rating engine, return its slice date.
   *
   * This method needs to be implemented provided that the subclass doesn't completely override the rateOnly()
   * method and also doesn't override shouldRateThisSliceForward() to always return false.
   */
  protected function getSliceDate(slice : SL) : Date {
    throw "getSliceDate is not implemented by this rating engine"
  }

  /**
   * Log message emitted by rate().  This is implemented as a property so that it can be overridden by subclasses.
   */
  protected property get RatingLogMessage() : String {
    return "Rating " + Branch
  }

  /**
   * The core rating function, which calls out to rateOnly(), then attaches the results.  This method is the entry
   * point for the PCRatingPlugin to use in rating each line.  Generally speaking, if a particular subclass
   * wishes to bypass the general rating control structure, the rateOnly() method should be overridden instead of
   * the rate() method.
   */
  function rate() {
    PCFinancialsLogger.logInfo( RatingLogMessage )

    var costs = Collections.unmodifiableMap(rateOnly())
    PCProfilerTag.RATE_ATTACH_COSTS.execute(\ -> attachCostEntities(costs))

    PCProfilerTag.RATE_VALIDATE.execute(\ -> costs.Keys.each(\ line -> validateLine(line)))

    PCFinancialsLogger.logInfo(RatingLogMessage + "done" )
  }

  /**
   * The core rating loop.  For subclasses that wish to bypass this general control structure, this method can
   * be overridden.  The general loop is as described in the class-level javadoc:  rate slices (including rating
   * just from the change date forward if possible), merge and prorate, and then rate window costs.
   */
  protected function rateOnly() : Map<PolicyLine, List<CostData>> {
    var lineVersions : java.util.List<SL>
    PCProfilerTag.RATE_SLICES.execute(\ -> {
      lineVersions = getVersionsOnDates(AllEffectiveDates)
      if (shouldRateThisSliceForward()) {
        // 1a.  Extract CostData objects for all existing costs prior to the effective date of the change, and just rate from
        // the change slice forward
        var editEffectiveDate = Branch.EditEffectiveDate
        extractCostDatasFromExistingCosts(existingSliceModeCosts(), editEffectiveDate)
        rateSlices(lineVersions.where(\l -> getSliceDate(l) >= editEffectiveDate))
      } else {
        // 1a.  If it's not a change, just rate all slices
        rateSlices(lineVersions)
      }
    })

    // 1b and 1c.  Merge and then pro-rate the costs.
    PCProfilerTag.RATE_MERGE.execute(\ -> {
      CostDataMap.eachKey(\ line -> {
        var datas = CostDataMap.get(line)
        datas = mergeCosts(datas)
        CostDataMap.put(line, datas)
      })
    })
    PCProfilerTag.RATE_PRORATE.execute(\ -> {CostDataMap.eachValue(\ costDatas -> updateAmounts(costDatas))})

    // 2. Rate costs across slices
    PCProfilerTag.RATE_WINDOW.execute(\ -> rateWindow(lineVersions.first()))

    return CostDataMap
  }

  private function rateSlices(lineVersions : List<SL>) {
    lineVersions.each(\ lineVersion -> rateSlice(lineVersion))
  }

  /**
   * Returns true if rating should be done only from the effective date of the job forward, and false if the
   * whole period should be rated starting at the period start.  The general rule is that changes and
   * reinstatements are rated from the change date forward provided that the period start date hasn't changed,
   * and all other jobs always rate the whole period.
   *
   * Subclasses can override this to return true in the event that the whole period always needs to be rerated for that
   * line of business; generally that's necessary if the line allows for edits that are prior to the effective date
   * of the job.  For example, in GL or WC, any job can result in changes prior to the effective date
   * of that job due to the way exposures are edited in window mode.
   */
  protected function shouldRateThisSliceForward() : boolean {
    // We rate from the effective date forward if it's a change AND the period start date hasn't changed
    // If the start date changes, it can change the number of days in the rated term, which can affect the proration
    // even on costs prior to the change date, so we just have to re-rate the whole thing
    if (Branch.Job typeis PolicyChange or Branch.Job typeis Reinstatement) {
      var basedOnPeriod = Branch.BasedOn
      return Branch.PeriodStart == basedOnPeriod.PeriodStart
    } else {
      return false
    }
  }

  protected function attachCostEntities(costDatasByLine : Map<PolicyLine, List<CostData>>) {
    costDatasByLine.eachKeyAndValue( \ line, costs -> attachCostEntitiesForLine(costs, line))
  }

  /**
   * Attaches the specified CostData objects to the line and removes any costs that are currently on the line but
   * which should no longer be there.
   */
  protected function attachCostEntitiesForLine(costDatas : List<CostData>, line : PolicyLine) {
    var untouchedCurrentCostEntities = line.Costs
    var ratedCosts : List<Cost> = {}

    PCProfilerTag.COST_PRELOAD.execute(\ -> preLoadCostArrays())
    PCProfilerTag.COST_KEEP_CHANGED.execute(\ -> {
      for (costData in costDatas) {
        var costEntity = costData.getPopulatedCost(line)
        ratedCosts.add(costEntity)
        untouchedCurrentCostEntities.remove(costEntity)
      }
    })
    PCProfilerTag.COST_REMOVE_UNUSED.execute(\ -> {
      for (costEntity in untouchedCurrentCostEntities) {
        costEntity.removeFromTerm()  // removes the cost entirely
      }
    })

  }

  /**
   * An optional method which is called before conversion of CostData objects to Cost entities.
   * Lines of business where a single policy is expected to have many costs may want to implement
   * this to load all of the costs at once (rather than one at a time) for performance reasons.
   */
  protected function preLoadCostArrays() {
  }

  /**
   * This function is a sanity check that ensures that, after costs are all attached, for any given period of
   * time there is only one Cost with a given CostKey.  If this method fails, it indicates that the rating logic
   * has failed, either by producing duplicate costs erroneously or by incorrectly defining the cost datamodel such that
   * duplicate costs can be produced during expected operation.
   */
  private function validateLine(line : PolicyLine) {
    var costsByKey = line.Costs.partition(\ c -> c.CostKey)
    PolicyPeriodTransactionCalculator.ensureSingleCostPerDateSegment(costsByKey)
  }

  /**
   * Merge any of the given costs that are attributed to the same elements (i.e. have the same CostKey) and
   * abut each other in effective time.  Note that this method returns a new list of costs, rather than modifying
   * the existing one in place.
   */
  protected function mergeCosts<C extends CostData>(costs : List<C>) : List<C> {
    var costsToReturn : List<C> = {}

    // Chop up the CostDatas by key
    var costKeyLists = costs.partition(\ cost -> cost.Key).Values
    costKeyLists.each(\ costList -> costList.sortBy(\ cost -> cost.EffectiveDate))
    for (costsPerKey in costKeyLists) {
      var lastCost : CostData = null
      for (cost in costsPerKey) {
        if (lastCost == null or not attemptToMerge(lastCost, cost)) {
          lastCost = cost
          costsToReturn.add(cost)
        }
      }
    }
    return costsToReturn
  }

  /**
   * Attempts to merge the two costs, returning true if the merge was successful and false otherwise.  The costs
   * will be merged either as basis scalable or not, as the costs themselves dictate.
   */
  protected function attemptToMerge(lastCost : CostData, cost : CostData) : boolean {
    if (lastCost.MergeAsBasisScalable == cost.MergeAsBasisScalable) {
      if (lastCost.MergeAsBasisScalable) {
        return lastCost.mergeAsBasisScalableIfCostEqual( cost )
      } else {
        return lastCost.mergeIfCostEqual( cost )
      }
    } else {
      throw "Cost ${lastCost} and cost ${cost} have the same key, but one is basis scalable and the other is not"
    }
  }

  /**
   * Calls the updateAmount() function, which prorates any costs that don't yet have an ActualAmount set,
   * on each of the specified costs.
   */
  protected function updateAmounts(costs : Collection<CostData>) {
    var quoteRoundingLevel = Branch.Policy.Product.QuoteRoundingLevel
    var quoteRoundingMode = Branch.Policy.Product.QuoteRoundingMode
    costs.each(\ c -> c.updateAmountFields(quoteRoundingLevel, quoteRoundingMode, Branch.PeriodStart))
  }

  /**
   * Helper function to assert that the specified bean is in slice mode.
   */
  protected function assertSliceMode( effDatedBean : EffDated ) {
    if( not effDatedBean.Slice ) {
      throw "Cannot rate ${effDatedBean} because it is not in slice mode."
    }
  }

  /**
   * Helper function to assert that the specified bean is in window mode (i.e. not in slice mode)
   */
  protected function assertWindowMode( effDatedBean : EffDated ) {
    if( effDatedBean.Slice ) {
      throw "Cannot rate ${effDatedBean} because it is not in window mode."
    }
  }

  /**
   * Helper function to, given a particular date, find the next effective date following this date.  This function
   * is used when rating in slice mode to easily figure out when the next change is and thus how wide the slice is.
   */
  protected function getNextSliceDateAfter(start : Date) : Date {
    var ret = AllEffectiveDates.firstWhere(\ d -> d > start)
    return ret == null ? Branch.PeriodEnd : ret
  }

  /**
   * If shouldRateThisSliceForward() returns true, this method will be called to extract CostData objects from any
   * existing slice-mode costs on the line.  This method will result in adding CostDatas to the internal list for
   * any cost that is effective prior to the given cutOffDate, and any costs that fall across the boundary will
   * be pro-rated.  In the case of normal, non-basis-scalable costs, that pro-ration is accomplished by removing
   * the ActualAmount so that the cost can potentially be merged back in with any slice that rating comes up with,
   * before being re-prorated after slice rating completes.
   */
  protected function extractCostDatasFromExistingCosts(existingCosts : Iterable<Cost>, cutOffDate : Date) {
    for (c in existingCosts) {
      if (c.ExpirationDate < cutOffDate) {
        // Create it and leave it pro-rated, since it can't overlap/abut anything
        var costData = createCostDataForCost(c)
        addCost(getPolicyLineForCost(c), costData)
      } else if (c.EffectiveDate < cutOffDate) {
        // Create it and remove the amount so it gets pro-rated, since it overlaps/abuts the cut off date and thus could potentially need to be merged
        var costData = createCostDataForCost(c)
        var rounding = c.RoundingLevel == null ? Branch.Policy.Product.QuoteRoundingLevel : c.RoundingLevel
        costData.ExpirationDate = cutOffDate
        // If we're merging as basis scalable, then prorate the basis and all the amount fields
        if (costData.MergeAsBasisScalable) {
          // We have to prorate this to a higher degree of accuracy than the normal quote level
          // in order to avoid problems when these are re-merged.   Nevertheless, the rounding level
          // on the costData should be the one that was copied directly off the cost.
          costData.Basis = prorateToCutOffDate(c, cutOffDate, c.Basis, rounding)
          costData.ActualTermAmount = prorateToCutOffDate(c, cutOffDate, c.ActualTermAmount, rounding + 2)
          costData.ActualAmount = prorateToCutOffDate(c, cutOffDate, c.ActualAmount, rounding + 2)
          costData.StandardTermAmount = prorateToCutOffDate(c, cutOffDate, c.StandardTermAmount, rounding + 2)
          costData.StandardAmount = prorateToCutOffDate(c, cutOffDate, c.StandardAmount, rounding + 2)
          costData.OverrideAmount = prorateToCutOffDate(c, cutOffDate, c.OverrideAmount, rounding + 2)
          costData.OverrideTermAmount = prorateToCutOffDate(c, cutOffDate, c.OverrideTermAmount, rounding + 2)
        } else {
          if (c.OverrideAmount == null) {
            // If the amount hasn't been overridden, then null it out so that it will be re-prorated
            costData.ActualAmount = null
          } else {
            // Otherwise, prorate both the override and the actual amount; at least that ought to give us something more correct than
            // leaving them intact.   Here again, the comments above about rounding level applies.
            costData.ActualAmount = prorateToCutOffDate(c, cutOffDate, c.ActualAmount, rounding + 2)
            costData.OverrideAmount = prorateToCutOffDate(c, cutOffDate, c.OverrideAmount, rounding + 2)
          }
        }
        addCost(getPolicyLineForCost(c), costData)
      } else {
        // It's out of bounds, so totally ignore it
      }
    }
  }

  /**
   * Adds the specified cost to the internal list.
   */
  protected function addCost(l : PolicyLine, c : CostData) {
    if (c != null) {
      if (l == null) throw new IllegalArgumentException("Line may not be null")

      CostDataMap.get(l).add(c)
    }
  }

  /**
   * Removes the specified cost from the internal list
   */
  protected function removeCost(c : CostData) {
    if (c != null) {
      for (costDatas in CostDataMap.Values)
       if (costDatas.remove(c)) { // found
         break
       }
    }
  }

  /**
   * Prorates the specified amount from the effective date of the cost to the given cutOffDate.  If the amount is null,
   * this method will also return null.
   */
  private function prorateToCutOffDate(c : Cost, cutOffDate : Date, amount : BigDecimal, roundingLevel : int) : BigDecimal {
    if (amount == null) {
      return null
    } else {
      // if the rounding mode used here should be the same as the rounding mode configed for the
      // product in the product model, which is also the rounding mode the transaction calculator
      // is using.
      return Prorater.forRounding(roundingLevel, Branch.Policy.Product.QuoteRoundingMode, c.ProrationMethod)
          .prorate( c.EffectiveDate, c.ExpirationDate, c.EffectiveDate, cutOffDate, amount )
    }
  }

  /**
   * The rate to apply to the penalty for a short rate cancellation.
   * This is used by most lines other than WC, which uses a more complicated
   * lookup in the WCRatingContext.
   */
  protected property get ShortRatePenaltyRate() : BigDecimal {
    return 0.1  // charge 10% for demo purposes
  }

  /**
   * Return the tax rate for the given state (for demo purposes).  Zip code can affect local
   * sales taxes, but it is not used here.
   */
  protected function getStateTaxRate( st : Jurisdiction ) : BigDecimal {
    var rate = 0.055  // Default for demo purposes

    if (st == "CA") { rate = 0.0725 }
    else if (st == "KY") { rate = 0.06 }

    return rate
  }

  /**
   * The number of days that the rates returned by the demo rating engine correspond to.  For demo purposes,
   * we base this on the default term type for the product.  In a production environment, this would most likely
   * be hardcoded into the rating engine, or perhaps be an input telling it which rate tables to use.
   */
  protected property get NumDaysInCoverageRatedTerm() : int {
    var p = Prorater.forFinancialDays(TC_PRORATABYDAYS)
    var endDate = Plugins.get(IPolicyTermPlugin).calculatePeriodEnd(Branch.PeriodStart, Branch.Policy.Product.DefaultTermType, Branch)
    switch(Branch.Policy.Product.DefaultTermType) {
      case "Annual":  return endDate.compareIgnoreTime( Branch.PeriodEnd ) == 0 ? Branch.NumDaysInPeriod :
          p.financialDaysBetween("01/01/2010" as Date, "01/01/2011" as Date)
      case "HalfYear" : return p.financialDaysBetween(endDate, Branch.PeriodStart)
        default: throw "Unexpected term type ${Branch.Policy.Product.DefaultTermType}"
    }
  }

  // _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/ _/

  // CurrencyAmountScaleTable section

  enum AmountKeyScale {
    InterimRateScale,
    FinalAmountScale
  }

  private static final var _maxScaleOfRateDataType = 4

  /**
   * For each currency, define an InterimRateScale and a FinalAmountScale.
   * InterimRateScale
   *   The InterimRateScale applies to fields on CostData which are normally multiplicands, such as StandardAdjustedRate.
   *   They are stored as a "Rate" and are given a "rate" scale which can have a precision that is greater than what the currency allows.
   * FinalAmountScale
   *   The FinalAmountScale applies to fields on CostData which are normally currency amounts such as StandardTermAmount.
   *   They are stored as a currency.  The precision of the FinalAmountScale must be less than or equal to the precision of the currency.
   *
   * Specify the values as a Map where each key is a Currency and each value is a List<Integer> of length two. The first Integer is the InterimRateScale and the second Integer is the FinalAmountScale.
   * I found it more intuitive and visually pleasing to group both values with the Currency (even though the table is eventually divided into two).
   */
  internal static var _currencyAmountScaleTable : Map<Currency, List<Integer>> = {
      "usd" -> {
          4,        // InterimRateScale
          2         // FinalAmountScale
      },
      "jpy" -> {
          2,        // InterimRateScale
          0         // FinalAmountScale
      },
      "eur" -> {
          4,        // InterimRateScale
          2         // FinalAmountScale
      },
      "gbp" -> {
          4,        // InterimRateScale
          2         // FinalAmountScale
      },
      "cad" -> {
          4,        // InterimRateScale
          2         // FinalAmountScale
      },
      "aud" -> {
          4,        // InterimRateScale
          2         // FinalAmountScale
      },
      "rub" -> {
          4,        // InterimRateScale
          2         // FinalAmountScale
      }
  }

  /**
   * Perform checks on the values from the _currencyAmountScaleTable
   * The InterimRateScale must be less than or equal to the scale of the 'rate' datatype, which is 4
   * The FinalAmountScale must be less than or equal to the precision of the currency.
   */
  private static function performMinimumChecks(tableArg : Map<Currency, List<Integer>>) : Map<Currency, List<Integer>> {
    tableArg.eachKeyAndValue(\ currency, list -> {
      if (list[0] > _maxScaleOfRateDataType) {
      list[0] = _maxScaleOfRateDataType
      PCLoggerCategory.FINANCIALS.warn("The specified Interim Rate Scale for currency ${currency} is greater than the scale of the 'rate' datatype, which is ${_maxScaleOfRateDataType}. Resetting the Interim Rate Scale to ${_maxScaleOfRateDataType}.")
    }
      var currencyStorageScale = CurrencyUtil.getStorageScale(currency)
      if (list[1] > currencyStorageScale) {
      list[1] = currencyStorageScale
      PCLoggerCategory.FINANCIALS.warn("The specified Final Amount Scale for currency ${currency} is greater than the storage precision of the currency, which is ${currencyStorageScale}. Resetting the Final Amount Scale to ${currencyStorageScale}.")
    }
    })
    return tableArg
  }

  static var _checkedTable = performMinimumChecks(_currencyAmountScaleTable)

  /**
   * Divide the _currencyAmountScaleTable into two separate tables based on the InterimRateScale and FinalAmountScale respectively.
   */
  internal static var _interimRateScaleTable : Map<Currency, Integer> = _checkedTable.mapValues(\ list -> list.first())
  internal static var _finalAmountScaleTable : Map<Currency, Integer> = _checkedTable.mapValues(\ list -> list.last())

  /**
   * CurrencyAmountScale is an inner class which provides methods to access the values of the _currencyAmountScaleTable
   */
  public static class CurrencyAmountScale {
    static function getInterimRateScale(currencyArg : Currency) : Integer {
      return _interimRateScaleTable.get(currencyArg)
    }

    static function getFinalAmountScale(currencyArg : Currency) : Integer {
      return _finalAmountScaleTable.get(currencyArg)
    }

    static function getCurrencyScale(currencyArg : Currency, keyScale : AmountKeyScale) : Integer {
      return keyScale == InterimRateScale
          ? getInterimRateScale(currencyArg)
          : getFinalAmountScale(currencyArg)
    }
  }
}