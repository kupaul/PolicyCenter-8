package gw.job

uses gw.transaction.Transaction
uses com.guidewire.pl.web.controller.UserDisplayableException

enhancement RewriteNewAccountEnhancement : RewriteNewAccount {
  /**
   * Starts a RewriteNewAccount job for each of the argument policy periods, which represent the
   * terms of policies to be rewritten. Each policy is rewritten in a separate transaction, so an
   * exception will halt the process but earlier successful rewrites may have already been saved.
   * <p/>
   * The effective date of each job will be the CancellationDate of the based-on period if one 
   * exists (representing a rewrite of a canceled policy), or the PeriodEnd of the based-on period
   * otherwise (representing a rewrite of an expired policy). An activity will also be generated 
   * for each job to remind the creator to complete the job, and a history event will be added to
   * the source period's PolicyTerm.
   * 
   * @param policyPeriods Array of PolicyPeriods to be rewritten. Must not be null. 
   * @param targetAccount Account to which the policies will be rewritten. Must not be null.
   */
  static function startRewriteNewAccount(policyPeriods : PolicyPeriod[], targetAccount : Account) {
    validateRewriteForDuplicates(policyPeriods)
    targetAccount.validateAccountHolderSuitableForPoliciesProductType(policyPeriods, displaykey.Web.AccountFile.RewritePolicies.Rewrite) 
    var activityPattern = ActivityPattern.finder.getActivityPatternByCode("complete_rewrite_new_account")
    for (policyPeriod in policyPeriods) {
      Transaction.runWithNewBundle(\ bundle -> {
        var sourceTerm = bundle.add(policyPeriod.PolicyTerm)
        sourceTerm.createCustomHistoryEvent(CustomHistoryType.TC_REWR_NEW_ACCT_CREATED, 
          \ -> displaykey.Job.RewriteNewAccount.History.SourceAccount.Description(policyPeriod.PolicyNumber, targetAccount))
        var job = new RewriteNewAccount(bundle)
        var effectiveDate = policyPeriod.Canceled ? policyPeriod.CancellationDate : policyPeriod.PeriodEnd
        job.startJob(policyPeriod.Policy, effectiveDate, targetAccount.AccountNumber)
        job.createRoleActivity(typekey.UserRole.TC_CREATOR, activityPattern, 
          displaykey.Job.RewriteNewAccount.Activity.Subject(targetAccount, policyPeriod.Policy.Account, policyPeriod.PolicyNumber),
          createActivityDescription(policyPeriod))
      })
    }
  }
  
  static function validateRewriteForDuplicates(policyPeriods : PolicyPeriod[]) {
    var periodsByPolicy = policyPeriods.partition(\ p -> p.Policy)
    var multiplePeriodsForPolicy = periodsByPolicy.Values.where(\ periodList -> periodList.Count > 1)
    if (multiplePeriodsForPolicy.HasElements){
      throw new UserDisplayableException(displaykey.Job.RewriteNewAccount.Error.PeriodsFromSamePolicy)
    }
  }

  private static function createActivityDescription(policyPeriod : PolicyPeriod) : String {
    var description = displaykey.Job.RewriteNewAccount.Activity.Description as String
    var activities = Activity.finder.findOpenActivitiesByPolicy(policyPeriod.Policy)
    if (activities.Count > 0) {
      description += "\n" + displaykey.Job.RewriteNewAccount.Activity.Description.OpenActivities(policyPeriod.PolicyNumber)
    }
    return description    
  }
}
