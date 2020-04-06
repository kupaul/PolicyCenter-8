package gw.web.policyfile

uses pcf.JobForward
uses pcf.ReinstatementWizard
uses pcf.IssuanceWizard
uses pcf.RenewalWizard
uses pcf.api.Location

@Export
class PolicyFileMenuActionsUIHelper {

  // Create a new Submission and Policy from this Policy's initial submission
  public static function copySubmission(submission : entity.Submission) {
    User.util.CurrentUser.assertCanView(submission)
    var copy = submission.copyPolicyPeriod(submission.LatestPeriod)
    JobForward.go(copy)
  }

  public static function canCopySubmission(submission : entity.Submission) : boolean {
    return submission != null and perm.Submission.create and perm.System.jobcopy
  }


  public static function startReinstatement(policyPeriod : entity.PolicyPeriod, CurrentLocation : Location) {
    var job = new Reinstatement(policyPeriod.Bundle)
    if (job.startJobAndCommit(policyPeriod, CurrentLocation)) {
      ReinstatementWizard.go(job, job.LatestPeriod)
    }
  }

  public static function getCancellationLabel(cancellation : Cancellation) : String {
    var reasonCode = cancellation.CancelReasonCode
    var reasonStr = (reasonCode == null) ? displaykey.Java.RescindCancellationMenuActionWidget.NoReason :
        reasonCode.DisplayName
    var effDateStr = gw.api.util.StringUtil.formatDate(cancellation.PolicyPeriod.EditEffectiveDate, "medium")
    return displaykey.Web.PolicyFile.CancellationLabel(reasonStr, effDateStr)
  }

  public static function getRescindableCancellations(period : PolicyPeriod) : Cancellation[] {
    var openCancellations = period.Policy.OpenJobs.whereTypeIs(Cancellation)
    var withBasedOn = openCancellations.where(\ j -> j.PolicyPeriod.BasedOn == period)
    return withBasedOn.where(\ job : Cancellation -> job.PolicyPeriod.Status == PolicyPeriodStatus.TC_CANCELING)
  }

  public static function startIssuance(policyPeriod : entity.PolicyPeriod, CurrentLocation : Location) {
    var job = new Issuance(policyPeriod.Bundle)
    if (job.startJobAndCommit(policyPeriod.Policy, CurrentLocation)) {
      IssuanceWizard.go(job, job.LatestPeriod)
    }
  }

  public static function startRenewal(policyPeriod : entity.PolicyPeriod, CurrentLocation : Location) {
    var renewal = new Renewal(policyPeriod.Bundle)
    if (renewal.startJobAndCommit(policyPeriod.Policy, CurrentLocation)) {
      RenewalWizard.go(renewal, renewal.LatestPeriod)
    }
  }
}