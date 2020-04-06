package gw.plugin.purge.impl

uses gw.api.system.PCConfigParameters
uses gw.api.archive.PCArchivingUtil
uses gw.history.HistorySearchCriteria
uses gw.plugin.purge.PurgeContext
uses gw.plugin.purge.PurgePlugin

uses java.util.Date
uses java.util.List
uses gw.api.util.Logger
uses java.lang.IllegalStateException
uses java.lang.UnsupportedOperationException
uses gw.api.system.PCLoggerCategory

@Export
class PCPurgePlugin implements PurgePlugin {

  override function skipOrphanedPolicyPeriodForPurge(orphanedPurgeCandidate : PolicyPeriod) : boolean {
    /*
     * Orphaned policy periods are created when a policy period is preempted.
     * There is no UI or other way to access these in the default configuration.
     * Should the customer wish to retain specific orphaned policy periods in the database
     * this function should return true for those specific poilcy periods.
     * Should the customer wish to retain orphaned policy periods until the end date has passed,
     * the customer could uncomment the if-block's three lines below.
     * If the customer does not wish to remove any orphaned policy periods, do not run the
     * PurgeOrphanedPolicyPeriods batch process
     */
//    if (orphanedPurgeCandidate.PeriodEnd > PLDependenciesGateway.getSystemClock().getDateTime()) {
//      return true
//    }

    return false
  }

  override function createContext(context : PurgeContext) : PurgeContext {
    /* just return the specified context, or return a subclass instance
     * created from the specified context...
    return context
    */
    return new ExtendedContext(context)
  }

  override function prepareForPurge(context : PurgeContext) {
    /*
     * Perform any actions prior to purge such as logging or gathering statistics.
     * Guidewire performs some cleanup for PolicyPeriod links before purging.
     */
    var extendedContext = context as ExtendedContext
    if (extendedContext.PurgePolicy) {
      extendedContext.PurgedPublicID = extendedContext.Policy.PublicID
      checkForArchiveObjectsAttached(extendedContext.Policy)
    } else if (extendedContext.PurgeJob) {
      extendedContext.PurgedPublicID = extendedContext.Job.PublicID
      checkForArchiveObjectsAttached(extendedContext.Job)
    } else if (extendedContext.PrunePeriod) {
      extendedContext.PurgedPublicID = extendedContext.Period.PublicID
      checkForArchiveObjectsAttached(extendedContext.Period)
    } else if (extendedContext.PurgeWorksheets) {
      extendedContext.PurgedPublicID = extendedContext.WorksheetContainer.PublicID
    } else {
      throw new UnsupportedOperationException("Trying to purge a type that is not handled by the plugin.")
    }

    if (context.PrunePeriod) {
      var policyPeriod = context.Period
      //remove link from history to policy period.  History remains linked to job
      var historyCriteria = new HistorySearchCriteria()
      historyCriteria.RelatedItem = policyPeriod
      var purgeHistoryTypes = {CustomHistoryType.TC_PURGEDISABLED, CustomHistoryType.TC_PURGEENABLED}
      var purgeFlagHistories = historyCriteria.performSearch().where(\ h -> purgeHistoryTypes.contains(h.CustomType))
      purgeFlagHistories.each(\ h -> {
        policyPeriod.Bundle.add(h)
        h.PolicyPeriod = null
      })
    }
  }

  private function checkForArchiveObjectsAttached(policy : Policy) {
    for (policyPeriod in policy.Periods) {
      checkForArchiveObjectsAttached(policyPeriod)
    }
  }

  private function checkForArchiveObjectsAttached(job : Job) {
    for (policyPeriod in job.Periods) {
      checkForArchiveObjectsAttached(policyPeriod)
    }
  }

  /*
   * Cross term links are artifacts added when a policy period is archived.  When a PolicyPeriod is pruned from a
   * Job or purged as part of purging a Job or Policy, the associated CrossTermLinks are also deleted.  It is not
   * expected that archived policy periods will be pruned or purged, but it is possible and worth noting.
  */
  private function checkForArchiveObjectsAttached(policyPeriod : PolicyPeriod) {
    if (policyPeriod.hasArchiveObjectsAttached()) {
      PCLoggerCategory.ARCHIVING.warn("Preparing to purge PolicyPeriod graph (PublicID: ${policyPeriod.PublicID}) that has archived objects attached. This is not a supported action.")
    }
  }

  override function postPurge(context : PurgeContext) {
    /*
     * Perform any actions post-purge such as clean-up
     * or notification of external systems
     * Other than logging or gathering statistics, Guidewire strongly recommends against any business critical task being performed
     * in this method.
     */
  }

  override function skipPolicyPeriodForPurge(purgeCandidate : PolicyPeriod) : boolean {
    /*
     * Return true if the purgeCandidate should not be purged.
     * Should the customer wish to retain specific policy periods in the database they
     * can configure this method to retain those periods. If the customer does not wish
     * to purge any policy periods, they should not run the BatchProcessType.TC_PURGE
     */
    return false;
  }

  override property get AllowedJobSubtypesForPruning() : List<typekey.JobIntSubtype> {
    /*
     * Returns a List of Job types which are allowed to be pruned.
     *
     * Note: It is not recommended that Audit jobs are allowed.
     * If you choose to allow Audit jobs, be aware that the final state
     * of an Audit job's PolicyPeriod is not promoted or bound and therefore the filtering
     * criteria for the Purge batch process will not work as expected.
     */
    return {
      JobIntSubtype.TC_SUBMISSION,
      JobIntSubtype.TC_POLICYCHANGE,
      JobIntSubtype.TC_RENEWAL
    }
  }

  override property get AllowedJobSubtypesForPurging() : List<typekey.JobIntSubtype> {
    /*
     * Returns a List of Job types which are allowed to be purged.
     *
     * Note: It is not recommended that Audit jobs are allowed.
     * If you choose to allow Audit jobs, be aware that the final state
     * of an Audit job's PolicyPeriod is not promoted or bound and therefore the filtering
     * criteria for the Purge batch process will not work as expected.
     */
    return {
      JobIntSubtype.TC_SUBMISSION,
      JobIntSubtype.TC_POLICYCHANGE
    }
  }

  override function calculateNextPurgeCheckDate(job : Job) : Date {
    /*
     * Calculate the NextPurgeCheckDate for this job.  This job will not be checked again until the NextPurgeCheckDate is past.
     */
    if (job.PurgeStatus == PurgeStatus.TC_NOACTIONREQUIRED) {
      return null
    }
    else if (job.PurgeStatus == PurgeStatus.TC_PRUNED) {
      var recheck = Date.CurrentDate.addDays(PCConfigParameters.PurgeJobsDefaultRecheckDays.Value)
      var purgeJobDate = getPurgeJobDate(job)
      return PCArchivingUtil.getLatestDate({purgeJobDate, recheck})
    }
    else {
      var pruneRecheck = Date.CurrentDate.addDays(PCConfigParameters.PruneVersionsDefaultRecheckDays.Value)
      var pruneLatest = PCArchivingUtil.getLatestDate({getPruneJobDate(job), pruneRecheck})

      var purgeRecheck = Date.CurrentDate.addDays(PCConfigParameters.PurgeJobsDefaultRecheckDays.Value)
      var purgeLatest = PCArchivingUtil.getLatestDate({getPurgeJobDate(job), purgeRecheck})

      return pruneLatest.compareTo(purgeLatest) < 0 ? pruneLatest : purgeLatest
    }
  }

  override function getPurgeJobDate(job : Job) : Date {
    /*
     * Determine the date on or after which the given <code>Job</code> should be purged.
     * If the current date is on or after the returned value, the job will be purged
     */
    var closedate = job.CloseDate == null ? null : job.CloseDate.addDays(PCConfigParameters.PurgeJobsRecentJobCompletionDays.Value)
    var periodend : Date
    if (PCConfigParameters.PurgeJobsPolicyTermDaysCheckDisabled.Value) {
      periodend = null
    } else {
      periodend = job.SelectedVersion.PeriodEnd == null ? null : job.SelectedVersion.PeriodEnd.addDays(PCConfigParameters.PurgeJobsPolicyTermDays.Value)
    }
    return PCArchivingUtil.getLatestDate({closedate, periodend})
  }

  override function getPruneJobDate(job : Job) : Date {
    /*
     * Determine the date on or after which the given <code>PolicyPeriod</code> should be purged.
     * If the current date is on or after the returned value, the unselected PolicyPeriods will be purged from the Job
     */
    var closedate = job.CloseDate == null ? null : job.CloseDate.addDays(PCConfigParameters.PruneVersionsRecentJobCompletionDays.Value)
    var periodend : Date
    if (PCConfigParameters.PruneVersionsPolicyTermDaysCheckDisabled.Value) {
      periodend = null
    } else {
      periodend = job.SelectedVersion.PeriodEnd == null ? null : job.SelectedVersion.PeriodEnd.addDays(PCConfigParameters.PruneVersionsPolicyTermDays.Value)
    }
    return PCArchivingUtil.getLatestDate({closedate, periodend})
  }

  /**
   * Returns true if the purging of archived PolicyPeriods is disabled.
   * For any routine deployment, this should return true (purge from archive is disabled).
   * At this time, Guidewire does not support purging from archive with this feature.
   * Purging from archive is completely untested and may result in unexpected data loss,
   *     performance issues, and/or data corruption.
   * This method has only been exposed to field configuration for use in the extraordinary
   *     case that all the implications of enabling it have been thoroughly examined
   *     by the field team and customer, all are aware of the risks, and accept those risks.
   *
   * @return true if the purging of Archived PolicyPeriods is disabled
   */
  override function disablePurgingArchivedPolicyPeriods() : boolean {
    return true;
  }

  /**
   * Extended PurgeContext. Modify to add customer-specific information
   * that will be passed from the pre-purge to the post-purge extension.
   */
  static class ExtendedContext extends PurgeContext {
    var _publicId : String as PurgedPublicID

    construct(ctx : PurgeContext) {
      super(ctx)
    }
  }
}