package gw.web.line.common

uses gw.api.web.job.JobWizardHelper

@Export
class RatingOverrideUIHelper {

  static function beforeCommit(line : PolicyLine, jobWizardHelper : JobWizardHelper, issues : RatingOverrideIssues) {
    var costs = line.Costs.toTypedArray()
    costs.each(\ cost -> {
      cost.storeOverrideAmountsFromBillingOverrideAmounts()
      cost.possiblyClearOverrideReason()
    })
    gw.lob.common.CostOverrideValidation.validateHasSingleOverridePerCost(costs)
    line.Branch.JobProcess.edit()
    try {
      line.Branch.JobProcess.requestQuote(jobWizardHelper)
    } catch (e : gw.job.uw.UWAuthorityBlocksProgressException) {
      var blocksQuote : UWIssueBlockingPoint = "BlocksQuote"
      issues.IssuesBlockingQuote = e.BlockingIssues.where(\ issue -> issue.CurrentBlockingPoint.Priority >= blocksQuote.Priority)
    }
  }

  static function afterCommit(period : PolicyPeriod, jobWizardHelper : JobWizardHelper, issues: RatingOverrideIssues) {
    period.Bundle.commit()
    jobWizardHelper.synchronizeWizardStateAfterRealCommit()
    if (issues.IssuesBlockingQuote.HasElements) {
      pcf.UWBlockProgressIssuesPopup.push(period, jobWizardHelper, issues.IssuesBlockingQuote.CurrentBlockingPoint,
          issues.IssuesBlockingQuote)
    }
  }

  static function clearAllOverrides(line : PolicyLine) {
    line.Costs.each(\ cost -> cost.resetOverrides())
  }

  static function hasAnyOverridableCosts(line : PolicyLine) : boolean {
    return line.Costs.hasMatch(\ cost -> cost.Overridable)
  }

  static class RatingOverrideIssues {
    var _issuesBlockingQuote : UWIssue[] as IssuesBlockingQuote = {}
  }
}