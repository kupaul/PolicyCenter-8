package gw.pcf.job.common

uses gw.api.web.job.JobWizardHelper
uses pcf.api.Wizard

@Export
class ManageBranchesScreenHelper {

  static function makeSelected(jobWizardHelper : JobWizardHelper, job : Job, selectedPeriod : PolicyPeriod) {
    job.SelectedVersion = selectedPeriod
    jobWizardHelper.Wizard.saveDraft()
    jobWizardHelper.setPeriodToView(selectedPeriod)
    if (jobWizardHelper.isStepVisitable("PolicyReview")) {
      jobWizardHelper.goToStep("PolicyReview")
    } else {
      var stepId = jobWizardHelper.getInitialWizardStepId(selectedPeriod)
      jobWizardHelper.goToStep(stepId)
    }
  }

  static function withdrawPeriods(jobWizardHelper : JobWizardHelper,
                                  currentLocation : Wizard,
                                  job : Job,
                                  activePeriods : PolicyPeriod[],
                                  selectedPeriods : PolicyPeriod[]) {
    var wrongJobPeriod = selectedPeriods.firstWhere(\ selectedPeriod -> selectedPeriod.Job != job)
    if (wrongJobPeriod != null) {
      jobWizardHelper.addErrorWebMessage(displaykey.Java.PolicyPeriod.CannotWithdrawPeriod(wrongJobPeriod.PolicyNumber, job.JobNumber))
      return
    }

    if (selectedPeriods.Count == activePeriods.Count) {
      jobWizardHelper.addErrorWebMessage(displaykey.Java.PolicyPeriod.CannotCancelLastOne)
      return
    }

    var numSuccessfullyWithdrawn = 0
    for (selectedPeriod in selectedPeriods) {
      var jobConditions = selectedPeriod.JobProcess.canWithdraw()
      if (not jobConditions.Okay) {
        var failureMsg = displaykey.Java.PolicyPeriod.WithdrawPeriodFailed(selectedPeriod.BranchName) + " : " + jobConditions.Message
        jobWizardHelper.addErrorWebMessage(failureMsg)
      } else {
        selectedPeriod.JobProcess.withdraw()
        numSuccessfullyWithdrawn ++
      }
    }
    if (numSuccessfullyWithdrawn == 0) {
      return
    } // Kick out if nothing was withdrawn

    if (job.ActivePeriods.Count == 1) {
      job.SideBySide = false
    }

    currentLocation.saveDraft()
    jobWizardHelper.setPeriodToView(job.LatestPeriod)
  }
}