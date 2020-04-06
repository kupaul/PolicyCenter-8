package gw.web.job

uses pcf.PolicyFileForward
uses pcf.ViewChangeConflictsWorksheet

@Export
class HandlePreemptionPopupUIHelper {

  public static function applyChanges(wizard : pcf.api.Wizard, jobWizardHelper : gw.api.web.job.JobWizardHelper, policyPeriod : entity.PolicyPeriod, CurrentLocation : pcf.HandlePreemptionPopup) {
    var results : List<gw.job.ApplyChangesResult> = {}
    if (policyPeriod.Job.SideBySide) {
      for (pp in policyPeriod.Job.ActivePeriods) {
        results.add(pp.JobProcess.handlePreemptions())
        wizard.saveDraft()
      }
    } else {
      results.add(policyPeriod.JobProcess.handlePreemptions())
    }
    CurrentLocation.cancel()
    var result = results.firstWhere(\r -> r.hasConflicts())
    if (null==result) {
      result = results.first()
    }
    jobWizardHelper.setPeriodToView(result.Branch)
    wizard.saveDraft()
    if (result.hasConflicts()) {
      var rootNode = gw.diff.tree.DiffTree.recalculateRootNodeForPreemptionConflicts(result.Branch, result.Conflicts)
      if(rootNode.NumChildren <> 0){
        ViewChangeConflictsWorksheet.goInWorkspace(result, displaykey.Web.Job.Preempted.Conflicts.Tab, displaykey.Web.Job.Preempted.Conflicts.Title)
      }
    }
  }

  public static function withdraw(wizard : pcf.api.Wizard, policyPeriod : entity.PolicyPeriod) {
    policyPeriod.JobProcess.withdraw()
    wizard.finish()
    PolicyFileForward.go(policyPeriod.PolicyNumber)
  }

  public static function makeRootNodes(periods : PolicyPeriod[]) : java.util.HashMap<entity.PolicyPeriod,gw.api.tree.RowTreeRootNode> {
    var nodeMap = new java.util.HashMap<PolicyPeriod, gw.api.tree.RowTreeRootNode>()
    for (period in periods) {
      var node = gw.diff.tree.DiffTree.recalculateRootNodeForPolicyReview(period)
      nodeMap.put(period, node)
    }
    return nodeMap
  }
}