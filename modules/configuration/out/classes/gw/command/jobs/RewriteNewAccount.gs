package gw.command.jobs

uses gw.lang.Export
uses entity.PolicyPeriod
uses com.guidewire.pl.quickjump.BaseCommand
uses com.guidewire.pl.quickjump.DefaultMethod
uses gw.api.builder.RewriteNewAccountBuilder
uses gw.api.databuilder.im.IMSignPartBuilder
uses gw.api.databuilder.im.InlandMarineLineBuilder
uses gw.api.builder.RewriteNewAccountStatus

/**
* This command is supported by DEV and is required to work. Any change to this Test must pass
* PolicyCommandTest
*/
@Export
@DefaultMethod("wDraft")
class RewriteNewAccount extends BaseCommand {
  
  
  function wDraft() : PolicyPeriod {
    var period = makePeriod(DRAFT, false)
    pcf.JobForward.go(period.RewriteNewAccount, period)
    return period
  }
  
  function wBound() : PolicyPeriod {
    var period = makePeriod(BOUND, false)
    pcf.PolicyFileForward.go(period.PolicyNumber)
    return period
  }
  
  function wExpired() : PolicyPeriod {
    var period = makePeriod(BOUND, true)
    pcf.PolicyFileForward.go(period.PolicyNumber)
    return period
  }
  
  function makePeriod(status : RewriteNewAccountStatus, basedOnExpired : boolean ) : PolicyPeriod {
    var period : PolicyPeriod
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var builder = new RewriteNewAccountBuilder().withStatus(status).withProduct("InlandMarine")
        .withPolicyLine(new InlandMarineLineBuilder().withPart(new IMSignPartBuilder()))
      if (basedOnExpired){
        builder.withExpiredSource()
      }
      period = builder.create(bundle)
    })
    return period
  }
}
