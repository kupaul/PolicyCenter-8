package gw.lob.wc.rating
uses java.math.BigDecimal
uses java.util.Map
uses java.util.HashMap
uses gw.api.domain.financials.PCFinancialsLogger

@Export
class WCRatingProcessorCalculator {

  // Keeps a cache of subtotals calculated during the rating process.  
  // The cache actually consists of 2 layers.  The first layer contains a map where there is an entry (another map)
  // for each combination of subtotal type and subtotal granularity.  This allows the system to find and iterate over
  // all entries for the same subtotal type and granularity or to find a specific value quickly.
  private var _ratingSubtotalCache = new HashMap<String, Map<String, BigDecimal>>()
  
  /**
   * This function is used to store subtotals during the rating process
   * rpsd = Rating Period Start Date (as a String), which identifies the first day of a period is the term is
   * split into separate rating periods
   * There are 3 supported levels of granularity:
   * <ul>
   * <li><b>all</b> - subtotal for the entire policy (all states and rating periods)
   * <li><b>jurisdiction</b> - subtotal for everything for a single jurisdiction (state) across all rating periods
   * <li><b>ratingPeriod</b> - subtotal within a single state and rating period
   * </ul>
   * If the Granularity is "ratingPeriod" then a rpsd and state is expected.  If "jurisdiction", only a state is expected.
   * If "all", then both state and rpsd can be null.
   */
  function storeRatingSubtotal(amount : BigDecimal, subtotal : RateSubtotalType, granularity : WCRatingSubtotalGranularity, st : Jurisdiction, rpsd : String) {

    // Create the keys for storing the subtotal
    var key1 : String  // Gets the object containing all subtotals for the subtotal type and granularity
    key1 = subtotal.Code + "#" + granularity
    var key2 : String  // Gets the specific subtotal within the set that matches key1
    if (granularity == ratingPeriod) {
      key2 = st.Code + "#" + rpsd
    }
    else if (granularity == jurisdiction) {
      key2 = st.Code
    }
    else if (granularity == all) {
      key2 = "all"  // Not relevant
    }
    else {
      PCFinancialsLogger.logError("Requested to store subtotal with unrecognized granularity: " + granularity)
      return
    }

    // Get the set (by subtotal type and granularity) that this should be added to
    var subtotalSet = getRatingSubtotalSet(key1)

    // Store the new value
    subtotalSet.put(key2, amount)

    return
  }
  
  /**
   * This function is used to get subtotals that were stored during the rating process
   * rpsd = Rating Period Start Date (as a String), which identifies the first day of a period is the term is
   * split into separate rating periods
   * If the Granularity is "ratingPeriod" then a rpsd and state is expected.  If "jurisdiction", only a state is expected.
   * If "all", then both state and rpsd can be null.
   */
  function getRatingSubtotal(subtotal : RateSubtotalType, granularity : WCRatingSubtotalGranularity, st : Jurisdiction, rpsd : String) : BigDecimal {
    // Create the keys for storing the subtotal
    var key1 : String  // Gets the object containing all subtotals for the subtotal type and granularity
    key1 = subtotal.Code + "#" + granularity
    var key2 : String  // Gets the specific subtotal within the set that matches key1
    if (granularity == ratingPeriod) {
      key2 = st.Code + "#" + rpsd
    }
    else if (granularity == jurisdiction) {
      key2 = st.Code
    }
    else if (granularity == all) {
      key2 = "all"  // Not relevant
    }
    else {
      PCFinancialsLogger.logError("Requested to get subtotal with unrecognized granularity: " + granularity)
      return 0
    }

    // Look for the subtotal set
    var subtotalSet = getRatingSubtotalSet(key1)  // Guaranteed not to be null

    // Look for the requested subtotal
    var amount : BigDecimal
    amount = subtotalSet.get(key2)

    // If the subtotal doesn't exist, try to calculate it from underlying subtotals
    if (amount == null) {
      if (granularity == all) {
        amount = calcRatingSubtotal(subtotal, granularity,  jurisdiction, null, true)
      } else if (granularity == jurisdiction) {
        amount = calcRatingSubtotal(subtotal, granularity,  ratingPeriod, st, true)
      }
      if (amount == null) {   // Still can't come up with the subtotal
        // Note: this will happen legitimately sometimes when there are no Costs created at all and thus there is 
        // no reason to create a subtotal.  For example, in the case of a flat cancellation, there is no non-canceled
        // period for rating, so no sub-totals are created.  However, if a sub-total is requested, then it is correct to
        // default to 0 as is done here.
        PCFinancialsLogger.logDebug("Could not find or calculate subtotal " + subtotal.Code + " and granularity " + granularity)
        amount = 0  // default it
      }
    }

    return amount
  }
  
  /**
   * This is a helper function which gets the set of related subtotals and deals with avoiding null entries if
   * this is the first time it is accessed.
   */
  private function getRatingSubtotalSet(key : String) : Map<String, BigDecimal> {
    var subtotalSet = _ratingSubtotalCache.get(key)

    // If none found because this is the first time anyone asked for this set...
    if (subtotalSet == null) {
      // Make a new one
      subtotalSet = new HashMap<String, BigDecimal>()
      // Add it (empty but non-null set) to the cache
      _ratingSubtotalCache.put(key, subtotalSet)
    }

    return subtotalSet
  }
  
  /**
   * This is a helper function which tries to calculate a subtotal based on adding up the values calculated for a
   * a more granular subtotal.  For example, you could determine the overall subtotal by adding up the state-level
   * subtotals.  If no underlying subtotals are found, it will return null (to indicate an error condition since you
   * shouldn't try to read a subtotal unless you have previously stored it.
   * "state" is required only if the toGran field requests a subtotal at the state level
   * "toGran" should never be Period because there is no more detailed level of granularity than that
   * There are 3 cases:
   * <ol>
   * <li>From Period to All (add up all at the period level)
   * <li>From Jurisdiction to All (add up all at the state level)
   * <li>From Period to Jurisdiction (add up only those at the Period level for the particular state given)
   * </ol>
   */
  private function calcRatingSubtotal(subtotal : RateSubtotalType, toGran : WCRatingSubtotalGranularity, fromGran : WCRatingSubtotalGranularity, st : Jurisdiction, store : Boolean) : BigDecimal {
    var filter : Boolean   // True if we need to filter out some of the rows for a state-level subtotal
    filter = false
    if (toGran == jurisdiction) { filter = true }

    var key1 : String
    key1 = subtotal.Code + "#" + fromGran

    // Get the fromGran subtotal set and iterate over it
    var amount : BigDecimal  // Initially null
    var subtotalSet = getRatingSubtotalSet(key1)
    if (subtotalSet <> null and not subtotalSet.Empty) {  // Found a non-empty set that we can add up
      amount = 0
      for (item in subtotalSet.entrySet().toList()) {
        if (filter) {
          var key2 = item.Key
          var juris = key2.substring(0, key2.indexOf("#"))
          if (juris.equalsIgnoreCase(st.Code)) {
            amount = amount + item.Value
          }
        } else {
          amount = amount + item.Value
        }
      }  // end while
    }
    // If toGran is All and fromGran is Jurisdiction, we can also attempt to calculate it from the more granular ratingPeriod level
    else if (toGran == all and fromGran == jurisdiction) {
        amount = calcRatingSubtotal(subtotal, toGran, ratingPeriod, null, false)
    }
    
    // If a non-null subtotal is calculated, store it for future reference (if requested).
    if (amount <> null and store) {
      storeRatingSubtotal(amount, subtotal, toGran, st, null) 
    }
    
    return amount
  }

}
