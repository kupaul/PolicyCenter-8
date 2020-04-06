package gw.job

uses gw.api.diff.DiffItem
uses gw.api.job.JobProcessLogger
uses gw.api.util.DisplayableException
uses gw.api.web.job.JobWizardHelper
uses gw.forms.FormInferenceEngine
uses gw.plugin.Plugins
uses gw.plugin.policyperiod.IRatingPlugin
uses gw.job.uw.UWAuthorityBlocksProgressException
uses gw.job.uw.UWIssueAutomaticApprovabilityAnalyzer
uses gw.web.productmodel.ProductModelSyncIssueWrapper
uses entity.windowed.BuildingVersionList
uses java.lang.Exception
uses gw.api.domain.financials.PCFinancialsLogger
uses gw.api.rating.RatingException
uses com.guidewire.pl.system.bundle.validation.BundleValidationOption
uses gw.api.profiler.PCProfilerTag
uses gw.api.diff.DiffProperty

/**
 * Encapsulates the actions taken when Quoting.  While this class is not a JobProcess, it encapsulates
 * functionality that the JobProcess subclasses share.  The JobProcess classes involve complex
 * logic that is extremely sensitive to modification.  To implement changes to out-of-the-box logic,
 * one approach is to subclass this class and override methods as needed.  This preserves the original
 * logic for reference.  This class is exported as of 4.0.2, so another approach is to
 * modify it directly.  In either case, proceed with caution.  Seemingly small changes can break the
 * jobs.
 *
 * @see JobProcess especially if you want to use an alternative QuoteProcess class
 */
@Export
class QuoteProcess {

  protected var _branch : PolicyPeriod
  protected var _callingJob : JobProcess
  var _validator : JobProcessValidator
  var _evaluator : JobProcessUWIssueEvaluator
  var _automatedProcess : boolean
  var _recalculateDepositAfterValidQuote : boolean
  var _oosSlices : entity.PolicyPeriod[]
  var _oosSliceDates : java.util.Date[]

  private var _transactions(t : Transaction) : Boolean as TransactionsToInclude
      = \ t -> t.Written

  construct(jobProcess : JobProcess) {
    _branch = jobProcess._branch
    _validator = jobProcess.JobProcessValidator
    _evaluator= jobProcess.JobProcessEvaluator
    _automatedProcess  = jobProcess.AutomatedProcess

    _recalculateDepositAfterValidQuote = jobProcess.RecalculateDepositOnReportingAfterValidQuote
  }

  /**
   * requestQuote
   *
   * Attempts to quote, which leave the branch in one of four possible statuses: quoting, review, draft or declined.
   * This is the equivalent of "Quote or Review."
   *
   * @param jobWizardHelper if not null, is what's used to add UI messages to.  If null, no messages are added.
   * @valLevel Validation level used for validation before quoting
   * @ratingStyle metadata passed on for use by the rating engine
   * @param warningsThrowException Do warnings throw validation exceptions
   */
  function requestQuote(jobWizardHelper : JobWizardHelper, valLevel : ValidationLevel, ratingStyle : RatingStyle, warningsThrowException : boolean) {
    JobProcessLogger.logInfo("Quote requested for branch " + _branch + "(Rating style: " + ratingStyle + ")")

    PCProfilerTag.QUOTE_SYNC.execute(\ -> {
      _oosSliceDates = _branch.OOSSliceDates
      _oosSlices = _branch.getOOSSlices(_oosSliceDates)

      var locs = _branch.VersionList.PolicyLocations
      locs.allVersions<PolicyLocation>(false) // warm up the bundle and global cache
      locs.arrays<BuildingVersionList>("Buildings").allVersions<Building>(false) // warm up the bundle and global cache

      if (!_branch.Job.SideBySide) {
        _branch.removeUnusedLocations()
      }
      _branch.removeUnusedBuildings()
      _branch.removeUnusedAnswers()
      _branch.syncComputedValues()
    })

    var errorMessages(list : List<ProductModelSyncIssueWrapper>)
        = \ issues -> addSyncIssueWebMessages(issues, jobWizardHelper)

    // First validate period at EditEffectiveDate
    PCProfilerTag.QUOTE_VALIDATE.execute(\ -> _validator.validatePrimarySliceForQuote(_branch, valLevel, errorMessages, warningsThrowException))

    PCProfilerTag.QUOTE_MERGE.execute(\ -> {
      if (_branch.Job.OOSJob) {
        mergeDuplicateAdds(jobWizardHelper)
        if (_branch.OOSConflicts.Count > 0) {
          throw new DisplayableException(displaykey.Web.Job.Conflict.Unresolved)
        }
        _branch.removeOrphanedEffDatedDateRanges()
        _branch.mergeOOSChanges(copyDiffPropertiesFromFutureSlices().toTypedArray())
        _branch.checkForDuplicatesInSlices(_oosSlices)
        _validator.validateOOSESlicesForQuote(_branch, errorMessages)
      } else {
        _branch.checkForDuplicatesInSlices(_oosSlices)  // An in-sequence job may have been out-of-sequence at one point so we still need to remove duplicates
        if (_branch.Job typeis Rewrite or _branch.Job typeis RewriteNewAccount) {
          mergeDuplicateAdds(jobWizardHelper)
        }
      }
    })

    // Run segmentation rules before checking UW Issues, so if the existing UW is not valid for segment,
    //      then the UW issuse will block the quote.
    PCProfilerTag.QUOTE_SEGMENTATION.execute(\ -> _branch.runSegmentationRules())

    PCProfilerTag.QUOTE_CHECK_UW_ISSUES.execute(\ -> _evaluator.evaluateAndCheckForBlockingUWIssuesInSlices(_branch, TC_BLOCKSQUOTE, _oosSlices))

    _branch.QuoteHidden = true  //precautionary ... actual calculation is done in handleQuoteResponse
    PCProfilerTag.QUOTE_PREPARE_ACCOUNT_SYNCABLES.execute(\ -> _branch.AllAccountSyncables.each(\ a -> a.prepareForQuote()))

    PCProfilerTag.QUOTE_REMOVE_WORKSHEETS.execute(\ -> _branch.clearAllWorksheets())

    try{
      _branch.startQuoting()
      if (jobWizardHelper != null) { //null check to account for invocations thru batch process
        jobWizardHelper.Wizard.EditController.commitChanges(BundleValidationOption.VALIDATE_ERRORS_AND_WARNINGS)
        jobWizardHelper.Wizard.startEditing()
      }
      PCProfilerTag.QUOTE_RATE_PERIOD.execute(\ -> Plugins.get(IRatingPlugin).ratePeriod(_branch, ratingStyle))
      PCProfilerTag.QUOTE_CALC_TRANSACTIONS.execute(\ -> _branch.calculateTransactions())

      PCProfilerTag.QUOTE_INFER_FORMS.execute(\ -> FormInferenceEngine.Instance.inferPostQuoteFormsInSlices(_branch, _oosSliceDates))
      
      _branch.Status = TC_QUOTED
      PCProfilerTag.QUOTE_DENORM_FINANCIALS.execute(\ -> denormalizeFinancialTotals())
    } catch (re : RatingException) {
      throw new DisplayableException(re.Message, re)
    } catch (e : Exception) {
      PCFinancialsLogger.logError( "Exception occurred during rating...", e )
      _branch.markInvalidQuote()
    } finally {
      try {
        _branch.finishQuoting()
      } catch (ex : Exception) {
        PCFinancialsLogger.logError( "Exception occurred during Quote commit...", ex )
        if (jobWizardHelper != null) {
          jobWizardHelper.Wizard.cancel() // rollback
        }
        _branch.markInvalidQuote()
        _branch.finishQuoting()
      }
    }
    PCProfilerTag.QUOTE_HANDLE_RESPONSE.execute(\ -> handleQuoteResponse())
  }

  /**
   * When an OOS Job is quoted, OOS Changes are pushed forward to future slices if applicable.
   * If the quote is then edited, the OOS Changes that were pushed forward may be invalidated
   * by a subsequent quote. This function checks for all DiffProperties that appear in future
   * slices and not in the slice containing the PolicyPeriod's EditEffectiveDate - these
   * DiffProperties correspond to an invalidated OOS Change. If such diffs exist, then duplicate
   * the DiffProperty in the current slice. This guarantees that changes made to the current
   * slice of the bean are pushed forward to future slices, rolling back invalid OOS Changes.
   *
   * Eg.
   * Issue a PersonalAuto Policy with a blue car at time (a). At a later point in time (b), issue
   * a PolicyChange and alter some other property on the car to create a new slice of the bean.
   * At some point in time between (a) and (b), quote another PolicyChange, altering the color
   * of the car to red. This OOS Change gets merged forwards to the slice starting at time (b),
   * the sliced representation of the bean in the DB is as follows:
   *
   * (a)            (c)           (b)
   *  |=====blue=====|=====red=====|=====red=====|
   *
   * Now, edit the PolicyChange at time (c) and change the color back to blue. Because the color
   * of the car is represented as an updated bean in the current bundle, a DiffProperty will be
   * created only if the updated color (blue) is different from that bean's basedOn's color
   * (also blue). Consequently, no DiffProperty is created. However, there is a DiffProperty for the
   * slice from (b) to PeriodEnd as that slice of the bean is red whereas the basedOn is blue. As
   * quoting only pushes forward OOS Changes, each of which require a DiffProperty, the change back
   * to blue will not be represented in the slice starting at (b). Here is the sliced representation
   * of the bean in the DB:
   *
   * (a)            (c)            (b)
   *  |=====blue=====|=====blue=====|=====red=====|
   *
   * This is not desired behavior, this function creates the missing DiffProperty for slice (c) to (b)
   * such that the OOS Change back to blue is pushed forward to future slices. With this DiffProperty,
   * quoting the change will instead cause the sliced representation of the bean in the DB to be:
   *
   * (a)            (c)            (b)
   *  |=====blue=====|=====blue=====|=====blue=====|
   *
   */
  private function copyDiffPropertiesFromFutureSlices() : List<DiffItem> {
    var newDiffProperties : List<DiffItem> = {}
    var effDatedDiffProperties = _branch.getDiffItems(DiffReason.TC_POLICYREVIEW).whereTypeIs(DiffProperty)
    var partitionedEffDatedProperties = effDatedDiffProperties.where( \ diffProperty -> diffProperty.EffDated).partition( \ diffProperty -> diffProperty.EffDatedBean.FixedId)
    partitionedEffDatedProperties.eachKey( \ fixedID -> {
      var diffPropertiesWithSameFixedID = partitionedEffDatedProperties.get(fixedID)
      diffPropertiesWithSameFixedID
        .where( \ diffProperty -> {
          return diffPropertyInFutureSlice(diffProperty) and not diffPropertyExistsOnEditEffectiveDate(diffProperty, diffPropertiesWithSameFixedID)
        })
        .each( \ futureDiffProperty -> {
          var editEffectiveDateDiffProperty = createDiffPropertyOnEditEffectiveDate(futureDiffProperty)
          if (editEffectiveDateDiffProperty != null) {
            newDiffProperties.add(editEffectiveDateDiffProperty)
          }
        })
    })
    return newDiffProperties
  }

  private function diffPropertyInFutureSlice(diffProperty : DiffProperty) : boolean {
    return _branch.EditEffectiveDate.before(diffProperty.EffDatedBean.EffectiveDate)
  }

  /**
   * Given a DiffProperty, check that another DiffProperty with matching PropertyInfo exists
   * for the slice of the bean that is on the PolicyPeriod's EditEffectiveDate.
   */
  private function diffPropertyExistsOnEditEffectiveDate(futureDiffProperty : DiffProperty, diffPropertiesForSameBean : List<DiffProperty>) : boolean {
    return diffPropertiesForSameBean.hasMatch( \ diffPropertyOnEditEffectiveDate -> {
      return (diffPropertyOnEditEffectiveDate != futureDiffProperty)
          and (diffPropertyOnEditEffectiveDate.EffDatedBean.EffectiveDate == _branch.EditEffectiveDate)
          and (diffPropertyOnEditEffectiveDate.PropertyInfo == futureDiffProperty.PropertyInfo)
    })
  }

  /**
   * This function checks if the bean is newly sliced in this PolicyPeriod. If so, then create
   * a DiffProperty for it.
   */
  private function createDiffPropertyOnEditEffectiveDate(diffProperty : DiffProperty) : DiffProperty {
    var newDiffProperty : DiffProperty = null
    var effDatedBean = diffProperty.EffDatedBean.VersionList?.getVersionAsOf(_branch.EditEffectiveDate)?.getSliceUntyped(_branch.EditEffectiveDate) as EffDated
    var isNewlySlicedBean = effDatedBean?.EffectiveDate == _branch.EditEffectiveDate and effDatedBean.BasedOnUntyped?.EffectiveDate != effDatedBean.EffectiveDate
    if (isNewlySlicedBean) {
      newDiffProperty = new DiffProperty(effDatedBean, diffProperty.PropertyInfo)
      newDiffProperty.ShouldOverride = true
    }
    return newDiffProperty
  }

  /**
   * After quoting, should we edit-lock a branch not currently under edit lock?
   *
   * <p>Overridable by subclasses, but default behavior is to lock
   * PolicyPeriods quoted by underwriters.
   */
  protected function putBranchUnderEditLockAfterQuoting() : boolean {
    return perm.System.editlockoverride and not _automatedProcess
  }

  /**
   * For a user without perm.System.editlockoverride,
   * release quote hidden if all issues blocking quote
   * release have been approved, or are auto-approvable
   * by current user.
   */
  function attemptQuoteReleaseForNonprivilegedUser() {
    if (_branch.EditLocked) {
      return
    }
    var grants = User.util.CurrentUser.UserAuthorityProfiles*.UWAuthorityProfile*.Grants
    var analyzer = new UWIssueAutomaticApprovabilityAnalyzer(
        _branch.UWIssuesActiveOnly.whereBlocking(TC_BLOCKSQUOTERELEASE),
        grants, TC_BLOCKSQUOTERELEASE)
    if (analyzer.RequireManualAttention.IsEmpty) {
      try {
        evaluatePreQuoteReleaseUWIssues(false)
      } catch (e : UWAuthorityBlocksProgressException) {
        /*
         * it's okay to catch this:
         *   1. It's unlikely to occur unless someone else is editing the policy at the same time
         *   2. We were silently trying to release the quote. If the exception is thrown, it will just stay the same
         */
        JobProcessLogger.logDebug("Swallowing UWAuthorityBlocksProgressException",e)
      }
    }
  }

  private function mergeDuplicateAdds(jobWizardHelper : JobWizardHelper) {
    var beansRemoved = _branch.mergeDuplicateAdds() // do this first, because it can generate OOS conflicts
    if (jobWizardHelper != null and beansRemoved) {
      // removed beans can confuse ListView, and even
      // result in corrupted data in the bundle.  Refresh before proceeding.
      jobWizardHelper.Wizard.refreshCurrentStep()
    }
  }

  /**
   * Run UW issue eval rules; raise exception if unapproved issues remain.
   * If UWAuthorityBlocksProgressException is raised, quote may also be hidden.
   */
  private function evaluatePreQuoteReleaseUWIssues() {
    var editLocked = _branch.EditLocked                    //branch is already under edit lockw
                  or putBranchUnderEditLockAfterQuoting()  //branch should be put under edit lock
    evaluatePreQuoteReleaseUWIssues(editLocked)
  }

  private function evaluatePreQuoteReleaseUWIssues(editLocked : boolean) {
    var quoteHidden = editLocked
    try {
      _evaluator.evaluateAndCheckForBlockingUWIssues(_branch, TC_BLOCKSQUOTERELEASE)
    } catch (e : UWAuthorityBlocksProgressException) {
      //oops. For sure, we need to leave the quote hidden
      quoteHidden = true
      throw e
    } finally {
      _branch.EditLocked = editLocked
      _branch.QuoteHidden = quoteHidden
    }
  }

  private function handleQuoteResponse() {
    if (_branch.ValidQuote) {
      handleValidQuote()
    } else {
      handleInvalidQuote()
    }
  }

  private function handleValidQuote() {
    new JobConditions(_branch, "handle valid quote").checkNotPromoted().assertOkay()
    JobProcessLogger.logInfo("Quote for branch " + _branch + " is valid.")
    try {
      _branch.JobProcess.setPaymentInfoWithNewQuote()
    } catch (e : Exception) {
      // set payment plans fail should not prevent quote
      JobProcessLogger.logError(displaykey.Web.BillingAdjustmentsDV.Error.SetInstallmentsPlansDownPaymentInstmntTotal(e.Message), e)
    }
    handleReinsurance()
    PCProfilerTag.QUOTE_CHECK_UW_ISSUES.execute(\ -> evaluatePreQuoteReleaseUWIssues())
  }

  /**
   * Deals with the results of generating a quote.
   */
  private function handleInvalidQuote() {
    new JobConditions(_branch, "handle invalid quote").checkNotPromoted().assertOkay()
    JobProcessLogger.logInfo("Quote for branch " + _branch + " is not valid.")
    _branch.edit()
    _branch.QuoteHidden = false

    // update denormalized fields
    _branch.TotalCostRPT = null
    _branch.TotalPremiumRPT = null
    _branch.TransactionCostRPT = null
    _branch.TransactionPremiumRPT = null
  }

  private function denormalizeFinancialTotals() {
    _branch.TotalCostRPT = _branch.AllCosts.AmountSum(_branch.PreferredSettlementCurrency)
    _branch.TotalPremiumRPT = _branch.AllCosts.Premiums.AmountSum(_branch.PreferredSettlementCurrency)
    var writtenTransactions = _branch.AllTransactions.where(TransactionsToInclude)
    _branch.TransactionCostRPT = writtenTransactions.AmountSum(_branch.PreferredSettlementCurrency)
    _branch.TransactionPremiumRPT = writtenTransactions.toSet().Premiums.AmountSum(_branch.PreferredSettlementCurrency)
  }

  private function addSyncIssueWebMessages(issues : List<ProductModelSyncIssueWrapper>, jobWizardHelper : JobWizardHelper) {
    if (jobWizardHelper != null) {
      for (i in issues) {
        if (i.ShouldDisplayDuringQuote) {
          jobWizardHelper.addSyncIssueToWebMessages(i)
        }
      }
    }
  }

  private function handleReinsurance() {
    _branch.ValidReinsurance = true // if we find a problem, we will change this below.
    // if creating reinsurables fails, we still want to keep the quote
    try{
      _branch.createReinsurables()
    }catch(e : Exception){
      JobProcessLogger.logError(displaykey.Web.Reinsurance.Error.InvalidReinsurance(e.Message), e)
      _branch.ValidReinsurance = false
      throw new DisplayableException(displaykey.Web.Reinsurance.Error.InvalidReinsurance(e.Message))
    }

    try{
      _branch.createRIRisks()
    } catch(e : Exception){
      JobProcessLogger.logError(displaykey.Web.Reinsurance.Error.InvalidRIRisk(e.Message))
      _branch.ValidReinsurance = false
      throw new DisplayableException(displaykey.Web.Reinsurance.Error.InvalidRIRisk(e.Message))
    }
  }
}
