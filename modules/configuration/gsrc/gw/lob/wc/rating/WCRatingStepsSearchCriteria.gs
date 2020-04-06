package gw.lob.wc.rating
uses gw.api.database.Query

/**
 * Search criteria that can find rating steps in the <code>WC_Rating_Steps</code> system table.
 * See <code>matchAllInRange</code> methods for full details.
 */
@Export
class WCRatingStepsSearchCriteria
{
  var _findDate  : DateTime
  var _findState : Jurisdiction
  
  construct( findDate : DateTime, findState : Jurisdiction )
  {
    if ( findDate == null )
    {
      // Throw because, while the match code will work (typically returning empty result set) passing
      // in a null findDate is probably indicative of a bug.  A null findState merely means we're searching
      // for the default (non-state) rating steps.
      throw "WCRatingStepsSearchCriteria requires a findDate " + this
    }
    _findDate  = findDate
    _findState = findState
  }

  /**
   * Return a query that finds all steps from the WC_Rating_Steps system table matching the criteria such that
   * if there are *any* state-specific steps for the findState,
   * <ul>
   * <li><code>findState</code> matches
   * <li><code>findDate</code> falls within the [<code>effDate</code>, <code>expDate</code>) range
   * <li><code>calcOrder</code> falls within the [<code>fromStep</code>, <code>toStep</code>] range 
   *     (n.b. inclusive range)
   * </ul>
   * If there are no rating steps at all specified for the findState, then return the factors for all
   * states where the findDate and calcOrder matches (as described above).
   * The steps are ordered ascending by their calcOrder.
   */
  function matchAllInRange( fromStep : int, toStep : int ) : WCRatingStepExtQuery
  {
    return findInRange( HasAnyStateSpecificSteps ? _findState : null, fromStep, toStep )
  }
  
  /**
   * Find all steps from the WC_Rating_Steps system table matching the criteria such that
   * <ul>
   * <li><code>findState</code> matches
   * <li><code>findDate</code> falls within the [<code>effDate</code>, <code>expDate</code>) range.
   *     If either dates is null, then that side of the range is considered unbound.
   * <li><code>calcOrder</code> falls within the [<code>fromStep</code>, <code>toStep</code>] range 
   *     (n.b. inclusive range)
   * </ul>
   * The steps are ordered ascending by their calcOrder.
   */
  private function findInRange( findState : Jurisdiction, fromStep : int, toStep : int ) : WCRatingStepExtQuery
  {
    var stepQuery = Query.make(WCRatingStepExt)
      .compare(WCRatingStepExt#RateState.PropertyInfo.Name, Equals, findState.Code)
      .compare(WCRatingStepExt#CalcOrder.PropertyInfo.Name, GreaterThanOrEquals, fromStep)
      .compare(WCRatingStepExt#CalcOrder.PropertyInfo.Name, LessThanOrEquals, toStep)
      .and(\ andRestriction -> andRestriction
        .or(\ restriction -> {
          var effDateColumnName = WCRatingStepExt#EffDate.PropertyInfo.Name
          restriction.compare(effDateColumnName, Equals, null)
          restriction.compare(effDateColumnName, LessThanOrEquals, _findDate)
        })
        .or(\ restriction -> {
          var expDateColumnName = WCRatingStepExt#ExpDate.PropertyInfo.Name
          restriction.compare(expDateColumnName, Equals, null)
          restriction.compare(expDateColumnName, GreaterThan, _findDate)
        })
      ).select()
    stepQuery.orderBy(\ w ->w.calcOrder)
    return stepQuery
  }
  
  /**
   * Return true if there are any steps from the WC_Rating_Steps system table for the findState
   * that are effective during the findDate.
   */
  private property get HasAnyStateSpecificSteps() : boolean
  {
    var stepQuery = Query.make(WCRatingStepExt)
      .compare("RateState", Equals, _findState.Code)
      .and(\ andRestriction -> andRestriction
        .or(\ restriction -> {
          restriction.compare("EffDate", Equals, null)
          restriction.compare("EffDate", LessThanOrEquals, _findDate)
        })
        .or(\ restriction -> {
          restriction.compare("ExpDate", Equals, null)
          restriction.compare("ExpDate", GreaterThan, _findDate)
        })
    ).select()
    return stepQuery.getCount() > 0
  }

  override function toString() : String
  {
    return "{findDate=" + _findDate  + "}"
  }
  
}
