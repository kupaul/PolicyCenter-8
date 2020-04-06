package gw.processes
uses gw.processes.BatchProcessBase
uses gw.api.domain.job.PolicyRenewalCheckDateClearer


@Export
class PolicyRenewalClearCheckDate extends BatchProcessBase {

  construct() {
    super(BatchProcessType.TC_POLICYRENEWALCLEARCHECKDATE)
  }

  /**
   * This implementation will clear all PolicyRenewalCheckDates on PolicyTerms
   * This batch process is useful to call when a significant change to configuration will change the renewal date for
   * many Policies, and require them to be calculated.
   * As an alternative, a batch process can be rewritten to recalculate all the renewal check dates (but it should be noted,
   * that process will be much slower)
   */
  override function doWork() {
    PolicyRenewalCheckDateClearer.clearAllPolicyRenewalCheckDates()
  }

}
