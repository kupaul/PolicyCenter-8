package gw.rating

uses java.lang.Iterable
uses java.util.Collections
uses java.util.Date

/**
 * The AbstractRatingEngine class serves as the base for all of the out of the box rating engines.  This class
 * provides both a basic structure for rating, used by most (but not all) of the out of the box lines of business,
 * as well as utility methods to do things like prorate and merge costs and determine if rating should be
 * done from the start of the period or merely from the change date forward.
 *
 * All demo rating in PolicyCenter is line-specific, so each line has its own subtype of this class.
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
abstract class AbstractRatingEngine<PL extends PolicyLine> extends AbstractRatingEngineBase<PL> {
  var _line : PL as readonly PolicyLine

  /**
   * Constructs a new rating engine instance based around the particular line.
   */
  construct(line : PL) {
    super(line.Branch)
    _line = line

    // If CostDataMap is an automap, make sure the list for this line is created.   There's a low likelihood of
    // problems, but because we have convenience functions that expose the list of CostData objects directly,
    // we want to be sure there is already an entry in place.
    CostDataMap.get(PolicyLine)
  }

  /**
   * When rating from the change date forward, we need to extract any existing slice-mode costs and create CostData
   * objects to represent them.  We don't want to extract all costs, since that would include things like taxes,
   * which will be rated when we rate in window mode.  This method, then, should return any costs currently on
   * the period that correspond to costs that are generated during the rateSlice() method.
   *
   * This method needs to be implemented provided that the subclass doesn't completely override the rateOnly()
   * method and also doesn't override shouldRateThisSliceForward() to always return false.
   */
  override protected function existingSliceModeCosts() : Iterable<Cost> {
    throw "Not implemented"
  }

  /**
   * The callout to rate a given slice of the policy.  The lineVersion argument will already have its slice date
   * set to the appropriate method, and this function will be called once per slice in the policy.
   *
   * This method needs to be implemented provided that the subclass doesn't completely override the rateOnly() method
   */
  override protected function rateSlice(lineVersion : PL) {
    throw "Not implemented"
  }

  /**
   * The callout to rate the policy in "window" mode, rating things that depend on the sum of the previous slice costs
   * or that need to span the entire period and be rated just once instead of per-slice.  The argument in this case
   * will be the first version of the line in effective time.
   *
   * This method needs to be implemented provided that the subclass doesn't completely override the rateOnly() method
   */
  override protected function rateWindow(lineVersion : PL) {
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
  override protected function createCostDataForCost(c : Cost) : CostData {
    throw "createCostDataForCost is not implemented by this rating engine"
  }

  /**
   * Log message emitted by rate().  This is implemented as a property so that it can be overridden by subclasses.
   */
  override protected property get RatingLogMessage() : String {
    return "Rating " + PolicyLine + "..."
  }

  // PolicyLine - specific implementations, marked final because any inconsistencies between these could result in
  // subtle and hard-to-find bugs.   Proceed with caution!

  override protected final function getVersionsOnDates(dates : List<Date>) : List<PL> {
    return PolicyLine.getVersionsOnDates(dates)
  }

  override protected final function getSliceDate(slice : PL) : Date {
    return slice.SliceDate
  }

  override protected final function getPolicyLineForCost(c : Cost): PL {
    return PolicyLine
  }

  // convenience functions to reduce the number of places where existing rating engines must be changed

  // For a line-specific rating engine, there should be only one lines' worth of CostDatas

  /**
   * Convenience method, equivalent to CostDataMap.get(PolicyLine)
   * The list returned by this method is <em>Unmodifiable</em>.  To add or remove
   * items from the list you should use addCost(c : CostData) or removeCost(c : CostData).
   * To replace the entire contents of the list, set the CostDatas property.
   */
  protected final property get CostDatas() : List<CostData> {
    return Collections.unmodifiableList(CostDataMap.get(PolicyLine))
  }

  /**
   * Convenience method which replaces all of the CostData values with the given ones.
   */
  protected final property set CostDatas(values : List <CostData>) {
    var _data = CostDataMap.get(PolicyLine)
    _data.clear()
    _data.addAll(values)
  }

  /**
   * Convenience method, equivalent to CostDataMap.put(PolicyLine, c)
   */
  protected function addCost(c : CostData) {
    addCost(PolicyLine, c)
  }

  /**
   * Convenience method, equivalent to CostDataMap.get(PolicyLine).addAll(costs)
   */
  protected function addCosts(costs: List <CostData>) {
    CostDataMap.get(PolicyLine).addAll(costs)
  }
}
