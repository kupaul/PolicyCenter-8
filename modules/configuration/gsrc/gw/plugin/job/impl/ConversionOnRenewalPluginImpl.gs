package gw.plugin.job.impl

uses gw.plugin.job.ConversionOnRenewalPlugin
uses java.lang.Exception

@Export
class ConversionOnRenewalPluginImpl implements ConversionOnRenewalPlugin {

  /**
   * This implementation of conversionOnRenewalFailed is designed to allow for a rerunning of the renewal by doing two things:
   *   * ensure the renewal can be purged
   *   * ensure policy number will not conflict on rerun
   *
   * First, it ensures the renewal has a status that is allowed to be purged, expecting it will be removed from the system at
   * some point.  Mostly, this is setting it's status to legal one for purging.  Before calling conversionOnRenewalFailed,
   * the system will attempt to unlock the PolicyPeriod and set its status to draft, allowing it to be changed here.
   * Second, it will change the policy number on the renewal so there will not be a conflict when the renewal is
   * attempted again.
   * @param renewal
   * @param basedOnPeriod
   * @return
   */
  override function conversionOnRenewalFailed(renewal: Renewal, basedOnPeriod: PolicyPeriod) : Renewal {
    try {
      for (period in renewal.ActivePeriods) {
        gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          period.Status = PolicyPeriodStatus.TC_NEW
          period.PolicyNumber = period.genNewPeriodPolicyNumber()
        })
      }
      // return renewal if fixed or null to stop the conversion on renewal process that failed
      return null
    } catch (e : Exception) {
      e.printStackTrace()
    }
    return null
  }
}

