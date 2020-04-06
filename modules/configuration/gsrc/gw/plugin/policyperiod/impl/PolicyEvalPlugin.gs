package gw.plugin.policyperiod.impl

uses gw.plugin.policyperiod.IPolicyEvaluationPlugin
uses gw.policy.PolicyEvalContext
uses gw.lob.common.DefaultUnderwriterEvaluator


@Export
class PolicyEvalPlugin implements IPolicyEvaluationPlugin {  

  override function evaluatePeriod(period : PolicyPeriod, checkingSet : UWIssueCheckingSet) {
    var context = new PolicyEvalContext(period, checkingSet)        
    evaluatePeriodWithContext(context)
    context.removeOrphanedIssues()
  }
  
  protected function evaluatePeriodWithContext(context : PolicyEvalContext) {

    for (line in context.Period.Lines) {
      var evaluator = line.createUnderwriterEvaluator(context)
      if (evaluator == null) {
        continue
      }
      evaluator.evaluate()
    }
    new DefaultUnderwriterEvaluator(context).evaluate()
  }
}
