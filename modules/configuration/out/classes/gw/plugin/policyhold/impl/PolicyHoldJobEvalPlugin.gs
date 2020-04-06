package gw.plugin.policyhold.impl

uses gw.api.database.DBFunction
uses gw.api.database.IQueryBeanResult
uses gw.api.database.IQueryBuilder
uses gw.api.database.Query
uses gw.api.util.CoreFilters.Equals
uses gw.assignment.AssignmentUtil
uses gw.plugin.policyhold.IPolicyHoldJobEvalPlugin
uses gw.api.admin.PolicyHoldsLogger

@Export
class PolicyHoldJobEvalPlugin implements IPolicyHoldJobEvalPlugin {

  /**
   * Finds jobs that are:
   * 1. open
   * 2. has policy periods with a active blocking policy hold
   * 3. and hasn't been evaluated since the last time the policy hold has changed
   *
   * @return jobs that need to be evaluated against the policy holds blocking them.
   */
  override function findJobsToEvaluate() : IQueryBeanResult<PolicyHoldJob> {
    var query = Query.make(PolicyHoldJob)
    buildQueryForJobsToEvaluate(query)
    return query.select();
  }

  /**
   * Finds jobs that are:
   * 1. open
   * 2. has policy periods with a active blocking policy hold
   * 3. and hasn't been evaluated since the last time the policy hold has changed
   *
   * @return jobs that need to be evaluated against the policy holds blocking them.
   */
  override function buildQueryForJobsToEvaluate(aQuery: IQueryBuilder<PolicyHoldJob>) {
    aQuery.withDistinct(true)

    var policyHoldTable  = aQuery.join("PolicyHold").withFindRetired(true)
    aQuery.compare("LastEvalTime", LessThan, policyHoldTable.getColumnRef("UpdateTime"))

    var jobTable = aQuery.join("Job")
    var policyPeriodTable = jobTable.subselect("ID", CompareIn, PolicyPeriod, "Job")

    var uwIssueTable = policyPeriodTable.subselect("ID", CompareIn, UWIssue, "BranchValue")
    uwIssueTable.compare("Active", Equals, true)
    uwIssueTable.compare("IssueKey", Equals, policyHoldTable.getColumnRef("PolicyHoldCode"))
    uwIssueTable.compare("IssueType", Equals, policyHoldTable.getColumnRef("IssueType"))

    // We need to return 1 and only 1 PolicyHoldJob for jobs with multiple periods.
    // Using the max ID is one deterministic way of doing this
    var subselectQuery = Query.make(PolicyHoldJob)
        .compare("Job", Equals, aQuery.getColumnRef("Job"))
        .compare("PolicyHold", Equals, aQuery.getColumnRef("PolicyHold"))

    aQuery.subselect("ID", CompareIn, subselectQuery, DBFunction.Max(subselectQuery.getColumnRef("ID")))
  }

  /**
   * Creates an activity and assigns to producer if the policy hold has been deleted or
   * the hold has changed to cause the job to no longer match.
   *
   * @param policyHoldJob the PolicyHoldJob to evaluate.
   */
  override function evaluate(policyHoldJob : PolicyHoldJob) {
    var policyHold = policyHoldJob.PolicyHold
    var job = policyHoldJob.Job

    var periods = job.Periods.where(\ p ->
      p.Locked == false and
      p.UWIssuesActiveOnly
        .hasMatch(\ u -> u.IssueKey == policyHold.PolicyHoldCode
                         and u.IssueType == policyHold.IssueType)
    )

    var targetedPolicyHoldJobs = policyHold.HeldJobs.where(\phj -> phj.Job == job)

    // Check the periods to see if the associated hold no longer applies to at least one of the periods for the targeted job.
    for (period in periods) {
      policyHoldJob.LastEvalTime = java.util.Date.CurrentDate
      if (policyHold.Retired == true or !policyHold.compareWithPolicyPeriod(period)) {
        if (job typeis Renewal) {
          processRenewal(policyHoldJob, period)
        } else {
          generateActivity(policyHoldJob, policyHold)
        }
        // Remove all policy hold jobs associated with the job as at least one period is no longer held
        PolicyHoldsLogger.logDebug("Removing all PolicyHoldJobs for: " + policyHold)
        targetedPolicyHoldJobs.each(\phj -> phj.remove())
        return
      }
    }

    // Remove all held jobs for closed periods
    // This clears policy hold jobs associated with periods which were withdraw or whose
    // uw issue hold was overridden and bound.
    targetedPolicyHoldJobs
      .where(\phj -> PolicyPeriodStatus.TF_CLOSED.TypeKeys.contains(phj.Period.Status))
      .each(\phj -> {
        PolicyHoldsLogger.logDebug("Removing PolicyHoldJob associated with closed period.  PolicyHoldJob:: " + phj)
        phj.remove()
      })
  }

  /**
   * Special processing for automated renewals, if hold no longer applies, put it back into automatic processing unless
   * user specifically chooses to escalate the renewal
   */
  private function processRenewal(policyHoldJob : PolicyHoldJob, period : PolicyPeriod) {
    var issues : UWIssue[]
    var job = policyHoldJob.Job

    if(job.SelectedVersion.Status == PolicyPeriodStatus.TC_NONRENEWING or job.SelectedVersion.Status == PolicyPeriodStatus.TC_NOTTAKING) {
      return
    }

    if ((job as Renewal).EscalateAfterHoldReleased == false) {
      if (job.SelectedVersion.Status == PolicyPeriodStatus.TC_QUOTED) {
        issues = period.RenewalProcess.JobProcessEvaluator.evaluateAndFindBlockingUWIssues(period, UWIssueBlockingPoint.TC_BLOCKSBIND)
        // Only put renewal in pending renew if there are no additional issues, so that user doesn't get blocked again in automated processing
        if (not issues.HasElements) {
          period.RenewalProcess.pendingRenew()
        }
      } else if (job.SelectedVersion.Status == PolicyPeriodStatus.TC_DRAFT) {
        issues = period.RenewalProcess.JobProcessEvaluator.evaluateAndFindBlockingUWIssues(period, UWIssueBlockingPoint.TC_BLOCKSQUOTE)
        // Only put renewal in automated renewal if there are no additional issues, so that user doesn't get blocked again in automated processing
        if (not issues.HasElements) {
          period.RenewalProcess.beginAutomaticRenewal()
        }
      }
    } else {
      generateActivity(policyHoldJob, policyHoldJob.PolicyHold)
    }
  }

  private function generateActivity(policyHoldJob : PolicyHoldJob, policyHold : PolicyHold) {
    var job = policyHoldJob.Job
    var activity = ActivityPattern.finder.getActivityPatternByCode("policy_hold_released")
                          .createJobActivity(policyHoldJob.Bundle, job,
                                             displaykey.PolicyHold.Released.Activity.Subject(policyHold.PolicyHoldCode),
                                             displaykey.PolicyHold.Released.Activity.Description(policyHold.PolicyHoldCode),
                                             null, null, null, null, null)
    // attempt to assign to the producer
    var success = false
    var producer = job.getUserRoleAssignmentByRole("Producer")
    if (producer != null) {
      success = activity.assign(producer.AssignedGroup, producer.AssignedUser)
    }

    // if assignment fails, fall back to the default user
    if(!success) {
      activity.assign(AssignmentUtil.DefaultUser.DefaultAssignmentGroup, AssignmentUtil.DefaultUser)
    }
  }
}
