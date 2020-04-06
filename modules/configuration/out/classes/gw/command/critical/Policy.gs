package gw.command.critical

uses gw.api.builder.CancellationBuilder
uses gw.api.builder.PolicyChangeBuilder
uses gw.api.builder.RenewalBuilder
uses gw.api.builder.RewriteBuilder
uses gw.api.builder.SubmissionBuilder
uses com.guidewire.pl.quickjump.Arguments
uses com.guidewire.pl.quickjump.BaseCommand
uses com.guidewire.pl.quickjump.Argument
uses gw.command.critical.SamplePolicyGenerator
uses java.util.Date
uses pcf.PolicyFileForward
uses com.guidewire.pl.quickjump.DefaultMethod
uses gw.api.builder.NoteBuilder

/**
* This command is supported by DEV and is required to work. Any change to this Test must pass
* PolicyCommandTest
*/
@Export
@DefaultMethod("wDraft")
class Policy extends BaseCommand {
  
  @Arguments("wQuote")
  function asBound() : PolicyPeriod {
    var policyLine = getArgumentAsString("PolicyLine")
    var period = draftPeriod(policyLine)
    period.SubmissionProcess.requestQuote()
    period.SubmissionProcess.bindOnly()
    period.Bundle.commit()
    PolicyFileForward.go(period.PolicyNumber, period.PeriodStart)
    return period
  }
  
  @Arguments("wQuote")
  function wIssuance() : PolicyPeriod {
    var policyLine = getArgumentAsString("PolicyLine")
    var period = draftPeriod(policyLine)
    period.SubmissionProcess.requestQuote()
    period.SubmissionProcess.issue()
    period.Bundle.commit()
    PolicyFileForward.go(period.PolicyNumber, period.PeriodStart)
    return period
  }

  @Argument("PolicyLine", Constants.POLICY_TYPES)
  function wDraft() : PolicyPeriod {
    var policyLine = getArgumentAsString("PolicyLine")
    var period = draftPeriod(policyLine)
    pcf.JobForward.go(period.Submission, period)
    return period
  }
  
  @Argument("PolicyLine", Constants.POLICY_TYPES)
  function wQuote() {
    var policyLine = getArgumentAsString("PolicyLine")
    var period = draftPeriod(policyLine)
    period.SubmissionProcess.requestQuote()
    period.Bundle.commit()
    pcf.JobForward.go(period.Submission, period)
  }
  
  function draftPeriod(policyLine : String) : PolicyPeriod {
    var period : PolicyPeriod
    switch(policyLine == null ? "wc": policyLine.toLowerCase()){
      case "pa": period = SamplePolicyGenerator.wPALine()
        break
      case "ba": period = SamplePolicyGenerator.wBALine()
        break
      case "bop": period = SamplePolicyGenerator.wBOPLine()
        break
      case "cp": period = SamplePolicyGenerator.wCPLine()
        break
      case "cpp": period = SamplePolicyGenerator.wCPPLine(true, true, true)
        break
      case "cpp-cp": period = SamplePolicyGenerator.wCPPLine(true, false, false)
        break
      case "cpp-gl": period = SamplePolicyGenerator.wCPPLine(false, true, false)
        break
      case "cpp-im": period = SamplePolicyGenerator.wCPPLine(false, false, true)
        break
      case "gl": period = SamplePolicyGenerator.wGLLine()
        break
      case "im": period = SamplePolicyGenerator.wIMLine()
        break
      case "wc":
        //this is default, fall through
      default:
        period = SamplePolicyGenerator.wWCLine()
    }
    period.PrimaryNamedInsured.FirstName = policyLine == null ? "WC" : policyLine.toUpperCase()
    period.Bundle.commit()
    return period
  }
  
  function createCCPolicy() {
    var policyPeriod = Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate("4775949863-03", Date.Today)
    if (Policy.finder.findPolicyByPolicyNumber("4775949863-03") != null) {
      pcf.PolicyFileForward.go(policyPeriod.PolicyNumber, policyPeriod.EditEffectiveDate)
      return
    } else {
      var effDate = Date.Today.addYears(-2)
      var renDate = effDate.addYears(1)
      var canDate = renDate.addMonths(6)
      var rewriteDate = canDate.addMonths(3)
      var policyChangePeriod = new PolicyChangeBuilder().withPolicyNumber("4775949863-01").withEffectiveDate(effDate)
                                .createAndCommit()                                                   
      var renewalPeriod = new RenewalBuilder().withBasedOnPeriod(policyChangePeriod).withPolicyNumber("4775949863-02").createAndCommit()                             
      var cancellationPeriod = new CancellationBuilder().withProrataRefund().withBasedOnPeriod(renewalPeriod).withEffectiveDate(canDate).createAndCommit()
      var rewritePeriod = new RewriteBuilder().withBasedOnPeriod(cancellationPeriod).withEffectiveDate(rewriteDate)
        .withPeriodStart(rewriteDate).withPolicyNumber("4775949863-03").createAndCommit()

      var wcPolicyChangePeriod =  new SubmissionBuilder().withAccount(policyChangePeriod.Policy.Account)
                                   .withProduct("WorkersComp").withEffectiveDate(effDate)
                                    .createAndCommit() 
      new RenewalBuilder().withBasedOnPeriod(wcPolicyChangePeriod).
                               withPolicyNumber("4775949865-02").createAndCommit() 
      var glPolicyChangePeriod =  new SubmissionBuilder().withAccount(policyChangePeriod.Policy.Account)
                                   .withProduct("GeneralLiability").withEffectiveDate(effDate)
                                    .createAndCommit() 
      new RenewalBuilder().withBasedOnPeriod(glPolicyChangePeriod).
                               withPolicyNumber("4775949866-02").createAndCommit()  

      pcf.PolicyFileForward.go(rewritePeriod.PolicyNumber, rewritePeriod.EditEffectiveDate)
    }
  }
}
