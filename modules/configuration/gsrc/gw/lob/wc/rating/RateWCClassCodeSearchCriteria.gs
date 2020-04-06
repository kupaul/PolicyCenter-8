package gw.lob.wc.rating
uses gw.api.database.Query

/**
 * Search criteria that can find rates for WC class codes in the <code>rates_workers_comp</code> system table.
 * See <code>match</code> for the full details.
 */
@Export
class RateWCClassCodeSearchCriteria
{
  var _findDate : DateTime
  var _findState : Jurisdiction
  var _normalizedClassCode : String as readonly NormalizedClassCode
  
  construct( findDate : DateTime, classCode : String, findState : Jurisdiction )
  {
    if ( findDate == null or classCode == null )
    {
      // Throw because, while the match code will work (typically returning 1.0) passing in nulls is probably indicative of a bug.
      throw "RateWCClassCodeSearchCriteria requires both findDate and classCode, but found: new ${this.IntrinsicType.RelativeName}(${findDate}, ${classCode}, ${findState})"
    }
    _findDate  = findDate
    _normalizedClassCode = normalizeClassCode( classCode )
    _findState = findState  // state can be null if they're purposely searching for the "all states" default
  }

  construct( findDate : DateTime, classCode : WCClassCode, findState : Jurisdiction )
  {
    this( findDate, classCode.Code, findState )
  }
  
  private function normalizeClassCode( classCode : String ) : String
  {
    return classCode.substring( 0, 4 )  // i.e., "8017(1)" converts to "8017" for rate lookup
  }
  
  /**
   * Find a rate from the rates_workers_comp system table best matching the criteria such that
   * <ul>
   * <li><code>classCode</code> matches
   * <li><code>rateState</code> matches
   * <li><code>findDate</code> falls within the [<code>effDate</code>, <code>expDate</code>) range.
   *     If either dates is null, then that side of the range is considered unbound.
   * </ul>
   * If it is unable to find a rate matching all criteria, it then looks for a rate for all
   * states.  It returns <code>null</code> if it is unable match anything.
   */
  function match() : RateWCClassCodeExt
  {
    var rate = findRate( _findState )
    if ( rate == null )
    {
      rate = findRate( null )  // find "all states" default
    }
    return rate
  }
  
  /**
   * Find a rate from the rates_workers_comp system table matching the criteria such that
   * <ul>
   * <li><code>classCode</code> matches
   * <li><code>rateState</code> matches
   * <li><code>findDate</code> falls within the [<code>effDate</code>, <code>expDate</code>) range.
   *     If either dates is null, then that side of the range is considered unbound.
   * </ul>
   * It returns <code>null</code> if there are no matches.  If there are multiple matches,
   * then it returns the one with the latest effective date.
   */
  private function findRate( findState : Jurisdiction ) : RateWCClassCodeExt
  {
    var rateQuery = Query.make(RateWCClassCodeExt)
      .compare(RateWCClassCodeExt#ClassCode.PropertyInfo.Name, Equals, _normalizedClassCode)
      .compare(RateWCClassCodeExt#RateState.PropertyInfo.Name, Equals, findState.Code)
      .and(\ andRestriction -> andRestriction
        .or(\ restriction -> {
          restriction.compare(RateWCClassCodeExt#EffDate.PropertyInfo.Name, Equals, null)
          restriction.compare(RateWCClassCodeExt#EffDate.PropertyInfo.Name, LessThanOrEquals, _findDate)
        })
        .or(\ restriction -> {
          restriction.compare(RateWCClassCodeExt#ExpDate.PropertyInfo.Name, Equals, null)
          restriction.compare(RateWCClassCodeExt#ExpDate.PropertyInfo.Name, GreaterThan, _findDate)  
        })
      ).select()    
    rateQuery.orderByDescending(\ r -> r.effDate)
    return rateQuery.getFirstResult()
  }
  
}
