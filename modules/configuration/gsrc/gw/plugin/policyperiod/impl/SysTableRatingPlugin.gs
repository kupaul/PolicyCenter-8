package gw.plugin.policyperiod.impl

uses gw.api.profiler.PCProfilerTag
uses gw.api.domain.financials.PCFinancialsLogger
uses gw.plugin.policyperiod.IRatingPlugin
uses gw.rating.AbstractRatingEngine

@Export
class SysTableRatingPlugin implements IRatingPlugin {

  override function ratePeriod(period : PolicyPeriod) {
    ratePeriod(period, null)
  }

  /**
   * ratePeriod
   */
  override function ratePeriod(period : PolicyPeriod, rStyle : RatingStyle) {
    // synchronously call the demo rating code and handle the result
    var logMsg = displaykey.PolicyPeriod.Quote.Requesting.Synchronously( period )
    PCFinancialsLogger.logInfo( logMsg )
    ratePeriodImpl(period, rStyle)
    PCFinancialsLogger.logInfo( displaykey.PolicyPeriod.Quote.Requesting.Done(logMsg) )
  }

 /**
  * ratePeriodImpl
  */
  function ratePeriodImpl(period : PolicyPeriod, rStyle : RatingStyle) {
    PCProfilerTag.RATE_PERIOD.execute(\ -> {
      // rStyle is currently a no-op -> consider having rStyle actually
      // influence rates somehow
      var logMsg = "Rating ${period.Job.DisplayType} #${period.Job.JobNumber}"
        + " for Policy # ${period.PolicyNumber},"
        + " Branch Name = [${period.BranchName}]"
        + " with Edit Effective Date of ${period.EditEffectiveDate} ..."

      PCFinancialsLogger.logInfo( logMsg )
      for ( line in period.RepresentativePolicyLines ) {
        PCProfilerTag.RATE_LINE.execute(\ -> {
          var ratingEngine = createRatingEngine(line)
          ratingEngine.rate()
        })
      }

      // For demo purposes, mark the quote as valid or invalid based on the address description
      var addressDesc = period.Policy.Account.AccountHolderContact.PrimaryAddress.Description
      if ( addressDesc != null and addressDesc.toLowerCase().contains( "fail quoting" ) ) {
        period.markInvalidQuote()
      } else {
        period.markValidQuote()
      }
      PCFinancialsLogger.logInfo( logMsg + "done" )
    })
  }

  protected function createRatingEngine(line : PolicyLine) : AbstractRatingEngine {
    return line.createRatingEngine(RateMethod.TC_SYSTABLE, null)
  }
}
