package gw.rating

uses gw.api.domain.financials.PCFinancialsLogger
uses java.util.HashSet
uses java.util.Set
uses java.util.Date

/**
 * Provides context information around rating process.  In general, it provides accessors for cancellation
 * information, slice/mode assertions, utilities around tracking costs that have or have not been
 * touched as part of the rating process, and lastly logging utilities.
 */
@Export
class RatingContext
{
  var _period : PolicyPeriod as readonly Period
  var _untouchedCosts = new HashSet<Cost>()
  var _sliceDates : List<Date>
  
  construct( policyPeriod : PolicyPeriod )
  {
    _period = policyPeriod
    _sliceDates = _period.AllEffectiveDates
  }

  property get SliceDates () : List<Date> {
    return _sliceDates
  }

  /**
   * The next date after the current slice date at which a change on the policy occurred.
   */
  function getNextSliceDate(sliceDate : Date) : DateTime
  {
    var ret = _sliceDates.firstWhere( \ d -> d > sliceDate )
    return ret == null ? _period.PeriodEnd : ret
  }

  function assertSliceMode( effDatedBean : EffDated )
  {
    if( not effDatedBean.Slice )
    {
      throw "Cannot rate " + effDatedBean + " because it is not in slice mode."
    }
  }
  
  function assertWindowMode( effDatedBean : EffDated )
  {
    if( effDatedBean.Slice )
    {
      throw "Cannot rate " + effDatedBean + " because it is not in window mode."
    }
  }

  function initUntouchedCosts( cost : Cost )  // null safe
  {
    initUntouchedCosts( { cost } )
  }

  function initUntouchedCosts( costs : Set<Cost> )  // null-element safe
  {
    if ( not _untouchedCosts.Empty )
    {
      throw "Attempting to overwrite " + this + "'s current set of untouched costs:\n  "
        + _untouchedCosts.join( "\n  " ) + "\nwith\n  " + costs.join( "\n  " )
    }
    _untouchedCosts.addAll( costs.where( \ c -> c != null ) )  // filter out any null costs
    if (PCFinancialsLogger.isDebugEnabled()) {
      PCFinancialsLogger.logDebug( "Initializing " + this + " with " + _untouchedCosts.Count + " untouched costs." )
    }
  }
  
  function touchCost( cost : Cost )
  {
    _untouchedCosts.remove( cost )
  }
  
  function removeUntouchedCosts()
  {
    for ( cost in _untouchedCosts )
    {
      cost.remove()  // terminates the cost at the SliceDate
    }
    if (PCFinancialsLogger.isDebugEnabled()) {
      PCFinancialsLogger.logDebug( this + " removed " + _untouchedCosts.Count + " untouched costs")
    }
    _untouchedCosts.clear()
  }
  
  function removeUntouchedCostsFromTerm()
  {
    for ( cost in _untouchedCosts )
    {
      cost.removeFromTerm()  // removes the cost entirely
    }
    _untouchedCosts.clear()
  }

  function logDebugRatedCost( cost : Cost )
  {
    logDebugRatedCost( "Rated", cost )
  }

  function logDebugRatedCostTermValues( cost : Cost )
  {
    logDebugRatedCost( "Rated term values", cost )
  }

  private function logDebugRatedCost( preMsg : String, cost : Cost )
  {
    if (PCFinancialsLogger.isDebugEnabled()) {
      PCFinancialsLogger.logDebug( preMsg + " " + cost.debugString() + " for " + cost )
    }
  }
  
  /**
   * Reflectively call "rate( RatingContext )" method on the supplied coverage.  If no
   * such method exists, log a debug message.
   */
  function rate( cov : Coverage )
  {
    var rateMethod = (typeof cov).TypeInfo.getMethod( "rate", { RatingContext }  )
    if ( rateMethod != null )
    {
      rateMethod.CallHandler.handleCall( cov, { this } )
    }
    else if (PCFinancialsLogger.isDebugEnabled()) 
    {
      PCFinancialsLogger.logDebug( "Not rating " + (typeof cov) + " because it does not have a rate(" + RatingContext + ") method" )
    }
  }

}
