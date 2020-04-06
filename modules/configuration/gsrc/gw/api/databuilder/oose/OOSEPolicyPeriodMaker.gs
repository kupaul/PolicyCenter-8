package gw.api.databuilder.oose

uses gw.api.builder.SubmissionBuilder
uses gw.transaction.Transaction
uses gw.api.builder.PolicyChangeBuilder
uses java.util.Date
uses org.junit.Assert

@Export
class OOSEPolicyPeriodMaker {

  static function makeOOSEPeriod(builder : SubmissionBuilder, 
          initBlocks : List<block(change : PolicyPeriod)>, dates : Date[]) : PolicyPeriod {
            
    var basedOn : PolicyPeriod
    Transaction.runWithNewBundle( \ bundle -> {
      var submission = builder.create(bundle)
      var b = initBlocks.get(0)
      b(submission)
      builder.bindAndIssueSubmission()
      basedOn = submission
      for (i in 0..|dates.Count) {
        // Because period dates now have a time component (which is set separately by the
        // EffectiveTimePlugin), just use default effective date (the period start date) if
        // it matches the day of the given date, to avoid a NoPeriodInForceException
        var effectiveDate = dates[i]
        if (effectiveDate.compareIgnoreTime(basedOn.PeriodStart) == 0) {
          effectiveDate = basedOn.PeriodStart
        }
        var changeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withEffectiveDate(effectiveDate).isDraft()
        var change = changeBuilder.create(bundle)
        b = initBlocks.get(i)
        b(change)
        if (i != dates.Count - 1) {
          changeBuilder.requestQuote()
          changeBuilder.bind()
        }
        basedOn = change
      }
    })
    return basedOn
  }

  var _period : PolicyPeriod as Period
  construct(builder : SubmissionBuilder) {
    Transaction.runWithNewBundle( \ bundle -> {
      _period = builder.create(bundle)
    })
  }
  
  function withChange(effectiveDate : Date, action(change : PolicyPeriod)) : PolicyPeriod {
    Assert.assertTrue("Can only create policy changes based on bound periods", 
        _period.Locked)
    if (effectiveDate.compareIgnoreTime(_period.PeriodStart) == 0) {
      effectiveDate = _period.PeriodStart
    }
    var changeBuilder = new PolicyChangeBuilder()
        .withBasedOnPeriod(_period)
        .withEffectiveDate(effectiveDate)
        .isDraft()
    _period = changeBuilder.create()
    action(_period)
    return _period
  }
}
