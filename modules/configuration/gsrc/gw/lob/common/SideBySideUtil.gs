package gw.lob.common

uses com.guidewire.pl.system.bundle.validation.EntityValidationException
uses com.guidewire.pl.web.controller.UserDisplayableException
uses gw.api.productmodel.CovTermPattern
uses gw.api.productmodel.PolicyLinePattern
uses gw.api.productmodel.ProductModelClass
uses gw.api.system.PCConfigParameters
uses gw.api.util.DisplayableException
uses gw.api.util.PCWebMessageUtil
uses gw.api.validation.ValidationIssue
uses gw.api.web.job.JobWizardHelper
uses gw.job.sxs. *
uses gw.job.uw.UWAuthorityBlocksProgressException
uses gw.lang.reflect.TypeSystem
uses gw.util.Pair
uses gw.validation.PCValidationContext
uses gw.web.productmodel.ProductModelSyncIssueSeverity
uses gw.web.productmodel.ProductModelSyncIssueWrapper
uses pcf.UWActivityPopup
uses pcf.api.Wizard

uses java.lang.Exception
uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException
uses java.util. *
uses gw.api.productmodel.ProductModelTypeHelper
uses gw.api.system.PCLoggerCategory

@Export
class SideBySideUtil {

  private static var _logger = PCLoggerCategory.SXS

  /**
   * Creates new versions of the {@link PolicyPeriod} that are linked to the side by side functionality.
   * After cloning off the period passed in, the side by side periods are passed to a
   * {@link SideBySideInitialConfig}.  NOTE: this method will not fail if the job is already
   * side by side, it will simply return without creating any additional periods.
   *
   * @param period Base period from which side by side periods are initially cloned.
   * @param numPeriods Number of side by side periods to create.
   * @param quoteAll If set to TRUE, all the periods will attempt to be quoted.  If set to FALSE, the periods
   *                 will be left in draft state.
   */
  static function maybeCreateSideBySidePeriods(period : PolicyPeriod, numPeriods : int, quoteAll : boolean) {
    var job = period.Job

    if (job.SideBySide) {
      // NOTE: "maybe" implies that we do not explicitly fail if the job is already SideBySide, we simply do not
      // create new side by side periods.
      return
    }

    if (not period.AvailableForSideBySideEdit) {
      throw new IllegalStateException("Policy period unavailable for Side by Side;  failed to create side by side periods.")
    }

    if ( (job.ActivePeriods.Count+numPeriods) >= PCConfigParameters.SubmissionMaxSideBySideQuotes.getValue()) {
      throw new IllegalStateException(displaykey.Web.Job.Warning.MaxSideBySideQuotes(job))
    }

    for (i in 0..|numPeriods) {
      var sideBySidePeriod = period.createDraftMultiVersionJobBranch()
      job.addToPeriods(sideBySidePeriod)
      sideBySidePeriod.JobProcessInternal.start()
    }
    job.SideBySide = true

    var targetPeriods = job.ActivePeriods
    if (targetPeriods.IsEmpty) {
      throw new IllegalStateException("Expected at least one active period available for configuration.")
    }

    var line = period.Lines.singleWhere(\ l -> l.SideBySideInitialConfig != null)
    line.SideBySideInitialConfig.configureInitialPolicies(targetPeriods)

    if (quoteAll) {
      // Don't attempt to quote if any of the periods have unhandled preemptions or oosconflicts
      if (!hasOOSorPreemption(job)) {
        var issues = SideBySideProcess.getQuotes(targetPeriods as java.util.Set<entity.PolicyPeriod>)
        period.Bundle.commit()
        displayExceptions(issues.where(\ i -> i.Second != null))
      } else {
        _logger.debug("Skip quoting as one or more periods have OOS conflicts or unhandled preemptions.")
      }
    }
  }

  /**
   * Adds an additional side by side period based on the period passed in.  Note that This method does commit
   * automatically persist the new period tot he database.
   *
   * @param Policy Period to which a clone is made and added to the set of associated side by side periods
   */
  public static function addNewSideBySidePeriod(period : PolicyPeriod) : PolicyPeriod {
    var job = period.Job
    if (job.hasMaxNumberOfSideBySideQuotes()) {
      throw new IllegalStateException(displaykey.Web.Job.Warning.MaxSideBySideQuotes(job))
    }

    if (job.SideBySide) {
      var newSideBySidePeriod = period.createDraftMultiVersionJobBranch()
      job.addToPeriods(newSideBySidePeriod)
      newSideBySidePeriod.JobProcessInternal.start()
      return newSideBySidePeriod
    } else {
      throw new IllegalStateException(displaykey.Web.Job.Warning.CannotAddToNonSideBySideJob)
    }
  }

  /**
   * Returns the array of side by side periods associated with period
   *
   * @param period PolicyPeriod from which associated policy periods are returned.
   * @return array of side by side policy periods sorted by branch number
   */
  static function getSideBySidePeriods(period : PolicyPeriod) : PolicyPeriod[] {
    if (null==period.Job) {
      throw new IllegalStateException("No job associated with period")
    }
    if (!period.Job.SideBySide) {
      throw new IllegalArgumentException("Period's job must be side by side.")
    }
    return period.Job.ActivePeriods
  }

  /**
   * Triggers base data copy between side by side periods using the passed in period as the
   * source and all other associated side by side periods as the destination(s).  A base data copy
   * is made for each slice date defined in sliceDates
   *
   * @param period Policy Period used as the source period to copy to its associated side by side periods
   * @param sliceDates Dates for which a base data copy slice call is made
   */
  static function executeSideBySideCopy(period : PolicyPeriod, sliceDates : Date[]) {
    if (!period.Job.SideBySide or
        period.UWLockedAndNoOverride) {
      return
    }

    var periods = period.Job.ActivePeriods
    var destinations = periods.where(\ p -> p != period)
    sliceDates
      .where(\sliceDate -> sliceDate.compareTo(period.EditEffectiveDate)>=0)
      .each(\sliceDate -> {
        SideBySideBaseDataCopy.copySlice(sliceDate,
                                         period,
                                         destinations,
                                         new SideBySideCopyConfig()
                                           .getMatchableTreeTraverserConfigForPeriod(period))
    })
    period.Bundle.commit()
  }

  /**
   * Creates a duplicate of the passed in period.  Assumes call is made in the context of a PCF page.  This method will
   * saveDraft before and after the sourcePeriod is duplicated.  It will also force refresh of the current wizard step.
   *
   * @param sourcePeriod Period to duplicate
   * @param wiz Wizard Used to force save before and after duplication of the source period
   * @param jobWizHelper JobWizardHelper called to revalidate the product model prior to duplicating the period.
   *
   **/
  static function duplicateVersion(sourcePeriod : PolicyPeriod, wiz : Wizard, jobWizHelper : JobWizardHelper) {
    wiz.saveDraft()
    if (jobWizHelper.revalidateModel()) {
      gw.lob.common.SideBySideUtil.addNewSideBySidePeriod(sourcePeriod)
      wiz.saveDraft()
      jobWizHelper.Wizard.refreshCurrentStep()
    }
  }

  /**
   * Pulls the errors and warnings from the validation context provided and adds the messages to the UI via
   * the job wizard helper.
   *
   * @param validationContext validation context containing the issues to be displayed
   * @param policyPeriod the policy period associated to the validation context passed in
   * @param jobWizHelper associated  job wizard helper
   */
  static function displayIssuesToResolve (validationContext : PCValidationContext, policyPeriod : PolicyPeriod, jobWizHelper : JobWizardHelper) {
    if (validationContext.Result != null) {
      if (validationContext.Result.hasErrors() or validationContext.Result.hasWarnings()) {
        policyPeriod.JobProcess.JobProcessValidator.LastResult = validationContext.Result
      }

      if (policyPeriod.FailedOOSEValidation) {
        var stepId = jobWizHelper.getInitialWizardStepId(policyPeriod)
        jobWizHelper.setPeriodToView(policyPeriod)
        jobWizHelper.goDirectlyToStep(stepId)
        var errorMessages(list : List<ProductModelSyncIssueWrapper>)
          = \ issues -> {
              issues.where(\i -> i.ShouldDisplayDuringQuote)
                    .each(\i -> jobWizHelper.addSyncIssueToWebMessages(i))
            }
        policyPeriod.JobProcess.JobProcessValidator.validateOOSESlicesForQuote(policyPeriod, errorMessages)
      } else {
        goToSpecificPeriod(validationContext, policyPeriod, jobWizHelper)
      }
      PCWebMessageUtil.addIssuesToTopLocation(validationContext.Result.Errors as List<ValidationIssue>)
      PCWebMessageUtil.addIssuesToTopLocation(validationContext.Result.Warnings as List<ValidationIssue>)
    }
  }

  /**
   * Goes from Side-by-Side to single policy submission wizard.  Determines whether to go to a wizard step
   * in the following order:
   * 1) If no errors/warnings, there's a UW issue and the quoteable page is available, go to ViewQuote page
   * 2) PolicyReview
   * 3) PolicyInfo
   * 4) First step in the wizard
   *
   * @param validationContext validation context is used to determine which step to go to
   * @param policyPeriod period to switch to
   * @param jobWizHelper associated job wizard helper
   */
  static function goToSpecificPeriod(validationContext : PCValidationContext, policyPeriod : PolicyPeriod, jobWizHelper : JobWizardHelper) {
    var hasUWIssues = (policyPeriod.UWIssuesActiveOnly == null or policyPeriod.UWIssuesActiveOnly.IsEmpty) ? false : true
    var hasWarningsOrErrors = ((validationContext.Result.Errors != null and not validationContext.Result.Errors.Empty) ||
                              (validationContext.Result.Warnings != null and not validationContext.Result.Warnings.Empty))

    var isBlocked = policyPeriod.UWIssuesActiveOnly.firstWhere(\ issue -> issue.IssueBlocksAtSomeSlice) != null

    if(not hasWarningsOrErrors and not isBlocked and policyPeriod.QuoteHidden and jobWizHelper.isStepVisitable("RiskAnalysis")){
       UWActivityPopup.push(policyPeriod, ActivityPattern.finder.getActivityPatternByCode("uw_review_approved"), "UWApproval")
       return
    }

    jobWizHelper.setPeriodToView(policyPeriod)
    if (not hasWarningsOrErrors and hasUWIssues and jobWizHelper.isStepVisitable("RiskAnalysis")) {
      jobWizHelper.goDirectlyToStep("RiskAnalysis")
    } else if (jobWizHelper.isStepVisitable("PolicyReview")) {
      jobWizHelper.goDirectlyToStep("PolicyReview")
    } else if (jobWizHelper.isStepVisitable("PolicyInfo")) {
      jobWizHelper.goDirectlyToStep("PolicyInfo")
    } else {
      var stepId = jobWizHelper.getInitialWizardStepId(policyPeriod)
      jobWizHelper.goDirectlyToStep(stepId)
    }
  }

  static function getDisplayValue(pLine : PolicyLinePattern, pattern : ProductModelClass) : String {
    var dkTypeName = "displaykey_Web_Job_SideBySide_" + ProductModelTypeHelper.getEntityType(pattern).RelativeName + "_" + pLine.Code
    var dkValue = getDisplayKeyValue(dkTypeName, pattern.Code)
    return dkValue == null ? pattern.DisplayName : dkValue
  }

  static function getDisplayKeyValue(root : String, suffix : String) : String {
    var dkType = TypeSystem.getByFullNameIfValid(root)
    if (dkType != null) {
      var prop = dkType.getTypeInfo().getProperty(suffix)
      if (prop != null) {
        var value = prop.getAccessor().getValue(null)
        // The above return value could either be a localized String or the display key node if the property name
        // display key has children, so we use toString() below to handle both cases properly.
        return value.toString()
      }
    }
    return null
  }

  static function validatePeriodForSideBySide(policyPeriod : PolicyPeriod, valLevel : ValidationLevel) : PCValidationContext {
    return policyPeriod.validatePeriod(valLevel)
  }

  /**
   * Return a warning message based on the state of the passed in period and validation context.
   * @param period Policy period whose state will be checked to see if appropriate warning
   *               messages need to be included in the return string.
   * @param validationContext Validation context associated with the period which will be
   *                          checked to see if warning messages need to be added to the
   *                          return string
   * @return Warning string built from warning messages associated with the state of the passed in
   *         period and validation context.
   *
   **/
   static function getPeriodWarningsMessage(period : PolicyPeriod, validationContext : PCValidationContext, sxsException : Exception ) : String {
    var result = {}

    if (period.Job.OOSJob and period.OOSConflicts.HasElements) {
      result.add(displaykey.Web.Job.SideBySide.Errors.UnhandledOOSConflict)
    }

    if (period.FailedOOSEValidation) {
      result.add(displaykey.Web.Job.SideBySide.Errors.FailedOOSEValidation)
    }

    if (period.hasAnyUnhandledPreemptions()) {
      result.add(displaykey.Web.Job.SideBySide.Errors.UnhandledPreemption)
    }

    // EntityValidationException and UWAuthorityBlocksProgressException exceptions can show up during
    // quote but will be taken care of by annunciator messages.  Add additional info only if it it's not
    // an UWAuthorityBlocksProgressException or EntityValidationException
    if ( (sxsException != null) and
          not(sxsException typeis UWAuthorityBlocksProgressException) and
          not(sxsException typeis EntityValidationException)) {
      if (sxsException typeis UserDisplayableException) {
        if (sxsException.LocalizedMessages.Count > 0) {
          sxsException.LocalizedMessages.each(\msg -> {
            result.add(msg)
          })
        } else {
          result.add(displaykey.Web.Job.SideBySide.Errors.UnexpectedException)
        }
      } else {
        var sxsExceptionStr = sxsException.getLocalizedMessage()
        if (sxsExceptionStr.length > 0) {
          result.add(sxsExceptionStr)
        } else {
          result.add(displaykey.Web.Job.SideBySide.Errors.UnexpectedException)
        }
      }
    }
    if (period.QuoteHidden) {
      result.add(displaykey.Web.Job.SideBySide.Errors.QuoteHidden)
    }
    var validation = validationContext.Result
    if (validation.Errors.Count > 0) {
      result.add(displaykey.Web.Job.SideBySide.Errors.ValidationErrors)
    }
    if (validation.Warnings.Count > 0) {
      result.add(displaykey.Web.Job.SideBySide.Errors.ValidationWarnings)
    }
    var blockingErrorText = calculateBlockingPointErrorText(period)
    if (blockingErrorText != null) {
      result.add(blockingErrorText)
    }
    return result.join("\n")
  }

  static function calculateBlockingPointErrorText(period : PolicyPeriod) : String {
    var earliestBP : UWIssueBlockingPoint
    var uwIssues = period.UWIssuesActiveOnly.viewableToUserWithProfiles(User.util.CurrentUser.UWAuthorityProfiles)
    uwIssues.where(\issue -> issue.CurrentBlockingPoint != null)
            .each(\ issue -> {
      if (earliestBP == null or issue.CurrentBlockingPoint.comesBefore(earliestBP)) {
        earliestBP = issue.CurrentBlockingPoint
      }
    })

    // OOB submission is the only job with a bind blocking point, we explicitly check for the job type
    // when determining the error message to display.
    if (earliestBP == null or earliestBP == UWIssueBlockingPoint.TC_NONBLOCKING) {
      // There are no UW issues with blocking points or all the UW issues are non-blocking.
      return null
    } else if (!earliestBP.comesAfter(UWIssueBlockingPoint.TC_BLOCKSQUOTE)) {
      return displaykey.Web.Job.SideBySide.Errors.UWIssuesBlockQuote
    } else if (!earliestBP.comesAfter(UWIssueBlockingPoint.TC_BLOCKSQUOTERELEASE)) {
      return displaykey.Web.Job.SideBySide.Errors.UWIssuesBlockQuote
    } else if (period.Job typeis Submission and !earliestBP.comesAfter(UWIssueBlockingPoint.TC_BLOCKSBIND)) {
      return displaykey.Web.Job.SideBySide.Errors.UWIssuesBlockBind
    } else if (!earliestBP.comesAfter(UWIssueBlockingPoint.TC_BLOCKSISSUANCE)) {
      return displaykey.Web.Job.SideBySide.Errors.UWIssuesBlockIssuance
    } else {
      return displaykey.Web.Job.SideBySide.Errors.UWIssuesBlockOther
    }
  }

  /**
   * Sets the SelectedVersion to the passed in period and causes the UI to
   * move to the newly selected peorid.  Also resets the job process validator's
   * LastResult.
   * @param period The passed in period becomes the eelected period.
   * @param jobWizHelper passed in to enable going to the newly selected period.
   */
  static function returnToSelectedPeriod(period : PolicyPeriod,
                                         jobWizHelper : JobWizardHelper) {
    period.Job.SelectedVersion = period
    period.JobProcess.JobProcessValidator.LastResult = null
    goToPeriod(period, jobWizHelper)
  }


  /**
   * Attempts to move the UI via the jobWizHelper to the PolicyReview step.
   * If the PolicyReview step is not visitable, moves to the jobWizHelper's
   * initial wizard step for the passed in period.
   * @param period The period to go to
   * @param jobWizHelper The job wizard helper in use by the UI at the time
   *                     the method is called
   */
  static function goToPeriod(period : PolicyPeriod, jobWizHelper : JobWizardHelper) {
    jobWizHelper.Wizard.changePolicyPeriod(period)
    if (jobWizHelper.isStepVisitable("PolicyReview")) {
      jobWizHelper.goToStep("PolicyReview")
    } else {
      var stepId = jobWizHelper.getInitialWizardStepId(period)
      jobWizHelper.goToStep(stepId)
    }
  }

  /**
   * Opens the passed in period for edit if quoted then syncs the
   * periods to the offering currently set on the period.
   * @param period The period to which we will open for edit if quoted
   *               and sync its offering.
   */
  static function editIfQuotedAndForceSync(period : PolicyPeriod) {
    period.editIfQuoted()
    period.forceSyncOffering()
  }

  /**
   * Goes through the passed in policy periods and for each period, sets the
   * associated job's validator's last result to the validation results stored in
   * the associated policy period info
   * @param policyPeriods Array of {@link entity.PolicyPeriod}
   * @param periodInfos Array of {@link gw.job.sxs.SideBySidePolicyPeriodInfo}, parallel to policyPeriods
   */
  static function setLastResultFromValidationContextAndGetQuotes(policyPeriods : PolicyPeriod[], periodInfos : SideBySidePolicyPeriodInfo[]) {
    if (null!=policyPeriods and policyPeriods.HasElements and (policyPeriods.Count == periodInfos.Count)) {
      policyPeriods.eachWithIndex(\ p, i -> {
        p.JobProcess.JobProcessValidator.LastResult = periodInfos[i].Validation.Result
      })
      // Reset exception prior to quoting
      periodInfos.each(\pi -> {pi.SxSException = null})
    }

    var quoteIssues = SideBySideProcess.getQuotes(policyPeriods as java.util.Set<entity.PolicyPeriod>)
    copyQuoteIssuesIntoPolicyPeriods(quoteIssues, policyPeriods as List<PolicyPeriod>)

    displayExceptions(quoteIssues.where(\issue->issue.Second != null))
  }

  /**
   * Copies any quote issues into the current thread's policy periods so they can be displayed in the UI.
   *
   * This is necessary because the policyPeriod objects from the quote threads aren't in sync with the current thread's policyPeriods.
   */
  private static function copyQuoteIssuesIntoPolicyPeriods(quoteIssues : List<Pair<PolicyPeriod, Exception>>, policyPeriods : List<PolicyPeriod>) {
    var quotePeriodsWithIssues = quoteIssues.map(\issue -> issue.First)
    quotePeriodsWithIssues.each(\ periodWithIssues -> {
      var policyPeriod = policyPeriods.singleWhere(\ policyPeriod -> policyPeriod.ID == periodWithIssues.ID)
      policyPeriod.JobProcess.JobProcessValidator = periodWithIssues.JobProcess.JobProcessValidator
    })
  }

  private static function displayExceptions(issues : List<Pair<PolicyPeriod,Exception>>) {
    var exceptionMsg = displaykey.Web.Job.SideBySide.Errors.QuoteException + "\n"
    var initSize = exceptionMsg.size
    issues.where(\i ->
        not(i.Second typeis UWAuthorityBlocksProgressException) and
        not(i.Second typeis EntityValidationException))
      .sort(\i1,i2 -> i1.First.BranchNumber < i2.First.BranchNumber)
      .each(\i -> {
        exceptionMsg += i.First.BranchName + ": " + i.Second.LocalizedMessage + "\n"
      })
    if (exceptionMsg.size > initSize) {
      throw new DisplayableException(exceptionMsg)
    }
  }

  private static function getVin (vehicle : PersonalVehicle) : String {
    if (null!=vehicle.Vin and vehicle.Vin.size > 0) {
      return vehicle.Vin
    } else {
      return ""
    }
  }

  /**
   * Builds the list of {@link gw.job.sxs.SideBySideCovTermInfo} objects used for rendering
   * the side-by-side screen.
   */
  public static function buildCovTermInfoList(coverageInfo : SideBySideCoverageInfo, covTermPatterns : List<CovTermPattern>, alwaysPostOnChangeCovTermPatterns: List<CovTermPattern>) : List<SideBySideCovTermInfo> {
    return covTermPatterns.map(\ covTermPattern -> new SideBySideCovTermInfo(
            coverageInfo,
            covTermPattern,
            alwaysPostOnChangeCovTermPatterns != null and alwaysPostOnChangeCovTermPatterns.contains(covTermPattern)))
  }

  /**
   * Builds a list of maps associating a SideBySidePolicyPeriodInfo to a vehicle.
   * This map is used when rendering vehicle section of the side-by-side screen.
   */
  public static function buildListOfVehicleMaps(periodInfos : SideBySidePolicyPeriodInfo[]) : List<Map<SideBySidePolicyPeriodInfo, PersonalVehicle>> {
    var rows : List<Map<SideBySidePolicyPeriodInfo, PersonalVehicle>> = {}

    var allUniqueVINs : Set<String> = {}
    periodInfos*.Period*.PersonalAutoLine*.Vehicles.each(\ vehicle -> {
        allUniqueVINs.add(getVin(vehicle))
    })

    var uniqueVinArray = allUniqueVINs.toTypedArray().sort()
    var vehicleMaps = periodInfos*.Period*.PersonalAutoLine.map(\ line -> line.Vehicles.partition(\ vehicle -> getVin(vehicle)))
    uniqueVinArray.each(\ vin -> {
      var vehicleBucketArray = vehicleMaps.map(\ vehicleMap -> vehicleMap.get(vin))
      var sortedBuckets = vehicleBucketArray.map(\ bucket -> bucket != null ? bucket.sortBy(\ vehicle -> vehicle.ID) : {} as List<PersonalVehicle>)
      var numVehicles = sortedBuckets.map(\ bucket -> bucket.Count).max()
      for (bucketIndex in 0..|numVehicles) {
        var row : Map<SideBySidePolicyPeriodInfo, PersonalVehicle> = {}
        periodInfos.eachWithIndex(\ periodInfo, columnIndex -> {
          var bucket = sortedBuckets[columnIndex]
          row.put(periodInfo, bucket.Count > bucketIndex ? bucket[bucketIndex] : null)
        })
        rows.add(row)
      }
    })
    return rows
  }

  /**
   * Checks the passed in job to see if there are OOS conflicts or unhandled preemptions.
   * @return Returns true if the passed in job has OOS conflicts or has unhandled preemptions.
   *         Otherwise, returns false
   */
  static function hasOOSorPreemption(job : Job) : boolean {
    if (job.OOSJob and job.ActivePeriods.hasMatch(\ p -> p.OOSConflicts.HasElements)) {
      // OOS Conflicts
      return true
    } else if (job.ActivePeriods.hasMatch(\p -> p.hasAnyUnhandledPreemptions())) {
      // Unhandled preemptions
      return true
    } else {
      return false
    }
  }

  /**
   * UI utility method to determine messages displayed in the side by side annunciator when
   * going to the full side by side page is blocked - i.e. If there are unhandled preemptions or
   * unresolved OOS conflicts.
   *
   * @param periods The array of periods to determine messages for
   * @return List List of blocking messages associated with the input parameter periods
   */
  static function getSideBySideBlockingMessages(periods : PolicyPeriod[]) : List<String> {
    var result = new ArrayList<String>()
    if (null == periods or periods.IsEmpty) {
      return result
    }

    if (periods.hasMatch(\ p -> p.hasAnyUnhandledPreemptions())) {
      result.add(displaykey.Web.Job.SideBySide.Errors.ResolveUnhandledPreemption)
    }

    var job = periods.first().Job
    if (null!=job and job.OOSJob and job.ActivePeriods.hasMatch(\ p -> p.OOSConflicts.HasElements)) {
      result.add(displaykey.Web.Job.SideBySide.Errors.ResolveUnhandledOOSConflicts)
    }
    return result
  }

  /**
   * This method will sync the coverages for all coverables associated with the period passed in through period info.
   * If any product model sync issues occur, the branch name along with the associated issue messages will be displayed
   * via the job wizard helper.
   *
   * @param periodInfo Side by side policy period info containing the period for which coverages will be synced for
   * @param jobWizHelper Job wizard helper to allow display of product model issues.  If null, no messages will be
   *        displayed but sync will still occur
   */
  static function syncCoveragesAndRefresh(periodInfo : SideBySidePolicyPeriodInfo, jobWizHelper : JobWizardHelper) {
    periodInfo.Period.editIfQuoted()

    if (jobWizHelper == null) {
      // If no job wizard helper, just sync coverages
      periodInfo.Period.AllCoverables.each(\c -> {
          c.syncCoverages()
      })
    } else {
      // If a job wizard is passed in, isses can be collected and validation messages displayed

      // Aggregate sync coverages issues more severe than INFO
      var issues : List<ProductModelSyncIssueWrapper> = {}
      periodInfo.Period.AllCoverables.each(\c -> {
          var currentIssues = (c.syncCoverages())
          if (currentIssues.HasElements) {
            // ProductModelSyncIssueSeverity is defined as ERROR, WARNING, INFO (higher severity is less than lower severity)
            // Do not include INFO level issue messages
            var issuesMoreSevereThanInfo =
              currentIssues.where(\ci -> ci.Severity < ProductModelSyncIssueSeverity.INFO)
            if (issuesMoreSevereThanInfo.HasElements) {
              issues.addAll(issuesMoreSevereThanInfo)
            }
          }
      })

      // Add branch name using highest level issue message found in set of issues
      var mostSevere = ProductModelSyncIssueSeverity.INFO
      issues.each(\issue -> {
        if (issue.Severity < mostSevere) {
          mostSevere = issue.Severity
        }
      })

      // If issues found, add a message indicating which branch it is applicable for along with message(s) associated with the validation issue(s)
      if (issues.HasElements) {
        jobWizHelper.addSyncIssueToWebMessages(mostSevere, displaykey.Web.Job.SideBySide.ValidationIssueMessageForBranch(periodInfo.Period.BranchName))
        issues.each(\issue -> jobWizHelper.addSyncIssueToWebMessages(issue))
      }
    } // END - if (jobWizHelper == null)...else...

    // Refresh the side by side screen
    periodInfo.refreshSideBySideStep()
  }

  /**
   * UI helper method to determine whether or not the resolve button should be shown.
   * @param periodInfo Contains the period and validation information need to determine
   * whether the resolve button should be shown
   * @return returns true if the resolve button should be shown, otherwise false.
   */
  static function shouldShowResolveButton(periodInfo : SideBySidePolicyPeriodInfo) : boolean {
    if (not periodInfo.SxSEditable) return false

    var period = periodInfo.Period
    var validation = periodInfo.Validation

    var isBlocked = period.UWIssuesActiveOnly.firstWhere(\ issue -> issue.IssueBlocksAtSomeSlice) != null
    var hasValidationIssues = ((validation.Result.Errors != null and not validation.Result.Errors.Empty) ||
                              (validation.Result.Warnings != null and not validation.Result.Warnings.Empty))

    return (isBlocked or hasValidationIssues or period.QuoteHidden)
  }

  /**
   * Helper method to withdraw the period associated with the passed in periodInfo
   * @param periodInfo Contains a reference to the period to be withdrawn.  If the
   *                   targeted period can not be withdrawn, a error message will
   *                   be shown via the passed in jobWizHelper
   * @param jobWizHelper JobWizardHelper associated with the side by side screen.  It
   *                     is used to display an error message if the withdraw fails.
   *                     It's also used to move the UI to the the policy review page
   *                     if the first active period associated with the withdrawn period's
   *                     job.
   */
  static function withdrawSelectedPeriod(periodInfo : SideBySidePolicyPeriodInfo, jobWizHelper : JobWizardHelper) {
    var period = periodInfo.Period
    var job = period.Job
    if (not period.JobProcess.canWithdraw().Okay ) {
      jobWizHelper.addErrorWebMessage(displaykey.Java.PolicyPeriod.WithdrawPeriodFailed(period.BranchName))
    } else {
      period.JobProcess.withdraw()
      period = jobWizHelper.setPeriodToView(job.ActivePeriods[0])
      if(job.ActivePeriods.Count == 1) {
        job.SideBySide = false
        if (jobWizHelper.isStepVisitable("PolicyReview")) {
          jobWizHelper.goToStep("PolicyReview")
        } else {
          var stepId = jobWizHelper.getInitialWizardStepId(period)
          jobWizHelper.goToStep(stepId)
        }
      }
    }
    periodInfo.refreshSideBySideStep()
  }

  /**
   * Attempts to make the passed in policyPeriod side-by-side.  If it is not able to,
   * this method will throw an appropriate DisplayableException.
   * @param policyPeriod Policy period against which going side-by-side will be attempted
   * @param job The job aassociated with policyPeriod
   * @param wizard Wizard associated with the UI at the time side-by-side is attempted.
   *               Used to gain access for controlling saving data (e.g. "saveDraft")
   * @param jobWizardHelper Used to control moving through the UI screens (e.g. the
   *                        side-by-side screen on a successful attempt to go side-by-side
   */
  static function attemptSideBySide(policyPeriod : PolicyPeriod, job : Job, wizard : pcf.api.Wizard, jobWizardHelper : JobWizardHelper) {
    if (job.ActivePeriods.hasMatch(\p -> p.hasAnyUnhandledPreemptions())) {
      throw new gw.api.util.DisplayableException(displaykey.Web.Job.SideBySide.Errors.ResolveUnhandledPreemption)
    } else if (job.OOSJob and job.ActivePeriods.hasMatch(\ p -> p.OOSConflicts.HasElements)) {
      throw new gw.api.util.DisplayableException(displaykey.Web.Job.SideBySide.Errors.ResolveUnhandledOOSConflicts)
    } else {
      attemptSideBySideWithoutPreemptions(policyPeriod, wizard, jobWizardHelper)
    }
  }

  /**
   * Attempts to make the passed in policyPeriod side-by-side.  This method assumes
   * the passed in period has no preemptions.
   * @param policyPeriod Policy period against which going side-by-side will be attempted
   * @param job The job aassociated with policyPeriod
   * @param wizard Wizard associated with the UI at the time side-by-side is attempted.
   *               Used to gain access for controlling saving data (e.g. "saveDraft")
   * @param jobWizardHelper Used to control moving through the UI screens (e.g. the
   *                        side-by-side screen on a successful attempt to go side-by-side
   */
  static function attemptSideBySideWithoutPreemptions(policyPeriod : PolicyPeriod, wizard : pcf.api.Wizard, jobWizardHelper : JobWizardHelper) {
    wizard.saveDraft()
    if (jobWizardHelper.revalidateModel()) {
      var initValidationCtxt =
        gw.lob.common.SideBySideUtil.validatePeriodForSideBySide(policyPeriod, policyPeriod.ValidationLevel)
      policyPeriod.JobProcess.JobProcessValidator.LastResult = initValidationCtxt.Result
      if (initValidationCtxt.Result.hasErrors()) {
        gw.api.util.PCWebMessageUtil.addIssuesToTopLocation(initValidationCtxt.Result.Errors as List<gw.api.validation.ValidationIssue>)
        return
      }

      // No errors, clear last result and messages
      gw.api.web.workspace.WorkspaceUtil.closeActiveWorksheet()
      policyPeriod.JobProcess.JobProcessValidator.LastResult = null
      wizard.saveDraft()

      gw.lob.common.SideBySideUtil.maybeCreateSideBySidePeriods(policyPeriod, 2, true)
      jobWizardHelper.goToStep("SideBySide")
    }
  }

  /**
   * Base checks to see if side-by-side can be attempted on the passed in policyPeriod
   */
  static function canAttemptSideBySide(policyPeriod : PolicyPeriod, job : Job) : boolean {
    return canAttemptSideBySide(policyPeriod, job, null)
  }

  /**
   * Base checks to see if side-by-side can be attempted on the passed in policyPeriod
   */
  static function canAttemptSideBySide(policyPeriod : PolicyPeriod, job : Job, additionalStatus : PolicyPeriodStatus) : boolean {
    if (job == null) {
      return false
    }

    if (not policyPeriod.AvailableForSideBySideEdit) {
      return false
    }

    if (not policyPeriod.Lines.allMatch(\ p -> p.SideBySideEnabled)) {
      return false
    }

    var status = policyPeriod.Status
    return !job.SideBySide and !job.hasMultiplePeriods() and
      (status == "Draft" or status == "Quoting" or status == "Quoted" or (additionalStatus == null ? false : status == additionalStatus))
  }

  /**
   * UI helper method used to retrieve a version label depending on the side-by-side
   * related state of the passed in policyPeriod.
   */
  static function getVersionLabel(policyPeriod : PolicyPeriod, job : Job) : String {
    if (policyPeriod.Job.hasMultiplePeriods()){
     if (job.SideBySide) {
       return displaykey.Web.Job.SideBySide.AddSideBySide
     } else {
       return  displaykey.Web.MultiQuoteWizardToolbar.AddNewVersion
     }
    } else {
      return displaykey.Web.MultiQuoteWizardToolbar.NewVersion
    }
  }

}
