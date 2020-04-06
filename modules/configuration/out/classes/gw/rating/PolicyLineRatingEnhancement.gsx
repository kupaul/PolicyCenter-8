package gw.rating
uses java.util.Set
uses java.util.Date
uses java.util.ArrayList
uses gw.api.domain.financials.PCFinancialsLogger
uses java.math.RoundingMode
uses gw.rating.worksheet.domain.Worksheet
uses gw.plugin.rateflow.IRateRoutinePlugin
uses gw.plugin.Plugins

enhancement PolicyLineRatingEnhancement : PolicyLine
{
  /**
   * Return the versions of this policy line on the given dates.
   * If the line does not exist at the time, log a warning, but
   * otherwise, ignore it.
   */
  function getVersionsOnDates<T extends PolicyLine>( dates : List<Date> ) : List<T>
  {
    var versions = new ArrayList<T>()
    var nullDates = new ArrayList<Date>()
    for ( date in dates )
    {
      var unslicedVersion = this.VersionList.AsOf( date )
      if ( unslicedVersion == null )
      {
        nullDates.add( date )
      }
      else
      {
        versions.add( unslicedVersion.getSlice( date ) as T )
      }
    }
    if ( not nullDates.Empty )
    {
      PCFinancialsLogger.logDebug( "Unable to find versions of " + this + " on " + nullDates.join( ", " )
        + ".  This is valid if a line can be removed from the policy period for a period of time." )
    }
    return versions
  }

  /**
   * Merge any of the given costs that are attributed to the same
   * elements (i.e. have the same CostKey) and abut each other
   * in effective time.
   */
  function mergeCosts( costs : Set<Cost> )
  {
    if ( costs.size() > 1 )
    {
      var logMsg = "Merging " + costs.Count + " costs..."
      PCFinancialsLogger.logInfo( logMsg )
      // create our own kind of "version list" to track the costs
      var costVLs = costs.partition( \ cost -> cost.CostKey ).Values
                      .map( \ costSet -> costSet.toList().sortBy( \ cost -> cost.EffDate ) )
      for ( costVL in costVLs )
      {
        var lastCost : Cost = null
        for ( cost in costVL )
        {
          if ( lastCost == null or not lastCost.mergeIfCostEqual( cost ) )
          {
            lastCost = cost
          }
        }
      }
      PCFinancialsLogger.logInfo( logMsg + "done" )
    }
  }
  
  /**
   * Prorate and update the current amounts for the given costs.
   */
  function updateAmounts( costs : Set<Cost> )
  {
    var logMsg = "Updating amounts on " + costs.Count + " costs..."
    PCFinancialsLogger.logInfo( logMsg )
    for ( cost in costs )
    {
      cost.updateAmount( RoundingMode )
    }
    PCFinancialsLogger.logInfo( logMsg + "done" )
  }

  property get RoundingLevel() : int
  {
    return this.Branch.Policy.Product.QuoteRoundingLevel
  }

  property get RoundingMode() : RoundingMode {
    return this.Branch.Policy.Product.QuoteRoundingMode
  }

  property get JobType()  : typekey.Job {
    return this.Branch.Job.Subtype
  }

  function addRatingWorksheet(bean : EffDated, ws : Worksheet, tag : String = null) {
    if (Plugins.get(IRateRoutinePlugin).worksheetsEnabledForLine(this.PatternCode) and ws.WorksheetEntries.Count > 0) {
      this.Branch.addWorksheetFor(bean, ws, tag)
    } else {
      this.Branch.removeWorksheetFor(bean, tag)
    }
  }

}
