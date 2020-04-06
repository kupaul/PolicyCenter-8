package gw.plugin.policyperiod.impl

uses gw.plugin.policyperiod.IJobProcessCreationPlugin
uses gw.api.job.IJobProcess
uses gw.job.CancellationProcess
uses gw.job.AuditProcess
uses gw.job.PolicyChangeProcess
uses gw.job.IssuanceProcess
uses gw.job.ReinstatementProcess
uses gw.job.RenewalProcess
uses gw.job.SubmissionProcess
uses gw.job.RewriteProcess
uses java.lang.IllegalArgumentException
uses gw.job.RewriteNewAccountProcess
uses gw.api.util.DisplayableException

/**
 * Use this plug-in to substitute alternative JobProcess classes.
 *
 * <p/><b>Note:</b> The JobProcess classes involve complex logic that is extremely sensitive to modification.  
 * To implement changes to out-of-the-box logic, one  approach is to subclass the existing 
 * JobProcess class and override methods as needed.  This preserves the original logic for 
 * reference.  The JobProcess classes are exported as of 4.0.2, so another approach is to 
 * modify the classes directly.  In either case, proceed with caution.  Seemingly small changes 
 * can break the jobs.
 */

@Export
class JobProcessCreationPlugin implements IJobProcessCreationPlugin {
    
  /** 
   * Constructs the appropriate job process class given the type of job associated to the policy period.
   * Change this method as necessary to substitute alternate JobProcess implementations.
   * 
   * @param period the PolicyPeriod for which to construct a job process
   * @return a new process
   */
  override function createJobProcess(period: PolicyPeriod): IJobProcess {
    if (period == null) {
      throw new DisplayableException(displaykey.Java.PolicyPeriod.Error.NullPeriod)
    }
    if (period.Job == null) {
      throw new DisplayableException(displaykey.Java.PolicyPeriod.Error.NullJob);
    }
    switch (typeof period.Job) {
      case Audit:             return new AuditProcess(period)
      case Cancellation:      return new CancellationProcess(period)
      case Issuance:          return new IssuanceProcess(period)
      case PolicyChange:      return new PolicyChangeProcess(period)
      case Reinstatement:     return new ReinstatementProcess(period)
      case Renewal:           return new RenewalProcess(period)
      case Rewrite:           return new RewriteProcess(period)
      case RewriteNewAccount: return new RewriteNewAccountProcess(period)
      case Submission:        return new SubmissionProcess(period)
      default : throw new IllegalArgumentException("Unhandled job subtype " + period.Job.DisplayType)
    }
  }

}
