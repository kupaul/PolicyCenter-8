package gw.web.job.policychange

uses java.util.Date

@Export
class StartPolicyChangeUIHelper {

  public static function getConfirmMessage(inForcePeriod : entity.PolicyPeriod, effectiveDate : Date) : String {
    var result = ""
    if (inForcePeriod != null) {
      if(inForcePeriod.Policy.isOOSChange(effectiveDate)){
        result = result + displaykey.Web.Job.OOS.VerifyOOSChange
      }
      if(inForcePeriod.hasFinalAuditFinished()){
        result = result + displaykey.Web.Job.FinalAuditCompleted
      }
    }
    return result
  }

  /**
   * Apply the EffectiveTimePlugin to initalize the time part of the EffectiveDate.
   * The EffectiveDate will be validated by PolicyPlugin.canStartPolicyChange()
   */
  public static function applyEffectiveTimePluginForPolicyChange( policyPeriod : entity.PolicyPeriod, job : entity.PolicyChange, effDate : java.util.Date ) : java.util.Date {
    var effDateTime = gw.api.job.EffectiveDateCalculator.instance().getPolicyChangeEffectiveDate(effDate, policyPeriod, job)
    if (effDateTime < policyPeriod.PeriodStart) {
      effDateTime = policyPeriod.PeriodStart
    } else if (effDateTime >= policyPeriod.PeriodEnd) {
      effDateTime = policyPeriod.PeriodEnd.addMinutes(-1)
    }
    return effDateTime
  }


  /**
   * Returns a string with applicable warnings when starting a policy change. These warnings will not
   * prevent the policy change from starting. The string may be empty.
   */
  public static function getPolicyChangeWarningMessage(pInForcePeriod: PolicyPeriod, pEffectiveDate: Date) : String {
    var messages = new java.util.ArrayList<String>()
    if (pInForcePeriod != null) {
      if (!pInForcePeriod.Policy.Issued) {
        messages.add(displaykey.Web.Job.ChangeNonIssuedPolicy)
      }
      if ( pInForcePeriod.Canceled ) {
        var cancellationDate = pInForcePeriod.CancellationDate.format("short")
        messages.add(displaykey.Web.Job.PolicyIsCanceledAsOf(cancellationDate))
      }
      if(pInForcePeriod.Policy.hasOpenPolicyChangeJob()) {
        messages.add(displaykey.Web.PolicyChange.MayResultInPreemption)
      }
      if ( pInForcePeriod.Policy.RewrittenToNewAccountDestination != null){
        messages.add(displaykey.Web.Job.ChangeRewriteNewAccountPolicy(pInForcePeriod.Policy.RewrittenToNewAccountDestination.LatestBoundPeriod.PolicyNumber))
      }
    }

    return messages.Empty ? null : messages.join(", ")
  }
}