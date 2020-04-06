package gw.web.job.common

@Export
class SideBySideUIHelper {

  static function quoteAll(wizard : pcf.api.Wizard, jobWizardHelper : gw.api.web.job.JobWizardHelper,
      periodInfos : gw.job.sxs.SideBySidePolicyPeriodInfo[], periods : PolicyPeriod[]) {
    gw.lob.common.SideBySideUtil.setLastResultFromValidationContextAndGetQuotes(periods, periodInfos)
    wizard.saveDraft()
    jobWizardHelper.refreshBundle()
    periodInfos.each(\ i -> i.validateWithoutQuote())
    jobWizardHelper.Wizard.refreshCurrentStep()
  }

  // Full App conversion button visible if:
  // 1) We're in submission job
  // 2) We're in Quick Quote
  // 3) canCovertToFullApp().Okay
  static function fullAppVisible(jobProcess : gw.job.JobProcess) : boolean {
    if (jobProcess typeis gw.job.SubmissionProcess) {
      if (jobProcess.Job.QuoteType == "Quick") {
        return jobProcess.canConvertToFullApp().Okay
      }
    }
    return false
  }
}