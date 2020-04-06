package gw.rating

uses gw.api.database.Query
uses gw.api.domain.financials.PCFinancialsLogger
uses java.math.BigDecimal
uses gw.util.LRUCache
uses java.util.ArrayList
uses java.util.Collections

/**
 * Search critera that can find rating factors in the <code>rate_adj_factors</code> system table.
 * See <code>match</code> and <code>matchInRange</code> methods for the full details
 */
@Export
class RateAdjFactorSearchCriteria
{
  static var _rangeCache = Collections.synchronizedMap(new LRUCache<List, RateAdjFactorExt>(100))
  static var _lookupCache = Collections.synchronizedMap(new LRUCache<List, List<RateAdjFactorExt>>(100))

  var _factorName : String
  var _findDate   : DateTime

  // For testing
  static internal function clearCaches()
  {
    _rangeCache.clear()
    _lookupCache.clear()
  }

  construct( factorName : String, findDate : DateTime )
  {
    if ( factorName == null or findDate == null )
    {
      // Throw because, while the match code will work (typically returning 1.0) passing in nulls is probably indicative of a bug.
      throw "RateAdjFactorSearchCriteria requires both factorName and findDate " + this
    }
    _factorName = factorName
    _findDate   = findDate.clone() as java.util.Date
  }

  /**
   * Find a factor from the rating_adj_factors system table best matching this criteria such that
   * <ul>
   * <li><code>factorName</code> matches
   * <li><code>findDate</code> falls within the [<code>effDate</code>, <code>expDate</code>) range.
   *     If either dates is null, then that side of the range is considered unbound.
   * <li><code>factorState</code> matches
   * </ul>
   * If it is unable to find a factor matching all criteria, it then looks for a full default 
   * factor match.
   * It returns <code>null</code> if it is unable match anything.
   */
  function match( factorState : Jurisdiction ) : BigDecimal
  {
    return match( null, null, factorState )
  }

  /**
   * Find a factor from the rating_adj_factors system table best matching this criteria such that
   * <ul>
   * <li><code>factorName</code> matches
   * <li><code>findDate</code> falls within the [<code>effDate</code>, <code>expDate</code>) range.
   *     If either dates is null, then that side of the range is considered unbound.
   * <li><code>lookup</code> matches the <code>stringOption</code>
   * <li><code>factorState</code> matches
   * </ul>
   * If it is unable to find a factor matching all criteria, it then looks for a factor for all
   * states, and finally, a full default factor.
   * It returns <code>null</code> if it is unable match anything.
   */
  function match( lookup : String, factorState : Jurisdiction ) : BigDecimal
  {
    return match( lookup, null, factorState )
  }

  /**
   * Find a factor from the rating_adj_factors system table best matching this criteria such that
   * <ul>
   * <li><code>factorName</code> matches
   * <li><code>findDate</code> falls within the [<code>effDate</code>, <code>expDate</code>) range.
   *     If either dates is null, then that side of the range is considered unbound.
   * <li><code>lookup</code> matches the <code>stringOption</code>
   * <li><code>lookup2</code> matches the <code>stringOption2</code>
   * <li><code>factorState</code> matches
   * </ul>
   * If it is unable to find a factor matching all criteria, it then looks for a factor for all
   * states, a lookup2 default factor, and finally, a full default factor.
   * It returns <code>null</code> if it is unable match anything.
   */
  function match( lookup : String, lookup2 : String, factorState : Jurisdiction ) : BigDecimal
  {
    var factor = findByLookups( lookup, lookup2, factorState )  // find with all criteria
    if ( factor == null )
    {
      factor = findByLookups( lookup, lookup2, null )  // find "all states" default
    }
    if ( factor == null )
    {
      factor = findByLookups( lookup, null, null )  // find lookup2 default
    }
    if ( factor == null )
    {
      factor = findByLookups( null, null, null )  // find default
      logDefault( factor, "matchFactor(lookup=" + lookup + ", lookup2=" + lookup2 + ", factorState=" + factorState + ")" )
    }
    return safeFactor( factor, "match(lookup=" + lookup + ", lookup2=" + lookup2 + ", factorState=" + factorState + ")" )
  }

  /**
   * Find a factor from the rating_adj_factors system table matching the criteria such that
   * <ul>
   * <li><code>factorName</code> matches
   * <li><code>factorState</code> matches
   * <li><code>lookup</code> matches the <code>stringOption</code>
   * <li><code>lookup2</code> matches the <code>stringOption2</code>
   * <li><code>findDate</code> falls within the [<code>effDate</code>, <code>expDate</code>) range.
   *     If either dates is null, then that side of the range is considered unbound.
   * </ul>
   * It returns <code>null</code> if there are no matches.  If there are multiple matches,
   * then it returns the one with the latest effective date, and if those are equal,
   * then the one with a PublicID later in the alphabet.
   */
  function findByLookups( lookup : String, lookup2 : String, factorState : Jurisdiction ) : RateAdjFactorExt
  {
    var result = findAllByLookups( lookup, lookup2, factorState )
    if (result.HasElements) {
      return result.first()
    } else {
      return null
    }
  }

  /**
   * Return a query that finds all factors from the rating_adj_factors system table best matching this criteria such that
   * the <code>factorState</code> matches.  If it is unable to find any factors matching the state, it then looks for the
   * factors for all states.
   */
  function matchAll( factorState : Jurisdiction ) : List<RateAdjFactorExt>
  {
    var result = findAllByLookups( null, null, factorState )
    if ( result.Empty )  // find "all states" defaults
    {
      result = findAllByLookups( null, null, null )
    }
    return result
  }

  function matchInRange( findNumber : Number, factorState : Jurisdiction ) : BigDecimal
  {
    return matchInRange( null, findNumber, factorState )
  }

  function matchInRange( lookup : String, findNumber : Number, factorState : Jurisdiction ) : BigDecimal
  {
    var extraDesc = "matchInRange(lookup=" + lookup + ", findNumber=" + findNumber + ", factorState=" + factorState + ")"
    var factor = findInRange( lookup, findNumber, factorState )  // find with all criteria
    if ( factor == null )
    {
      factor = findInRange( lookup, findNumber, null )  // find "all states" default
    }
    if ( factor == null )
    {
      factor = findInRange( null, findNumber, null )  // find default
      logDefault( factor, extraDesc )
    }
    return safeFactor( factor, extraDesc )
  }

  private function logDefault( factor : RateAdjFactorExt, extraDesc  : String )
  {
    if ( factor != null )
    {
      PCFinancialsLogger.logDebug( "Could only match default rating factor.  Using "
        + factor.factor + " for " + this + extraDesc )
    }
  }

  private function safeFactor( factor : RateAdjFactorExt, extraDesc : String ) : BigDecimal
  {
    if ( factor == null )
    {
      PCFinancialsLogger.logDebug( "Could not match any rating factor.  Using 1.0 for " + this + extraDesc )
      return 1.0
    }
    return factor.factor
  }

  /**
   * Return all factors from the rating_adj_factors system table matching the criteria such that
   * <ul>
   * <li><code>factorName</code> matches
   * <li><code>factorState</code> matches
   * <li><code>lookup</code> matches the <code>stringOption</code>
   * <li><code>lookup2</code> matches the <code>stringOption2</code>
   * <li><code>findDate</code> falls within the [<code>effDate</code>, <code>expDate</code>) range.
   *     If either dates is null, then that side of the range is considered unbound.
   * </ul>
   */
  private function findAllByLookups( lookup : String, lookup2 : String, factorState : Jurisdiction ) : List<RateAdjFactorExt>
  {
    var result : List<RateAdjFactorExt>
    var queryElems = new Object[]{lookup, lookup2, factorState, _factorName, _findDate}.toList()

    if (_lookupCache.containsKey( queryElems )) {
      result = _lookupCache.get( queryElems )
    } else {
      var query = Query.make(RateAdjFactorExt)
            .compare("factorName", Equals, _factorName)
            .compare("factorState", Equals, factorState.Code)
            .compare("stringOption", Equals, lookup)
            .compare("stringOption2", Equals, lookup2)
            .and(\ andRestriction -> andRestriction
              .or(\ orRestriction -> {
                orRestriction.compare("effDate", Equals, null)
                orRestriction.compare("effDate", LessThanOrEquals, _findDate)
              })
              .or(\ orRestriction -> {
                orRestriction.compare("expDate", Equals, null)
                orRestriction.compare("expDate", GreaterThan, _findDate)
              })
            ).select()
      result = query.toList()
      _lookupCache.put(queryElems, result)
    }
    return result
  }

  /**
   * Find a factor from the rating_adj_factors system table matching the criteria such that
   * <ul>
   * <li><code>factorName</code> matches
   * <li><code>factorState</code> matches
   * <li><code>lookup</code> matches the <code>stringOption</code>
   * <li><code>findNumber</code> falls within the [<code>minNumber</code>, <code>maxNumber</code>] range
   * <li><code>findDate</code> falls within the [<code>effDate</code>, <code>expDate</code>) range.  If either dates is null, then that side of the range is considered unbound.
   * </ul>
   * It returns <code>null</code> if there are no matches.  If there are multiple matches,
   * then it returns the one with the latest effective date, and if those are equal,
   * then the one with a PublicID later in the alphabet.
   */
  private function findInRange( lookup : String, findNumber : Number, factorState : Jurisdiction ) : RateAdjFactorExt
  {
    var result : RateAdjFactorExt
    var queryElems = new Object[]{lookup, findNumber, factorState, _factorName, _findDate}.toList()
    if (_rangeCache.containsKey( queryElems )) {
      result = _rangeCache.get( queryElems )
    } else {
      var factorQuery = Query.make(RateAdjFactorExt)
            .compare("factorName", Equals, _factorName)
            .compare("factorState", Equals, factorState.Code)
            .compare("stringOption", Equals, lookup)
            .compare("minNumber", LessThanOrEquals, findNumber as BigDecimal)
            .compare("maxNumber", GreaterThanOrEquals, findNumber as BigDecimal)
            .and(\ andRestriction -> andRestriction
              .or(\ orRestriction -> {
                orRestriction.compare("effDate", Equals, null)
                orRestriction.compare("effDate", LessThanOrEquals, _findDate)
              })
              .or(\ orRestriction -> {
                orRestriction.compare("expDate", Equals, null)
                orRestriction.compare("expDate", GreaterThan, _findDate)
              })
            ).select()
      result = getFirstResult( factorQuery )
      _rangeCache.put(queryElems, result)
    }
    return result
  }

  private function getFirstResult( factorQuery : RateAdjFactorExtQuery ) : RateAdjFactorExt
  {
    if ( factorQuery != null )
    {
      // get first the latest one, with the earliest PublicID
      factorQuery.orderByDescending(\ r -> r.effDate).thenBy(\ r -> r.PublicID)
      factorQuery.setPageSize(2)
      var factors = factorQuery.iterator()
      if (factors.hasNext()) {
        var factor = factors.next()
        if (factors.hasNext()) {
          PCFinancialsLogger.logDebug("Found more than one matching rating factor. Possible duplicates? " + this)
        }
        return factor
      }
    }
    return null
  }
  
  override function toString() : String
  {
    return "{_factorName=" + _factorName + ", findDate=" + _findDate + "}"
  }
}
