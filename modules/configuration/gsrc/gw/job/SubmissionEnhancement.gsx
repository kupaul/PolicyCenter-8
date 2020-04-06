package gw.job

uses gw.api.util.DisplayableException

enhancement SubmissionEnhancement : Submission {
  
  /**
   * Create a copy of Policy for a given PolicyPeriod for this Submission
   * Below is the general diagram of this copy method: 
   * <pre> 
   *    +--------+                 +--------+
   *    | Policy |    = clone =>   | Policy |
   *    +--------+                 +--------+
   *        |                          |
   *  +------------+             +------------+
   *  | Submission |   = new =>  | Submission |
   *  +------------+             +------------+
   *        |                          |
   * +--------------+            +--------------+
   * | PolicyPeriod | = clone => | PolicyPeriod |
   * +--------------+            +--------------+
   * The Copy Submission is done in following steps:
   * 1. Commit current changes in the Bundle into DB
   * 2. Get original policy from a given policy period
   * 3. Clone a new policy from original policy 
   * 4. Create a brand new Submission and copy original Submission state but clear PreQual status
   * 5. Clone a new PolicyPeriod from original PolicyPeriod
   * 6. Add new copied PolicyPeriod into new copy Submission
   * 7. Start internal cached job process on copied PolicyPeriod
   * 8. Commit copied Policy/Submission/PolicyPeriod into DB 
   * </pre>
   */
  function copyPolicyPeriod(period : PolicyPeriod): Submission {
    if(!canCopyPolicyPeriod(period)) {
      throw new DisplayableException(displaykey.Submission.Copy.Error.CannotCopy(period.ID, period.BranchName, this.DisplayName))
    }
    // commit all outstanding changes first
    var bundle = period.Bundle
    bundle.commit()

    // clone policy in Java
    var policy = period.Policy
    var copyPolicy = policy.clonePolicy()
    copyPolicy.OriginalEffectiveDate = null
    
    // clone policy period
    var copyPeriod = period.copyBranchIntoNewPolicy(copyPolicy)    

    // copy submission and its state
    var copySubmission = new Submission(bundle)

    // Link copied period into copied submission
    copySubmission.addToPeriods( copyPeriod )

    // Initialize submission fields
    copySubmission.initializeJob()
    copySubmission.QuoteType = this.QuoteType
    
    // copy submission is ready - commit bundle:
    copyPeriod.SubmissionProcess.start()
    bundle.commit()
    
    return copySubmission
  }

  function canCopyPolicyPeriod(period : PolicyPeriod) : boolean {
    if(period.Job != this) 
      throw displaykey.Submission.Copy.Error.PeriodNotOnJob(period.DisplayName)
    return true
  }

  /**
   * Given a Submission job, this method groups it into the appropriate Submission group
   * or creates a new one if a valid group does not exist.
   */
  function addToGroup() {
    var group = this.findJobGroupWithinWindow(SubmissionGroup, -1)
    if (group == null) {
      group = new SubmissionGroup(this)
      this.initializeGroup(group, "SG")
    }
    group.addJob(this)
  }

  property get Producer() : User {
    var assignments = this.RoleAssignments
   
    return assignments.firstWhere(\assignment->{
      return (assignment.Role!= null && assignment.Role == TC_PRODUCER) 
     }).AssignedUser
  }
 
}
