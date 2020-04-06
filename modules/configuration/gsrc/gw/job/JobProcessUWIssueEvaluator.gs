package gw.job

uses gw.job.uw.UWAuthorityBlocksProgressException
uses gw.job.uw.UWIssueAutomaticApprovabilityAnalyzer
uses gw.policy.PolicyEvaluator

@Export
class JobProcessUWIssueEvaluator {

  /**
   * This class is used to define the mappings of which "checking sets" (groups of UW Issue types)
   * are evaluated when a given job type reaches a certain "blocking point"
   *  
   * Note that these defaults can be (and are, in the OOB configuration) overriden by job-specific evaluators
   * 
   * At any given blocking point, XXXXX, the list of checking sets run include:
   *   * checkedAtAllBlockingPoints
   *   * checkedAtXXXXX
   * 
   * Each of these checking sets is "run" by later code that calls IPolicyEvalPlugin 
   * with the checking set typekey as one of its arguments
   *
   * Note also that, OOB, the submission process, in SubmissionProcess.gs,
   * evaluates either the checkedAtBind list or the checkedAtIssuance list, not both.
   * Checking sets that need to be evaluated for both the "Bind" and the "Bind & Issue" actions
   * need to be added to both lists
   */

  private var _checkedAtAllBlockingPoints : List<UWIssueCheckingSet> as CheckedAtAllBlockingPoints
      = {UWIssueCheckingSet.TC_ALL, UWIssueCheckingSet.TC_REFERRAL, UWIssueCheckingSet.TC_REGULATORYHOLD, UWIssueCheckingSet.TC_UWHOLD}

  private var _checkedAtQuote : List<UWIssueCheckingSet> as CheckedAtQuote = {UWIssueCheckingSet.TC_QUESTION, UWIssueCheckingSet.TC_PREQUOTE, UWIssueCheckingSet.TC_MVR}
  private var _checkedAtQuoteRelease : List<UWIssueCheckingSet> as CheckedAtQuoteRelease = {UWIssueCheckingSet.TC_PREQUOTERELEASE, UWIssueCheckingSet.TC_MVR}
  private var _checkedAtBind : List<UWIssueCheckingSet> as CheckedAtBind = {UWIssueCheckingSet.TC_PREBIND, UWIssueCheckingSet.TC_MVR}
  private var _checkedAtIssuance : List<UWIssueCheckingSet> as CheckedAtIssuance =  {UWIssueCheckingSet.TC_PREBIND, UWIssueCheckingSet.TC_MVR, UWIssueCheckingSet.TC_PREISSUANCE}
  private var _checkedAtAllButQuote : List<UWIssueCheckingSet> as CheckAtAllButQuote = {UWIssueCheckingSet.TC_REINSURANCE}
    
  /**
   * Calls evaluateAndCheckForBlockingUWIssuesInSlices
   */
  function evaluateAndCheckForBlockingUWIssues(branch : PolicyPeriod, blockingPoint : UWIssueBlockingPoint) {
    evaluateAndCheckForBlockingUWIssuesInSlices(branch, blockingPoint, branch.OOSSlices)
  }
  
  /**
   * Refreshes any UWIssue's that are evaluated at the given blocking point. If *any* issue during an active window 
   * on the PolicyPeriod block progress after evaluation (whether or not created during this call), throws an
   * exception.
   * 
   * @param branch The PolicyPeriod under evaluation
   * @param blockingPoint The UWIssueBlockingPoint beyond which the branch's JobProcess is trying to progress.
   * @throws UWAuthorityBlocksProgressException if any UWIssue's block progress progress past blockingPoint
   */
  function evaluateAndCheckForBlockingUWIssuesInSlices(branch : PolicyPeriod, blockingPoint : UWIssueBlockingPoint, oosSlices_ : entity.PolicyPeriod[]) {
    var activeSlices = oosSlices_.where(\ p -> p.SliceDate < branch.EndOfCoverageDate)
    var blockingIssues = evaluateAndFindBlockingUWIssuesInSlices(branch, blockingPoint, activeSlices)
    if (not blockingIssues.IsEmpty) {
      throw new UWAuthorityBlocksProgressException(blockingIssues)  
    }
  }

  /**
   * Calls evaluateAndFindBlockingUWIssuesInSlices
   */
  function evaluateAndFindBlockingUWIssues(branch : PolicyPeriod, blockingPoint : UWIssueBlockingPoint) : entity.UWIssue[] {
    return evaluateAndFindBlockingUWIssuesInSlices(branch, blockingPoint, branch.OOSSlices)
  }
  
  /**
   * Refreshes any UWIssue's that are evaluated at the given blocking point.
   * @param branch The PolicyPeriod under evaluation
   * @param blockingPoint The UWIssueBlockingPoint beyond which the branch's JobProcess is trying to progress.
   * @return The collection of UWIssue's which block progress at blockingPoint
   */
  function evaluateAndFindBlockingUWIssuesInSlices(branch : PolicyPeriod, blockingPoint : UWIssueBlockingPoint, oosSlices_ : entity.PolicyPeriod[]) : entity.UWIssue[] {
    for (ooseSlice in oosSlices_) {
      for (checkingSet in checkingSetsFor(blockingPoint)) {
        evaluateUWIssues(ooseSlice, checkingSet)
      }
    }
    
    for (ooseSlice in oosSlices_) {
      var blockingIssues = findBlockingIssues(ooseSlice, blockingPoint)
      if (not blockingIssues.IsEmpty) {
        return blockingIssues
      }
    }
    
    // Even if evaluation passed, we still want to show the slice selector if anything varies in time
    setFailedOOSEEvaluationFlagIfAnyIssuesVary(branch)
    return {}
  }
  
   /**
   * Refreshes any UWIssue's that are evaluated anywhere except at pre-quote
   * @param branch The PolicyPeriod under evaluation
   * @param blockingPoint The UWIssueBlockingPoint beyond which the branch's JobProcess is trying to progress.
   * @return The collection of UWIssue's which block progress at blockingPoint
   */

  /**
   * The evaluator used for Audit jobs.
   */
  static function forAudit() : JobProcessUWIssueEvaluator {
    return JobProcessUWIssueEvaluator.NO_OP_EVALUATOR
  }

  /**
   * The evaluator used for Cancellation jobs.
   */
  static function forCancellation() : JobProcessUWIssueEvaluator {
    return JobProcessUWIssueEvaluator.NO_OP_EVALUATOR
  }

  /**
   * The evaluator used for Issuance jobs.
   */
  static function forIssuance() : JobProcessUWIssueEvaluator {
    return new JobProcessUWIssueEvaluator() {
      :CheckedAtAllBlockingPoints = {UWIssueCheckingSet.TC_ALL, UWIssueCheckingSet.TC_UWHOLD, UWIssueCheckingSet.TC_REGULATORYHOLD, UWIssueCheckingSet.TC_REFERRAL}
    }
  }

  /**
   * The evaluator used for PolicyChange jobs.
   */
  static function forPolicyChange() : JobProcessUWIssueEvaluator {
    return new JobProcessUWIssueEvaluator() {
      :CheckedAtAllBlockingPoints = {UWIssueCheckingSet.TC_ALL, UWIssueCheckingSet.TC_UWHOLD, UWIssueCheckingSet.TC_REGULATORYHOLD, UWIssueCheckingSet.TC_REFERRAL}
    }
  }

  /**
   * The evaluator used for Reinstatement jobs.
   */
  static function forReinstatement() : JobProcessUWIssueEvaluator {
    return new JobProcessUWIssueEvaluator() {
      :CheckedAtAllBlockingPoints = {UWIssueCheckingSet.TC_ALL, UWIssueCheckingSet.TC_UWHOLD, UWIssueCheckingSet.TC_REGULATORYHOLD, UWIssueCheckingSet.TC_REFERRAL}
    }
  }

  /**
   * The evaluator used for Renewal jobs.
   */
  static function forRenewal() : JobProcessUWIssueEvaluator {
    return new JobProcessUWIssueEvaluator() {
      :CheckedAtAllBlockingPoints = {UWIssueCheckingSet.TC_ALL, UWIssueCheckingSet.TC_UWHOLD, UWIssueCheckingSet.TC_REGULATORYHOLD, UWIssueCheckingSet.TC_REFERRAL},
      :CheckedAtQuote = {UWIssueCheckingSet.TC_QUESTION, UWIssueCheckingSet.TC_PREQUOTE, UWIssueCheckingSet.TC_RENEWAL},
      :CheckedAtIssuance = {UWIssueCheckingSet.TC_PREBIND, UWIssueCheckingSet.TC_PREISSUANCE, UWIssueCheckingSet.TC_RENEWAL},
      :CheckAtAllButQuote = {UWIssueCheckingSet.TC_REINSURANCE}
    }
  }

  /**
   * The evaluator used for Rewrite jobs.
   */
  static function forRewrite() : JobProcessUWIssueEvaluator {
    return new JobProcessUWIssueEvaluator() {
      :CheckedAtAllBlockingPoints = {UWIssueCheckingSet.TC_ALL, UWIssueCheckingSet.TC_UWHOLD, UWIssueCheckingSet.TC_REGULATORYHOLD, UWIssueCheckingSet.TC_REFERRAL}
    }
  }

  /**
   * The evaluator used for RewriteNewAccount jobs.
   */
  static function forRewriteNewAccount() : JobProcessUWIssueEvaluator {
    return new JobProcessUWIssueEvaluator() {
      :CheckedAtAllBlockingPoints = {UWIssueCheckingSet.TC_ALL, UWIssueCheckingSet.TC_UWHOLD, UWIssueCheckingSet.TC_REGULATORYHOLD, UWIssueCheckingSet.TC_REFERRAL}
    }
  }

  /**
   * The evaluator used for Submission jobs.
   */
  static function forSubmission() : JobProcessUWIssueEvaluator {
    return new JobProcessUWIssueEvaluator() { 
      :CheckedAtAllBlockingPoints = {UWIssueCheckingSet.TC_ALL, UWIssueCheckingSet.TC_UWHOLD, UWIssueCheckingSet.TC_REGULATORYHOLD, UWIssueCheckingSet.TC_REFERRAL}
    }
  }

  /**
   * Examines the PolicyPeriod for all potential UWIssue's in the given checkingSet. On completion
   * the PolicyPeriod will be up-to-date with respect to all UWIssue's with the given checkingSet.
   */
  protected function evaluateUWIssues(branch : PolicyPeriod, checkingSet : UWIssueCheckingSet) {
    PolicyEvaluator.evaluatePolicy(branch, checkingSet)
  }
  
  /**
   * Finds all issues on the given PolicyPeriod blocking progress past the given blocking point. If no
   * blocking issues are found, adds automatic approval to any such approvable issues.
   */
  protected function findBlockingIssues(branch : PolicyPeriod, bp : UWIssueBlockingPoint) : entity.UWIssue[] {
    var analyzer = new UWIssueAutomaticApprovabilityAnalyzer(branch.UWIssuesActiveOnly.whereBlocking(bp),
        CurrentAuthorityProfiles*.Grants, bp, branch.JobProcess.AutomatedProcess)
    if (analyzer.RequireManualAttention.Count > 0) {
      // If we fail on the first slice, we only want the OOSE slice selector to show up if values vary in time
      // Otherwise, we always want it to show up, just in case
      if (branch.SliceDate == branch.EditEffectiveDate) {
        setFailedOOSEEvaluationFlagIfAnyIssuesVary(branch)  
      } else {
        branch.FailedOOSEEvaluation = true  
      }
      return analyzer.RequireManualAttention
    }
    
    for (issue in analyzer.AutoApprovable) {
      issue.createAutomaticApproval("${branch.Job.JobNumber}@${bp.Code}").createApprovalHistoryFromCurrentValues()
    }
    
    return {}
  }

  protected function setFailedOOSEEvaluationFlagIfAnyIssuesVary(branch : PolicyPeriod) {
    var issues = branch.VersionList.UWIssuesIncludingSoftDeleted
    branch.FailedOOSEEvaluation = issues.hasMatch(\i -> i.AllVersions.first().ValueVariesAcrossSlices)
  }

  protected property get CurrentAuthorityProfiles() : UWAuthorityProfile[] {
    return User.util.CurrentUser.UWAuthorityProfiles  
  }

  private function checkingSetsFor(bp : UWIssueBlockingPoint) : List<UWIssueCheckingSet> {
    var checkingSets = CheckedAtAllBlockingPoints.copy()
    if (bp != UWIssueBlockingPoint.TC_BLOCKSQUOTE)
        checkingSets.addAll(_checkedAtAllButQuote)
    checkingSets.addAll(checkingSetsForSpecificBlockingPoint(bp))
    return checkingSets
  }
  
  private function checkingSetsForSpecificBlockingPoint(bp : UWIssueBlockingPoint) : List<UWIssueCheckingSet> {
    switch (bp) {
      case UWIssueBlockingPoint.TC_BLOCKSQUOTE: return CheckedAtQuote
      case UWIssueBlockingPoint.TC_BLOCKSQUOTERELEASE: return CheckedAtQuoteRelease
      case UWIssueBlockingPoint.TC_BLOCKSBIND : return CheckedAtBind
      case UWIssueBlockingPoint.TC_BLOCKSISSUANCE : return CheckedAtIssuance
      default: return {}
    }
  }
  
  //-------------------------------------------------------------------------------------------------------------------
  // A no-op evaluator for use in GW tests.
  public static final var NO_OP_EVALUATOR : JobProcessUWIssueEvaluator = new JobProcessUWIssueEvaluator() {
    override function evaluateAndFindBlockingUWIssues(branch : PolicyPeriod, bp : UWIssueBlockingPoint) : entity.UWIssue[] {
      // return nothing
      return {}
    }
    
    override function evaluateUWIssues(branch : PolicyPeriod, checkingSet : UWIssueCheckingSet) {
      // do nothing  
    }
    
    override function findBlockingIssues(branch : PolicyPeriod, bp : UWIssueBlockingPoint) : entity.UWIssue[] {
      return {}
    }
  }
}
