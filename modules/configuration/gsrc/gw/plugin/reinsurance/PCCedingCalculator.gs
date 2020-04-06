package gw.plugin.reinsurance

uses gw.api.domain.financials.TransactionFinder
uses gw.api.reinsurance.CedingRecipient
uses gw.api.reinsurance.RIAttachment
uses gw.api.reinsurance.RICededPremiumAmount
uses gw.api.reinsurance.RICededPremiumContainer
uses gw.api.reinsurance.RIUtil
uses gw.api.system.PCConfigParameters
uses gw.currency.fxrate.FXRate
uses gw.financials.PolicyPeriodFXRateCache
uses gw.financials.Prorater
uses gw.pl.currency.MonetaryAmount
uses gw.plugin.Plugins
uses gw.pl.persistence.core.Bundle
uses gw.util.AutoMap

uses java.lang.Comparable
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.util.Collection
uses java.util.Date
uses java.util.Map
uses java.util.Set
uses gw.api.util.CurrencyUtil

/**
 * This is the out-of-the-box calculator for Ceded Premium calculations.   As configured, it will cede
 * against WRITTEN amounts, creating cedings for Proportional agreements and all types of Facultative agreement.
 * A Fac flat cost will be allocated across all of the premiums that apply to the risk that is insured by that Fac.
 * We require that the ENTIRE Fac cost will be allocated, even if (for some reason) the dates do not correspond.
 *
 * The first level of configuration that can be done is in this file:
 * (1) change canCalculateCeding()
 * (2) change attachmentOrderFunction()
 *
 * To cede against other types of agreements, you will probably need to create suitable adapters to
 * calculate the cedings.    These extend CedingRecipientAdapter; see ProportionalCedingRecipientAdapter,
 * FacNXOLCedingRecipientAdapter and FacXOLCedingRecipientAdapter for examples.
 */
@Export
class PCCedingCalculator {
  var _plugin : IReinsuranceCedingPlugin as readonly CedingPlugin = Plugins.get(IReinsuranceCedingPlugin)

  construct() { }

  // primarily for testing
  protected construct(level : int, type : java.math.RoundingMode) {
    _roundingLevel = level
    _roundingType = type
  }

  /////      /////     /////     /////     START OF CONFIGURATION SECTION      /////     /////     /////     /////

  // these are generally used when operating on transactions, to imitate the behavior of Rating
  protected var _roundingLevel: int as readonly RoundingLevel
  protected var _roundingType: java.math.RoundingMode as readonly RoundingType

  // all RICededPremiums applicable to the policy period whose cedings are being computed
  protected var existingRICededPremiums : List<RICededPremium> = {}

  /**
   * CONFIGURATION FUNCTION
   *
   * find the scale to use for proration of sliced amounts.   If the cost was rated as
   * integral dollars, and the amount we are dealing with is still in integral dollars
   * we prefer to prorate in dollars as well, even though the BigDecimal
   * in which it is stored may have its scale set to include fractional digits.
   */
  protected function findScaleForProration(amount : BigDecimal) : int {
// causes a lot of test breaks...re-enable when there is time to work them out!
//    if (amount == (amount as int)) {
//      return 0
//    } else {
      return amount.scale()
//    }
  }

  /**
   * CONFIGURATION FUNCTION
   *
   * Decide whether cedings should be calculated against the supplied agreement.
   * By default, this method returns true for Proportional and Facultative agreements.
   *
   * This is a configuration chokepoint:  to implement ceding against other kinds
   * of agreements, this method must be modified to return true for that kind of agreement.
   * (More specific decision logic is, of course, also possible.)
   * @param agreement A reinsurance agreement which could, potentially, accept cedings
   * @return true if the agreement is of a type that the calculator knows how to cede
   */
  protected function canCalculateCeding(agreement : CedingRecipient) : boolean {
    return agreement typeis ProportionalRIAgreement
        or agreement typeis Facultative

// if/when adding support for NonProportional Agreements, need to check CalculateCededPremium, eg:
//
//      or (agreement typeis NonProportionalRIAgreement and not agreement.CalculateCededPremium)
//
// but bear in mind that, as of this writing, Fac agreements normally have this field
// set to false.
  }

  /**
   * CONFIGURATION FUNCTION
   *
   * Find the order in which to calculate cedings.   This starts by using the same ordering
   * used elsewhere in the Reinsurance system, to sort by agreement type.   Between attachments
   * with the same agreement type, the tie is broken by comparing their attachment points.
   *
   * @param a1 an RIAttachment to be compared
   * @param a2 an RIAttachment to be compared
   * @return True if a1 should sort BEFORE a2
   */
  protected function attachmentOrderFunction(a1 : RIAttachment, a2 : RIAttachment) : Boolean {

    var group1 = a1.Agreement.Subtype.PremiumCedingOrder
    var group2 = a2.Agreement.Subtype.PremiumCedingOrder

    if (group1 == group2) {
      // sort by attachment point, making null sort to the end.
      if (a2.Agreement.AttachmentPoint == null) return true  // numeric comparison against null is always false.
      if (a1.Agreement.AttachmentPoint == null) return false // If we don't special-case this, we get inconsistent behavior
      return a2.Agreement.AttachmentPoint > a1.Agreement.AttachmentPoint
    } else {
      return group1 < group2
    }
  }

  /////      /////     /////     /////     END OF CONFIGURATION SECTION      /////     /////     /////     /////

  /**
   * The public entry point to the ceding calculator.    Create or update cedings for the given
   * PolicyPeriod.   Anything new will be associated with the given reason and comment
   * @param period The period for which cedings will be calculated
   * @param reason The reason code associated with this calculation
   * @param comment An optional comment string describing the reason for the calculation
   */
  public function processCedings(period : PolicyPeriod, reason : RIRecalcReason, comment : String) : List<RICededPremium> {
    _roundingLevel = CurrencyUtil.getStorageScale(period.PreferredSettlementCurrency)
    _roundingType = CurrencyUtil.getRoundingMode()
    existingRICededPremiums = CedingPlugin.findRICededPremiums(period.PolicyTerm)

    var processedCosts : Map<String, List<CedingCost>>
    var cedings : List<RICededPremium>

    // Just in case this calculator is being re-used, clear the cache.
    attachmentCache.clear()

    gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
      existingRICededPremiums = existingRICededPremiums.map(\ p -> p.addToBundle(bundle))
      var refDate = Date.CurrentDate
      // First pass: scan the costs and generate date slices
      processedCosts = processCosts(bundle, period)
      gw.api.system.PCLoggerCategory.REINSURANCE_CEDING_PLUGIN
        .debug("${processedCosts.Keys.Count} cost key, ${processedCosts.Values.sum(\ v -> v.Count)} total costs identified during ceding calculation")

      // Second pass: create cedings from the date sliced amounts.
      // For each one, compare the calculated amount against what is in the database,
      // and create offsets and onsets to bring the totals into line
      cedings = createCedings(bundle, period, processedCosts.Values, reason, comment)
      gw.api.system.PCLoggerCategory.REINSURANCE_CEDING_PLUGIN
        .debug("${cedings*.Cedings.where(\ c-> c.CalcTimestamp > refDate).Count} new cedings generated by ceding calculation")
    })

    return cedings
  }

  private var prorater = Prorater.forRounding(10, RoundingMode.HALF_UP, TC_PRORATABYDAYS) // ten decimal places -- will round later

  // generating these is time-consuming, so we cache them
  private var attachmentCache : Map<Reinsurable, Map<Date, List<RIAttachment>>> = {}

  public static class DateRange {
    private var _start : Date as readonly start
    private var _end   : Date as readonly end

    property get Empty() : boolean {
      return _start == _end
    }

    construct(s : Date, e : Date) {
      _start = RIUtil.adjustEffectiveTimeForRI(s)
      _end   = RIUtil.adjustEffectiveTimeForRI(e)
    }

    override function equals(obj : Object) : boolean {
      if (this === obj) {
        return true
      }
      if (obj typeis DateRange) {
        return this._start == obj._start and this._end == obj._end
      }
      return false
    }

    override function hashCode() : int {
      var res = 0
      if (null != _start) {
        res = _start.hashCode();
      }
      if (null != _end) {
        res *= 17;
        res ^= _end.hashCode();
      }
      return res;
    }

    override function toString() : String {
      return _start + " - " + _end;
    }

    function overlaps(other : DateRange) : boolean {
      if (Empty or other.Empty) return false
      return (other._end > this._start and this._end > other._start)
    }
  }

  /**
   * The "output" of the first stage contains the correct cedings, along with
   * all of the information we needed to process them to this stage and all
   * of what will be needed to generate ceding transactions from them.
   */
  class CedingCost {
    private var _cost : Cost as readonly Cost
    private var _written : Date as readonly WrittenDate
    private var _net : MonetaryAmount as readonly NetValue
    /**
     * Records foreign exchange rate used to convert FAC ceded premium for cost
     * to be passed through to ceding transaction.
     * This is optional since conversion is not necessary if there is no
     * currency differential. Also, it uses interface type to be independent
     * of rate implementation.
     */
    private var _rate : FXRate as FXRate
    private var _range : DateRange as readonly CostDates
    private var _reinsurable : Reinsurable as readonly Reinsurable
    private var _dates : List<DateRange> as readonly SliceDates
    // the data below are all stored in "parallel" arrays that correspond to the array of dates above.
    private var _slicedCosts : MonetaryAmount[] as readonly SlicedCosts
    private var _facCosts : Map<Facultative, MonetaryAmount[]> as FacCosts
    private var _facMarkups : Map<Facultative, MonetaryAmount[]> as FacMarkups
    private var _facCommissions : Map<Facultative, MonetaryAmount[]> as FacCommissions

    construct(c : Cost, v : MonetaryAmount, dr : DateRange, dates : List<DateRange>, r : Reinsurable, written : Date) {
      if (c == null) throw "CedingCost: Cost cannot be null"
      if (v == null) throw "CedingCost: NetValue cannot be null"
      if (dr == null) throw "CedingCost: CostDates cannot be null"
      if (dates == null or dates.Count == 0) throw "CedingCost: SliceDates cannot be null or empty"
      if (r == null) throw "CedingCost: Reinsurable cannot be null"

      _cost = c
      _written = written
      _net = v
      _range = dr
      _dates = dates
      _reinsurable = r
      _slicedCosts = prorateSlices(NetValue, dates, dr.start, dr.end).toTypedArray()
      _facCosts = {}
      _facMarkups = {}
      _facCommissions = {}
    }

    // THIS CONSTRUCTOR IS FOR TESTING PURPOSES ONLY
    construct(v : MonetaryAmount, start : Date, end : Date, dates : List<DateRange>) {
      _net = v
      _range = new DateRange(start, end)
      _dates = dates
      _facCosts = {}
      _facMarkups = {}
      _facCommissions = {}
    }

    override public function equals(other : Object) : boolean {
      if (this === other) {
        return true
      }
      if (other typeis CedingCost) {
        return this.Cost == other.Cost
           and this.NetValue == other.NetValue
           and this.CostDates.start == other.CostDates.start
           and this.CostDates.end == other.CostDates.end
           and this.WrittenDate == other.WrittenDate
      }
      return false
    }

    override public function hashCode() : int {
      // Allow null value for cost
      return (Cost == null ? 13151719 : Cost.hashCode()) + 11*NetValue.hashCode() + 13*CostDates.start.hashCode() + 19*CostDates.end.hashCode()
           + (WrittenDate == null ? 31517191 : WrittenDate.hashCode()*23)
    }

    override public function toString() : String {
      return "CedingCost[Cost = ${Cost}, NetValue = ${NetValue}, CostDates = (${CostDates.start} - ${CostDates.end})]"
    }

    public property get Empty() : boolean {
      return CostDates.Empty
    }
  }

  /**
   * Get all of the dates at which a risk is sliced, restricted to the dateRange provided.
   * Construct and return a list of contiguous DateRange objects.   The first element in the list
   * will begin with dateRange.start and the last one will end with dateRange.end.
   *
   * @param dateRange the range of dates we want returned
   * @param reinsurable the Reinsurable whose dates we are interested in
   * @return a List of DateRange objects describing all the in-range slices
   */
  protected function getRiskDateList(dateRange : DateRange, reinsurable : Reinsurable) : List<DateRange> {
    // The convention for slice dates is that the time component is one minute past midnight.
    // THIS MUST BE RIGIDLY ENFORCED OR SLICE CALCULATIONS WILL BREAK.
    if (dateRange.Empty or reinsurable.RIRisk == null) {
      return {dateRange}
    }

    var riskDates = reinsurable.RIRisk.VersionList.AllVersions
         .where(\ r -> r.ExpirationDate > dateRange.start and r.EffectiveDate < dateRange.end)
         .map(\ r -> new DateRange(r.EffectiveDate, r.ExpirationDate))

    var reinsurableDates = reinsurable.VersionList.AllVersions
         .where(\ r -> r.ExpirationDate > dateRange.start and r.EffectiveDate < dateRange.end)
         .map(\ r -> new DateRange(r.EffectiveDate, r.ExpirationDate))

     if (riskDates.Count == 0 and reinsurableDates.Count == 0) {
       // there is exactly one slice
       return {dateRange}
     }

    // smash together all dates from both of the above lists, removing every date
    // outside of the desired dateRange.   ALSO REMOVE the start date,
    // because we are going to start with that later.    Finally, sort the list.
    var allDates = riskDates.map(\r -> r.start).toSet()
                    .union(riskDates.map(\r ->r.end).toSet())
                    .union(reinsurableDates.map(\r -> r.start).toSet())
                    .union(reinsurableDates.map(\r -> r.end).toSet())
                    .union({dateRange.end})
                    .toList()
                    .where(\d -> d > dateRange.start and d <= dateRange.end)
                    .sort()

    // now we will build up a new list of DateRange entities by taking all of the dates
    // in the list, pairwise:
    var dateRanges : List<DateRange> = {}
    allDates.reduce(dateRange.start, \ v, d -> {
      dateRanges.add(new DateRange(v, d))
      return d
    })

    return dateRanges
  }

 /**
  * Fill in the FacCosts array on CedingCosts, using a list of all costs which pertain to a single risk.
  * FacMarkups and FacCommissions are filled in the same way.
  *
  * The method used is to find all current (net) direct premium against a given risk, and then prorate
  * the flat cost of a fac across these costs in proportion to their amounts.   E.g. if the list of
  * costs is {$100, %150, $250} and the flat cost of the fac is $100, the allocations would be
  *
  *     Cost      Proportion of total     Allocated fac cost
  *     $100         $100/$500 = 20%         20%*$100 = $20
  *     $150         $150/$500 = 30%         30%*$100 = $30
  *     $250         $250/$500 = 50%         50%*$100 = $50
  *
  * @param costList a list of CedingCost instances whose arrays will be filled in by this function
  * @param rateCache The cache of foreign exchange rates used to convert
  *                  coverage FAC cedings to premium currency amounts
  */
  protected function findSlicedFacAmounts(bundle : Bundle, costList : List<CedingCost>, rateCache: PolicyPeriodFXRateCache) {
    // Start by getting a list of all facs that apply to this policy
    var facsAtAttachmentDate = new AutoMap<Date, Set<Facultative>>(\ d -> { return {} })
    var allFacs : Set<Facultative> = {}
    costList.each(\ thisCost -> {
      thisCost.SliceDates.each(\ slice -> {
        var attachments = getAttachmentsForCeding(bundle, thisCost.Reinsurable, slice.start)
        var facs = attachments.map(\ a -> a.Agreement).whereTypeIs(Facultative).where(\ a -> a.CededPremium != null and a.CededPremium.Amount != 0)
        facsAtAttachmentDate.get(slice.start).addAll(facs)
        allFacs.addAll(facs)
      })
    })

    var premiumCurrency = rateCache.SettlementCurrency
    for (fac in allFacs) {
      var a = fac as RIAgreement
      // prorate only across costs where there's an attachment to the fac
      var costs = costList.where(\ c -> c.SliceDates.where(\ d -> facsAtAttachmentDate[d.start].contains(fac)).HasElements)
      var cededPremium = fac.CededPremium
      if (cededPremium.Currency <> premiumCurrency) {
        final var policyRate = rateCache.getPolicyFXRate(cededPremium)
        // record rate for all ceding cost's for this ceded premium
        // for pass-through to ceded premium transaction...
        costs.each(\ c -> {c.FXRate = policyRate})

        cededPremium = cededPremium.convertAmount(policyRate)
      }
      var prorated = prorateSlicesByCost(cededPremium, costs).toTypedArray()
      var markup = prorateSlicesByCost((fac.MarkUp == null ? 0bd.ofCurrency(premiumCurrency) : cededPremium*fac.MarkUp/100.00bd).rescale(), costs).toTypedArray()
      var commission = prorateSlicesByCost((cededPremium*a.Commission/100.00bd).rescale(), costs).toTypedArray()

      prorated.each(\ slice -> {
        var cost = slice.CostData
        var start = (cost.CostDates.start > a.EffectiveDate) ? cost.CostDates.start : a.EffectiveDate
        var end = (cost.CostDates.end < a.ExpirationDate) ? cost.CostDates.end : a.ExpirationDate
        var amount = slice.NetAmount
        var sliceDates = cost.SliceDates.map(\ d -> facsAtAttachmentDate[d.start].contains(fac) ? d : null)
        cost.FacCosts.put(fac, prorateSlices(amount, sliceDates, start, end).toTypedArray())
      })
      markup.each(\ slice -> {
        var cost = slice.CostData
        var start = (cost.CostDates.start > a.EffectiveDate) ? cost.CostDates.start : a.EffectiveDate
        var end = (cost.CostDates.end < a.ExpirationDate) ? cost.CostDates.end : a.ExpirationDate
        var amount = slice.NetAmount
        var sliceDates = cost.SliceDates.map(\ d -> facsAtAttachmentDate[d.start].contains(fac) ? d : null)
        cost.FacMarkups.put(fac, prorateSlices(amount, sliceDates, start, end).toTypedArray())
      })
      commission.each(\ slice -> {
        var cost = slice.CostData
        var start = (cost.CostDates.start > a.EffectiveDate) ? cost.CostDates.start : a.EffectiveDate
        var end = (cost.CostDates.end < a.ExpirationDate) ? cost.CostDates.end : a.ExpirationDate
        var amount = slice.NetAmount
        var sliceDates = cost.SliceDates.map(\ d -> facsAtAttachmentDate[d.start].contains(fac) ? d : null)
        cost.FacCommissions.put(fac, prorateSlices(amount, sliceDates, start, end).toTypedArray())
      })
    }
  }

  /**
   * A temporary data structure used to represent the "remaining" portion of a cost after prior offset
   * Transctions have been applied.
   */
  class CostChunk {
    var _cost : Cost as OriginalCost
    var _written : Date as readonly WrittenDate
    var _amount : MonetaryAmount as readonly NetAmount
    var _start : Date as Start
    var _end : Date as End

    construct(t : Transaction) {
      OriginalCost = t.Cost
      _written = t.WrittenDate
      _amount = t.AmountBilling
      Start = t.EffDate
      End = t.ExpDate
    }

    construct(c : Cost, s : Date, e : Date, a : MonetaryAmount, w : Date) {
      OriginalCost = c
      _written = w
      Start = s
      End = e

      _amount = a
    }

    // hashCode, equals and toString required for testing purposes
    override public function hashCode() : int {
      return (NetAmount as int) + Start.hashCode()*31 + End.hashCode()*11
           + (OriginalCost == null ? 24681357 : 7*OriginalCost.hashCode())
           + (WrittenDate == null ? 13572468 : 13*WrittenDate.hashCode())
    }

    override public function equals(b : Object) : boolean {
      if (this === b) {
        return true
      }
      if (b typeis CostChunk) {
        return this.NetAmount    == b.NetAmount
           and this.WrittenDate  == b.WrittenDate
           and this.Start        == b.Start
           and this.End          == b.End
           and this.OriginalCost == b.OriginalCost
      }
      return false
    }

    override public function toString() : String {
      return "CostChunk[NetAmount = ${NetAmount}, Start = ${Start}, End = ${End}, Cost = ${OriginalCost} Written = ${WrittenDate}]"
    }

    public function overlaps(t : Transaction) : boolean {
      return t.EffDate < End and Start < t.ExpDate and t.EffDate.daysBetween(t.ExpDate) > 0
    }

    // NOTE: this could be simplified.
    public function subtract(t : Transaction) : List<CostChunk> {
      var result : List<CostChunk> = {}

      if (t.EffDate <= Start and t.ExpDate >= End) {
        if (t.AmountBilling.abs() < NetAmount.abs()) {
          throw "Transaction spans whole CostChunk but has low value: " + t.AmountBilling.abs() + " vs. " + NetAmount.abs()
        }
        result.add(new CostChunk(OriginalCost, Start, Start, 0bd.ofCurrency(t.SettlementCurrency), t.WrittenDate)) // we need a zero-length chunk for a fully-reversed cost.
        return result
      } else if (t.EffDate > Start and t.ExpDate < End) {
        // need to prorate the amounts on either side.
        var totalDays = Start.daysBetween(End) - t.EffDate.daysBetween(t.ExpDate)
        var remainder = NetAmount + t.AmountBilling

        var amt1 = ((remainder*Start.daysBetween(t.EffDate)) / totalDays).setScale(RoundingLevel, RoundingType)
        var amt2 = (remainder - amt1).setScale(RoundingLevel, RoundingType)
        result.add(new CostChunk(OriginalCost, Start, t.EffDate, amt1, this.WrittenDate))
        result.add(new CostChunk(OriginalCost, t.ExpDate, End, amt2, this.WrittenDate))
      } else if (t.EffDate <= Start) {
        var txnDays = t.EffDate.daysBetween(t.ExpDate)
        var daysRemoved = t.ExpDate.daysBetween(Start)
        var amt = (NetAmount + t.AmountBilling*daysRemoved/txnDays).setScale(RoundingLevel, RoundingType)
        result.add(new CostChunk(OriginalCost, t.ExpDate, End, amt, this.WrittenDate))
      } else if (t.ExpDate >= End) {
        var txnDays = t.EffDate.daysBetween(t.ExpDate)
        var daysRemoved = End.daysBetween(t.EffDate)
        var amt = (NetAmount + t.AmountBilling*daysRemoved/txnDays).setScale(RoundingLevel, RoundingType)
        result.add(new CostChunk(OriginalCost, Start, t.EffDate, amt, this.WrittenDate))
      } else {
        throw "Some other case"
      }

      return result
    }
  }

  /**
   * Given a list of onset/offset transactions, convert it into a list of CostChunk
   * objects representing the remaining slices of direct premium.
   */
  protected function createCostChunks(currency : Currency, txns : List<Transaction>) : List<CostChunk> {
    // There are occasions where we actually have a negative COST, in which case the
    // onsets are negative and the offsets are positive!
    return createCostChunks(currency, txns, txns.first().Cost.ActualAmount.signum())
  }

  protected function createCostChunks(currency : Currency, txns : List<Transaction>, costSign : int) : List<CostChunk> {
    // this gives rough creation order, but sometimes puts offsets before the corresponding onset
    txns = txns.sortBy(\ t -> t.getFieldValue("Id") as Comparable)
    var results : List<CostChunk> = {}
    while (txns.HasElements) {
      var tmp = txns
      txns = {}
      for (t in tmp) {
        var matches = results.where(\ c -> c.overlaps(t) and c.OriginalCost == t.Cost)
        if (t.Amount.signum() == costSign) { // onset
          if (matches.HasElements) {
            // If we see an overlap, this onset is premature.   (The rating engine will
            // never create overlapping onsets on the same cost.)    Retry later.
            txns.add(t)
          } else {
            results.add(new CostChunk(t))
          }
        } else { // offset
          if (matches.HasElements) {
            results.removeAll(matches)
            matches.each(\ m -> {results.addAll(m.subtract(t))})
          } else {
            // If we didn't find an overlap, this offset is premature.  (The rating engine
            // can't create an offset unless there was an onset there already.)   Retry later.
            txns.add(t)
          }
        }
      }
      if (tmp.toSet().equals(txns.toSet())) {
        throw "Illegal set of transactions????"
      }
    }

    // eliminate duplicates
    results = results.toSet().toList().sortBy(\ r -> r.Start)
    if (not results.sum(currency, \ r -> r.NetAmount).IsZero) {
      // If we have a nonzero total, LEADING and TRAILING zero segments can be eliminated
      var begin = results.firstWhere(\ c -> not c.NetAmount.IsZero)
      var stop = results.lastWhere(\ c -> not c.NetAmount.IsZero)
      return results.where(\ r -> r.Start >= begin.Start and r.End <= stop.End)
    } else {
      // If our total is zero, we must leave them alone
      return results
    }
  }

  /**
   * Pass 1: Find all costs representing direct premium for the policy, and generate the
   * correct date-sliced amounts against which cedings can be calculated.
   *
   * @param bundle A writeable Transaction bundle
   * @parm period The policy period we are ceding for
   * @return a Map of a RiskNumber to the CedingCosts for that RiskNumber.
   */
  protected function processCosts(bundle : Bundle, period : PolicyPeriod) : Map<String, List<CedingCost>> {
    // The TransactionFinder looks across all slices, which is what we want.
    var transactions = TransactionFinder.instance.findPostedTransactions(period).where(\ t -> t.Cost.SubjectToRICeding)

    // For non-reporting policies there is typically only one set of Transactions (i.e. Written and Charged
    // simultaneously, but for polices subject to reporting there are two sets.   We need to narrow to one of them.
    if (PCConfigParameters.ReinsuranceCedeAgainstCharged.Value) {
      transactions = transactions.where(\ t -> t.Charged)
    } else {
      transactions = transactions.where(\ t -> t.Written)
    }

    new gw.util.TransactionGraph()
         .setOutput(\ str -> {gw.api.util.Logger.forCategory("IReinsuranceCedingPlugin").trace(str)})
         .drawDiagram(transactions)

    var processedCosts : List<CedingCost> = {}

    var byCost = transactions.partition(\ t -> t.Cost)

    // we need to be able to group costs together by Reinsurable, in order to pro-rate fixed costs for Fac
    // Do the initial processing into a temporary list of CedingCost objects
    byCost.eachKeyAndValue(\ cost, txns -> {

      // The list of transactions against a cost is allowed to have holes.   Create a list of
      // unreversed sections of cost, i.e. sections that have an onset and no offset.   Zero-length
      // chunks ARE created when an onset is fully reversed.
      var costChunks = createCostChunks(period.PreferredSettlementCurrency, txns)

      for (chunk in costChunks) {
        var reinsurable = getReinsurable(chunk.OriginalCost)
        if (reinsurable == null) {
          // no reinsurable, no risk, nothing to cede
          continue
        }
        var costNetValue = chunk.NetAmount

        var dateRange = new DateRange(chunk.Start, chunk.End)
        if (dateRange.Empty and chunk.Start.daysBetween(chunk.OriginalCost.EffectiveDate) == 0) {
          // use the whole range of the cost, so we reverse all slices
          dateRange = new DateRange(RIUtil.adjustEffectiveTimeForRI(chunk.OriginalCost.EffectiveDate),
                                    RIUtil.adjustEffectiveTimeForRI(chunk.OriginalCost.ExpirationDate))
        }

        // make sure costs and reinsurables are in the current bundle, so that later requests
        // for RIRisk and Attachments are not evaluated in a read-only bundle.
        cost = bundle.add(cost)
        reinsurable = bundle.add(reinsurable)

        // find all the date ranges that are applicable to this cost
        var sliceDates = getRiskDateList(dateRange, reinsurable)
        // and finally, create a CedingCost for this cost
        processedCosts.add(new CedingCost(cost, costNetValue, dateRange, sliceDates, reinsurable, chunk.WrittenDate))
      }
    })

    return processedCosts.partition(\ c -> c.Reinsurable.RiskNumber)
  }

  protected function mergeOK(curr : RICededPremiumAmount, next : RICededPremiumAmount) : boolean {
    // if this particular ceding already has an RICP with a split in this spot, we want to
    // disallow merging
    var ricp = existingRICededPremiums
        .where(\ ricp -> ricp.Cost == curr.RICededPremiumContainer.Cost and ricp.EffectiveDate == next.RICededPremiumContainer.EffectiveDate)
        .first() // can be at most one

    return (ricp == null) ? true
                          : (ricp.Cedings.where(\ c -> c.Agreement == next.Agreement).Count == 0)
  }

  /**
   * Merge amounts across slice dates if canMergeAmounts() declares them equivalent.
   * This is used to undo extraneous splits that are caused by program changes or
   * edits to the Reinsurable/RIRisk that don't actually affect ceding.
   */
  protected function mergeCedings(cededAmounts : List<RICededPremiumContainer>) : List<RICededPremiumContainer> {
    var orderFunction : block(a : RICededPremiumContainer, b : RICededPremiumContainer) : Boolean =
      \ a, b -> { return a.EffectiveDate < b.EffectiveDate ? true : a.ExpirationDate < b.ExpirationDate }

    // note that we do NOT merge slices with a zero amount; these are carried through
    // because they represent reversals and need to be properly dated.
    var amounts = cededAmounts.where(\ c -> c.SliceAmount.Amount != 0).sort(orderFunction)

    // we want to be able to do a "partial" merge so that, for example, a program/agreement
    // change which does not cause reapportionment of proportional cedings will not require
    // slicing up of those proportional cedings.
    //
    // For example, If we change program years, and an (N)XOL treaty expires but is replaced
    // by either Fac or a new treaty at the same attachment point, we should see
    // an additional ceding for the new agreement at that point, but the proportional treaties
    // should merge across that split point.

    while (amounts.HasElements) { // can't use for b/c we add to amounts
      var curr = amounts.remove(0)
      if (curr.Cedings.Empty) {
        continue // nothing to merge, and we want to avoid deleting an originally-empty container
      }
      var candidates = amounts.where(\ a -> a.EffectiveDate == curr.ExpirationDate).toList()
      for (next in candidates) {
        if (next.Cedings.Empty) {
          continue // nothing to merge, and we want to avoid deleting an originally-empty container
        }
        var newContainer = curr.createMergedContainer(next)
        // ceding order is one of the fields that is required for canMergeWith, so this should work fine
        var currCedings = curr.Cedings.partitionUniquely(\ c -> c.CalculationOrder)
        var nextCedings = next.Cedings.partitionUniquely(\ c -> c.CalculationOrder)
        for (j in currCedings.Keys.intersect(nextCedings.Keys)) {
          var c = currCedings[j]
          var n = nextCedings[j]
          if (c.canMergeWith(n) and mergeOK(c, n)) {
            var merged = c.createMergedAmount(n, newContainer)
            newContainer.addCeding(merged)
            curr.removeCeding(c)
            next.removeCeding(n)
          }
        }
        if (newContainer.Cedings.HasElements) {
          cededAmounts.add(newContainer)
          // after creating new container, need to try merging against it....
          amounts.add(0, newContainer)
        }
        if (curr.Cedings.Empty) {
          cededAmounts.remove(curr)
        }
        if (next.Cedings.Empty) {
          cededAmounts.remove(next)
        }
      }
    }

    return cededAmounts.sort(orderFunction)
  }

  /**
   * Pass 2: process the sliced amounts.  The list of values is assumed to be sorted
   * by RiskNumber (i.e. all versions of a single Reinsurable).
   * @param bundle A writeable Transaction bundle
   * @param period The policy period
   * @param values Multiple lists of CedingCost instances, grouped by Risk Number
   * @param reason A reason code to be used for the calculation history on any new Transactions
   * @param comment An optional comment string to be included in the calculation history
   * @return A list of all RICededPremium entities which were created or updated
   */
  protected function createCedings(bundle : Bundle, period : PolicyPeriod, values : Collection<List<CedingCost>>, reason : RIRecalcReason, comment : String) : List<RICededPremium> {
    var cedings : List<RICededPremium> = {}

    var timestamp = Date.CurrentDate

    var rateCache = new PolicyPeriodFXRateCache(period)
    for (costBuckets in values) {
      costBuckets = costBuckets.sortBy(\ c -> c.CostDates.start)
      findSlicedFacAmounts(bundle, costBuckets, rateCache)

      for (thisCost in costBuckets) {
        var cededAmounts : List<RICededPremiumContainer> = {}
        thisCost.SliceDates.eachWithIndex(\ slice, i -> {
          // generate cedings against cost
          var amounts = cedeForOneCostSlice(bundle, thisCost.Reinsurable, slice, thisCost, i, reason, comment)
          cededAmounts.add(amounts)
        })

        cededAmounts = mergeCedings(cededAmounts)

        // compare to existing (if any) and create new transactions
        var ceded = generateCedingTransactions(bundle, cededAmounts, timestamp)
        cedings.addAll(ceded)
      }
    }

    return cedings
  }

  /**
   * Create a set of Cedings for one date slice of one Cost.
   * @param reinsurable The reinsurable that cedings apply to
   * @param thisDate The date slice being ceded
   * @param thisCost The CedingCost that will be used to generate the ceding
   * @param sliceIndex The index that corresponds to thisDate
   * @param reason A reason code to be used for the calculation history on any new Transactions
   * @param comment An optional comment string to be included in the calculation history
   * @return An RICededPremiumContainer containing the calculated Cedings
   */
  protected function cedeForOneCostSlice(bundle : Bundle, reinsurable : Reinsurable, thisDate : DateRange,
                                         thisCost : CedingCost, sliceIndex : int,
                                         reason : RIRecalcReason, comment : String) : RICededPremiumContainer {
    var attachments = getAttachmentsForCeding(bundle, reinsurable, thisDate.start)
    var amount = thisCost.SlicedCosts[sliceIndex]

    // RICededPremiumContainer wants a map of Fac to {FacAmount, Markup, Commission} for this date slice
    var facAmounts : Map<Facultative, RICededPremiumContainer.FacCeding> = {}
    thisCost.FacCosts.eachKey(\ fac ->
        facAmounts.put(fac, new RICededPremiumContainer.FacCeding(thisCost.FacCosts[fac][sliceIndex],
                                                                  thisCost.FacMarkups[fac][sliceIndex],
                                                                  thisCost.FacCommissions[fac][sliceIndex])))

    var cededPremium = new RICededPremiumContainer(thisCost.Cost, thisCost.FXRate, reinsurable, thisDate.start, thisDate.end,
                                                   amount, thisCost.WrittenDate, facAmounts, reason, comment)

    attachments.where(\ a -> canCalculateCeding(a.Agreement)).eachWithIndex(\ attachment, i -> {
      var calcOrder = i + 1 // index is zero-based, calculation order is 1-based
      var ceding = attachment.Agreement.createCeding(cededPremium, attachment, calcOrder, cededPremium.Cedings)
      cededPremium.addCeding(ceding)
    })

    return cededPremium
  }

  /**
   * Check to see whether an existing transaction and a new ceding amount represent a change in
   * ceding due to a change in the underlying agreement.  Either parameter may be null.   The endDate
   * here is the end date of the portion of txn that is still valid (often it is txn.EffectiveDate, but
   * in the case of a partial offset it can be an earlier date.)
   *
   * @param txn The existing transaction
   * @param amt The new amount
   * @param residualGNP The GNP of the unreversed portion of txn
   * @param residualAmount The Ceding amount of the unreversed portion of txn
   * @return true if the transaction and amount appear to differ because of a change to their (shared) agreement
   */
  protected function agreementHasChanged(txn : RICededPremiumTransaction, amt : RICededPremiumAmount) : boolean {

    // if either one is null, no way to compare
    if ((txn == null) or (amt == null)) {
      return false
    }

    if (  (txn.CommissionRate != amt.Agreement.Commission)
       or (amt.CededRisk != txn.CededRiskAmount)) {
      return true // this is always considered a change
    }

    if (amt.Agreement typeis Facultative and not (amt.Agreement typeis ProportionalRIAgreement)) {
      return (amt.Agreement.MarkUp != txn.MarkupRate)
    }

    return txn.CedingRate != amt.CedingRate
  }

  protected function earningRateHasChanged(txn : RICededPremiumTransaction, amt : RICededPremiumAmount) : boolean {

    if (!(amt.Agreement typeis Facultative and not (amt.Agreement typeis ProportionalRIAgreement))) {
      return false
    }

    // Earning rate changed.
    if (    txn.CededPremium == amt.CededPremium
        and txn.EffectiveDate == amt.RICededPremiumContainer.EffectiveDate
        and txn.ExpirationDate != amt.RICededPremiumContainer.ExpirationDate) {
      return true
    }
    return false
  }

  // make sure we don't create multiple histories for the same RICededPremium
  private var histories : Map<RICededPremium, RICededPremiumHistory> = {}

 /**
  * This is the core of the transaction calculator: it calculates and creates an offset and/or onset which will bring
  * the current total in line with the amount that was previously calculated for a single agreement over a single
  * timeslice.
  *
  * This function was separated out so that its behavior could be tested in isolation.
  */
  protected function makeTransactionsForOneAgreement(ricp : RICededPremium, calc : RICededPremiumContainer,
                                                    previous : List<RICededPremiumTransaction>,
                                                    current : RICededPremiumAmount,
                                                    timestamp : Date): boolean  {
      var costSign = ricp.Cost.ActualAmountBilling.signum()
      var tCurrency = ricp.Cost.SettlementCurrency
      var previousAmount = previous.sum(\ r -> r.CededPremium.Amount)
      var allOnsets = previous.where(\ r -> r.CededPremium.signum() == costSign).sortBy(\ r -> r.CalcTimestamp)
      var prevOnset = allOnsets.last()
      var residualGNP = previous.sum(tCurrency, \ r -> r.BasisGNP)
      var endDate : Date = prevOnset.ExpirationDate
      var prevOffsets : List<RICededPremiumTransaction> = {}
      if (prevOnset != null) {
        if (prevOnset.ExpirationDate < ricp.ExpirationDate) {
          endDate = prevOnset.ExpirationDate // a slice could have already been trimmed off
        }
        // If there are offsets which have trimmed off part of the slice, we have to pick those up.
        // They will be timestamped LATER than the onset and have an EffectiveDate > ricp.EffectiveDate.
        prevOffsets = previous.where(\ r -> r.CededPremium.signum() != costSign and r.CalcTimestamp > prevOnset.CalcTimestamp and r.EffectiveDate > ricp.EffectiveDate)
            .sortBy(\ r -> r.EffectiveDate)
        if (prevOffsets.Count > 0) {
          endDate = prevOffsets.first().EffectiveDate
        }
      }

      var amount = (current.CededPremium == null) ? -previousAmount : current.CededPremium.Amount - previousAmount
      var doReversal = (previousAmount != 0 and (agreementHasChanged(prevOnset, current) or earningRateHasChanged(prevOnset, current)))
      // if amount != 0 and current.BasisGNP == residualGNP, we are at risk of generating an offset or onset w/zero GNP.
      // in certain cases it is OK for BasisGNP to be zero (e.g. previous cedings ate it all) but in other cases it's not OK.
      if (not doReversal and current != null and amount != 0) {
        doReversal = (current.BasisGNP == residualGNP and current.BasisGNP.Amount != 0)
      }

      if (amount == 0 and not doReversal) {
         return false // no new transaction if amounts match up and agreements haven't changed
      }

      var history = histories.get(ricp)
      if (history == null) {
        history = ricp.createAndAddHistory(Date.Today, calc.Reason, calc.Comment)
        histories.put(ricp, history)
      }

      // generate offsets and onsets as RICededPremiumTransaction entities
      if (amount.signum() != costSign or doReversal) { // generate an offset
        // NOTE: createOffsetTransaction automatically copies certain information from the onset,
        // so that the offset goes against the same agreement that the initial onset went to.
        // If we were ever to support Loss-Date attachment ceding on a written basis, we would
        // probably need a different version of createOffsetTransaction which uses the new
        // onset information, because those treaties cede the offset to the agreement in force
        // at the time the *offset* is written.

        var offset = ricp.createOffsetTransaction(prevOnset, history, timestamp)
        offset.PolicyFXRate = calc.FXRate as PolicyFXRate
        if (doReversal or current == null or amount == -previous.sum(\ r -> r.CededPremium.Amount)) {

          // full reversal
          offset.BasisGNP           = -previous.sum(tCurrency, \ r -> r.BasisGNP)
          offset.CededPremium       = -previous.sum(tCurrency, \ r -> r.CededPremium)
          offset.CededPremiumMarkup = -previous.sum(tCurrency, \ r -> r.CededPremiumMarkup)
          offset.Commission         = -previous.sum(tCurrency, \ r -> r.Commission)
          offset.EffectiveDate      = calc.EffectiveDate
          offset.ExpirationDate     = endDate

          amount -= offset.CededPremium.Amount // reverse the amount we gave back so we can onset it below
        } else {
          offset.CededPremium       = amount.ofCurrency(tCurrency)
          offset.BasisGNP           = current.BasisGNP - residualGNP
          offset.CededPremiumMarkup = current.CededPremiumMarkup - previous.sum(tCurrency, \ t -> t.CededPremiumMarkup)
          offset.Commission         = current.Commission - previous.sum(tCurrency, \ t -> t.Commission)
          if (offset.BasisGNP.Amount == 0 and current.BasisGNP.Amount != 0) throw "BasisGNP should not be zero for an offset unless onset GNP was also 0."
          // this date is only correct for a partial reversal caused by a date slice
          if (current.RICededPremiumContainer.ExpirationDate < ricp.ExpirationDate) {
            offset.EffectiveDate      = current.RICededPremiumContainer.ExpirationDate
          } else {
            offset.EffectiveDate      = calc.EffectiveDate
          }
          offset.ExpirationDate     = endDate
        }
      }

      // this must come after the offset handling, in case we modified the amount
      if (amount.signum() == costSign and current != null) {
        // transaction will be created with the full amounts in current
        var txn = ricp.createCedingTransaction(current, history, timestamp)
        txn.PolicyFXRate = calc.FXRate as PolicyFXRate
        if (not doReversal) {
          txn.CededPremium       = amount.ofCurrency(tCurrency)
          txn.BasisGNP           = current.BasisGNP - residualGNP
          txn.CededPremiumMarkup = current.CededPremiumMarkup - previous.sum(tCurrency, \ t -> t.CededPremiumMarkup)
          txn.Commission         = current.Commission - previous.sum(tCurrency, \ t -> t.Commission)
          if (txn.BasisGNP.Amount == 0 and current.BasisGNP.Amount != 0) throw "BasisGNP on onset should not be zero."
        }
      }

      return true
  }

 /**
  * Compare calculatedCedings to what is in the database, and create new transactions to bring the totals in line.
  * @param bundle A writeable Transaction bundle which will contain any new entities
  * @param calculatedCedings A list of RICededPremiumContainer instances containing the desired end state amounts
  * @return a list of RICededPremium entites which have been created or affected.
  */
  protected function generateCedingTransactions(bundle : Bundle, calculatedCedings : List<RICededPremiumContainer>, timestamp : Date) : List<RICededPremium> {
    var cedings : Set<RICededPremium> = {}

    histories.clear()
    // order so that overlapping slices are done longest-first.
    var sortedCedings = calculatedCedings
        .sort(\ a, b -> a.EffectiveDate == b.EffectiveDate ? a.ExpirationDate > b.ExpirationDate : a.EffectiveDate < b.EffectiveDate)

    for (calc in sortedCedings) {
      // also look into other slices that start on same date
      var otherCedings = calculatedCedings
                         .where(\ c -> c.EffectiveDate == calc.EffectiveDate and c != calc)
                          *.Cedings.flatMap(\ c -> c).toList()

      // For every Cost that represents Direct Premium, there should be at least one RICededPremium entity.
      // There can be more than one, if risk slices necessitate it.
      var ricp = findOrCreateCededPremium(bundle, calc, calc.Cedings.HasElements)

      if (ricp == null) {
        // If no RICP was found and none was created, it means SliceAmount is zero
        // AND there is no previous calculation to be reversed.
        continue
      }

      // Cedings are created agreement-by-agreeement.
      var existing = ricp.Cedings.partition(\ r -> r.Agreement.AgreementNumber)
      var newTxns  = calc.Cedings.partition(\ r -> r.Agreement.AgreementNumber)
      // Now process any agreement which shows up in either list
      for (key in existing.Keys.union(newTxns.Keys)) {
        // This one can be a list, possibly non-existent...
        var previous = existing[key] == null ? {} as List<RICededPremiumTransaction> : existing[key]
        // ...whereas this one either won't exist or will be a single
        var current  = newTxns.containsKey(key) ? newTxns[key].single() : null

        // avoid reversing something in an overlapping slice
        var previousAmt = previous.sum(\ r -> r.CededPremium.Amount)
        if ((current == null or current.CededPremium.Amount == 0) and (previousAmt != 0)) {
          // before we allow a reversal, see if previous is represented in otherCedings.
          var matches = otherCedings.where(\ c -> c.Agreement.AgreementNumber == key and c.CededPremium.Amount == previousAmt)
          if (matches.HasElements) {
            continue
          }
        }

        if (makeTransactionsForOneAgreement(ricp, calc, previous, current, timestamp) == true) {
          // changes were made to this ricp, so add it to the set
          cedings.add(ricp)
        }
      }
    }

    return cedings.toList()
  }

  /**
   * Prorate money across date ranges.   The subtractive method used will precisely
   * allocate across a contiguous range so that the sum is correct.
   * This function is declared final because it is called from a constructor.
   *
   * @param amount the amount to be prorated
   * @param slices an <em>ordered, contiguous</em> list of date ranges.   May contain nulls to signify "skip this range"
   * @return a List of BigDecimals containing the prorated amounts.
   * @throws RuntimeException if the prorating could not be done successfully
   */
  final function prorateSlices(amount : MonetaryAmount, slices : List<DateRange>, startDate : Date, endDate : Date) : List<MonetaryAmount> {
    var scale = findScaleForProration(amount)
    var result : List<MonetaryAmount> = {}
    if (slices.Count == 0 and amount.IsZero) return {}

    var remaining = amount
    var s = slices.firstWhere(\ d -> d != null)
    if (startDate < s.start) {
      startDate = s.start
    }

    s = slices.lastWhere(\ d -> d != null)
    if (endDate > s.end) {
      endDate = s.end
    }
    var zeroCurrencyUnit = 0bd.ofCurrency(amount.Currency)
    for (slice in slices) {
      if (slice == null or (slice.end <= startDate) or (slice.start >= endDate)) {
        result.add(zeroCurrencyUnit)
        continue
      }

      var n : MonetaryAmount = zeroCurrencyUnit
      if (slice.end >= endDate) {
        n = remaining.setScale(scale, UNNECESSARY) // don't allow prorating to throw off total
      } else if (slice.start < startDate) {
        n = prorater.prorate(startDate, endDate, startDate, slice.end, remaining).rescale()
      } else {
        n = prorater.prorate(slice.start, endDate, slice.start, slice.end, remaining).rescale()
      }
      result.add(n)
      remaining -= n
    }

    if (remaining.Amount != 0) {
      throw "prorateSlices should have finished with zero remainder but didn't!"
    }
    return result
  }

  /**
   * Temporary data structure used for prorating Fac amounts.
   */
  class ProratedAmount {
    var _cost : CedingCost as CostData
    var _amount : MonetaryAmount as NetAmount

    construct(a : MonetaryAmount, c : CedingCost) {
      NetAmount = a
      CostData = c
    }

    override public function equals(other : Object) : boolean {
      if (this === other) {
        return true
      }
      if (other typeis ProratedAmount) {
        return other.NetAmount == this.NetAmount
           and other.CostData  == this.CostData
      }
      return false
    }

    override public function hashCode() : int {
      return (NetAmount as int) + 11*CostData.hashCode()
    }

    override public function toString() : String {
      return "ProratedAmount[NetAmount = ${NetAmount}, CostData = ${CostData}]"
    }
  } /* end ProratedAmount */

  /**
   * Get the list of attachments for a reinsurable as of the given sliceDate.   A writeable bundle is
   * required in case the attachment entities are regenerated.
   * @throws RuntimeException if the bundle is readonly.
   */
  protected function getAttachmentsForCeding(bundle : Bundle, reinsurable : Reinsurable, sliceDate : Date) : List<RIAttachment> {
    if (bundle.ReadOnly) {
      throw "cant get attachments if bundle is ReadOnly"
    }

    var rm : Map<Date, List<RIAttachment>> = attachmentCache.get(reinsurable)
    var al = (rm == null) ? null : rm.get(sliceDate)

    if (al <> null) {
      return al
    }

    if (rm == null) {
      rm = {}
      attachmentCache.put(reinsurable, rm)
    }

    // getAttachmentsForLoss requires expensive operations, which is why we cache the result
    // Unfortunately, the behavior of RIRisk (which is a virtual property) varies:
    var riRisk = reinsurable.RIRisk
    reinsurable = reinsurable.VersionList.getVersionAsOf(sliceDate).getSliceUntyped(sliceDate) as Reinsurable
    {
      var tmp = reinsurable.RIRisk
      if (tmp == null) {
        gw.api.system.PCLoggerCategory.REINSURANCE_CEDING_PLUGIN
          .warn("getting RIRIsk from sliced reinsurable ${reinsurable} returned null")
      }
      riRisk = tmp
    }

    if (riRisk != null) {
      if (riRisk.VersionList != null) {
        var tmp = riRisk.VersionList.getVersionAsOf(sliceDate)
        if (tmp == null) {
          gw.api.system.PCLoggerCategory.REINSURANCE_CEDING_PLUGIN
            .warn("RIRisk has VersionList but getVersionAsOf(${sliceDate}) null")
        } else {
          riRisk = tmp
        }
      } else {
        gw.api.system.PCLoggerCategory.REINSURANCE_CEDING_PLUGIN
          .warn("RIRisk has no VersionList")
      }
    }

    if (reinsurable.Bundle.ReadOnly) {
      gw.api.system.PCLoggerCategory.REINSURANCE_CEDING_PLUGIN
        .debug("Reinsurable in ReadOnly bundle")
      reinsurable = bundle.add(reinsurable) // need to make sure these are in the bundle
    }

    if (riRisk == null) {
      // can happen, e.g. on a package policy where a line was removed.
      rm.put(sliceDate, {})
      return {}
    }

    if (riRisk.Bundle.ReadOnly) {
      gw.api.system.PCLoggerCategory.REINSURANCE_CEDING_PLUGIN
        .debug("riRisk in ReadOnly bundle")
      riRisk = bundle.add(riRisk)           // before asking for attachments
    }
    // RIRisk has no "getAttachmentsForCeding."   For our purposes, getting the attachments for
    // a given loss date will work fine.
    al = riRisk.getAttachmentsForLoss(sliceDate).AttachmentsForPremiumCeding.sort(\ a, b -> attachmentOrderFunction(a, b))
    rm.put(sliceDate, al)

    return al
  }

  /**
   * Prorate money in proportion to costs.   (This is used to allocate the flat cost of a Facultative
   * agreement across several costs that can cede to it.)  The subtractive method used will precisely
   * allocate across a contiguous range so that the sum is correct.
   * This function is declared final because it overloads another function which is final.
   *
   * @param amount the amount to be prorated
   * @param costs a list of CedingCost instances
   * @return a List of ProratedAmount instances containing the prorated amounts.
   * @throws RuntimeException if the prorating could not be done successfully
   */
  protected final function prorateSlicesByCost(amount : MonetaryAmount, costs : List<CedingCost>) : List<ProratedAmount> {
    var remaining = amount
    var scale = findScaleForProration(amount)

    var zeroCurrencyUnit = 0bd.ofCurrency(amount.Currency)
    var totalCost = costs.sum(amount.Currency, \ c -> c.NetValue)
    if (totalCost.Amount == 0) {
      // there is no ceded premium to cede against.
      remaining = zeroCurrencyUnit
    }
    var result : List<ProratedAmount> = {}
    for (slice in costs) {
      var n : MonetaryAmount
      if (slice.Empty or totalCost.IsZero) {
        n = zeroCurrencyUnit
      } else if (slice.NetValue == totalCost) {
        if (slice.NetValue.IsZero and remaining.Amount != 0) {
          throw "Cost allocator should not be allocating fac to a zero slice"
        }
        // don't allow rounding to throw things off
        n = remaining.setScale(scale, UNNECESSARY)
      } else {
        n = (remaining*(slice.NetValue/totalCost)).rescale()
      }
      result.add(new ProratedAmount(n, slice))
      remaining -= n
      totalCost -= slice.NetValue
    }

    if ( totalCost.Amount != 0 or remaining.Amount != 0) throw "prorateSlices should have finished with zeroes but didn't!"
    return result
  }

  protected function getReinsurable(c : Cost) : Reinsurable {
    if (c.Reinsurable == null) {
      return null
    }
    // Make sure we have a correct slice date set on reinsurable!
    return c.Reinsurable.getSliceUntyped(c.Reinsurable.EffectiveDate) as Reinsurable
  }

  /**
   * Find an RICededPremium entity which corresponds to the Cost and EffectiveDate of thisCeding.
   * If no match is found and okToCreate is true, create a new entity.
   *
   * We match ONLY on EffectiveDate (ignoring ExpirationDate) because if a risk is sliced, we
   * want to split the cedings into to RICededPremium entities going forward.  The first RICP
   * will have an offset back to the split date, and because no row will be found with the
   * later date, a new RICP will be created with the split date as its EffectiveDate.
   * @throws RuntimeException if thisCeding.Cost is null (which should never happen)
   */
  protected function findOrCreateCededPremium(bundle : gw.pl.persistence.core.Bundle, thisCeding : RICededPremiumContainer, okToCreate : boolean) : RICededPremium {
    if (thisCeding.Cost == null) {
      throw "Illegal state exception - Cost cannot be null"
    }

    // Because of merging, we can have more than one result which starts at the give effective date.
    // Find one that is at least as long as thisCeding, by sorting the list so that if there's an exact
    // match it will get picked up first.
    var premium = existingRICededPremiums
                 .where(\ r -> r.Cost == thisCeding.Cost and r.RiskDate == thisCeding.EffectiveDate)
                 .sortBy(\ r -> r.ExpirationDate)
                 .firstWhere(\ r -> r.ExpirationDate >= thisCeding.ExpirationDate)

    if (premium != null) {
      return premium
    } else if (okToCreate) {
      premium = CedingPlugin.makeRICededPremium(thisCeding.Cost, bundle)
    }

    if (premium != null) {
      existingRICededPremiums.add(premium)
      premium.EffectiveDate = thisCeding.EffectiveDate
      premium.ExpirationDate = thisCeding.ExpirationDate
      premium.RiskNumber = thisCeding.Reinsurable.RiskNumber

      premium.RiskDate = thisCeding.EffectiveDate
    }

    return premium
  }

}
