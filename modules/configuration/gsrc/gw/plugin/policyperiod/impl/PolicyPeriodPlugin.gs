package gw.plugin.policyperiod.impl

uses gw.api.domain.DenormalizedFKOutOfDomainGraph
uses gw.api.domain.RefersOutOfDomainGraph
uses gw.api.domain.account.AccountSyncable
uses gw.api.match.MatchableTreeTraverserUtils
uses gw.entity.IEntityType
uses gw.job.audit.AuditDateCalculator
uses gw.plugin.policyperiod.IPolicyPeriodPlugin
uses java.util.ArrayList
uses java.util.Date
uses java.util.Set
uses gw.api.productmodel.SeriesAuditSchedulePattern

/**
 * WARNING: this plugin should not contain business line specific logic or some tests may fail
 */
@Export
class PolicyPeriodPlugin implements IPolicyPeriodPlugin {

  override function postApplyChangesFromBranch(policyPeriod: PolicyPeriod, sourcePeriod: PolicyPeriod) {
    for (line in policyPeriod.Lines) {
      line.postApplyChangesFromBranch(sourcePeriod)
    }
    // if a line is added/removed from a multi line product, need to update TerritoryCodes on Locations
    if (policyPeriod.MultiLine) {
      policyPeriod.updateTerritoryCodes()
    }
  }

  override function returnTypesToNotCopyOnNewPeriod(): Set <IEntityType> {
    return { RatingPeriodStartDate, Form, FormEdgeTable, FormAssociation, WorksheetContainer, WorksheetData }
  }

  override function returnTypesToNotCopyOnNewBranch(): Set <IEntityType> {
    // all entities which implement these delegates will be included in the result
    var delegateTypes : Set<IEntityType> = { entity.Transaction }

    // add non-delegate types to be included in the result
    var otherTypes : Set<IEntityType>= { WorksheetContainer, WorksheetData }

    // We get LOB-specific delegate implementations reflectively from MatchableTreeTraverserUtils, because we do
    // not want to require LOB creators to edit central registries.  (It makes installable LOB content much harder to create.)
    //
    // The performance of getting these via reflection should not be a problem, because MatchableTreeTraverserUtils maintains a cache.
    var delegateImpls = MatchableTreeTraverserUtils.getSubAndImplementingTypes(delegateTypes) as Set <IEntityType>
    return delegateImpls.union(otherTypes)
  }

  override function canDateSliceOnPropertyChange(bean: KeyableBean): boolean {
    if (bean typeis EffDated) {
      var period = bean.BranchUntyped as PolicyPeriod
      for (line in period.Lines) {
        if (not line.canDateSliceOnPropertyChange(bean)) {
          return false
        }
      }
    }
    return true
  }

  override function returnTypesToNotDateSliceOnApplyDiff(period: PolicyPeriod): Set <IEntityType> {
    var allTypes: Set <IEntityType> = {RatingPeriodStartDate}
    for (line in period.Lines) {
      allTypes = allTypes.union(line.TypesToNotDateSliceOnApplyDiff)
    }
    return allTypes
  }

  override function postSetPeriodWindow(policyPeriod: PolicyPeriod, oldEffDate: Date, oldExpDate: Date) {
    for (line in policyPeriod.Lines) {
      line.postSetPeriodWindow(oldEffDate, oldExpDate)
    }
    policyPeriod.expirePastDateApprovals()
  }

  override function initializeCurrencies(policyPeriod: PolicyPeriod) {
    policyPeriod.PreferredCoverageCurrency = policyPeriod.Policy.Account.PreferredCoverageCurrency
    policyPeriod.PreferredSettlementCurrency = policyPeriod.Policy.Account.PreferredSettlementCurrency
  }

  override function postCreateDraftBranchInNewPeriod(policyPeriod: PolicyPeriod) {
    var draft = policyPeriod
    draft.AllAccountSyncables.each(\a -> a.prepareForJobEdit())
    for (line in draft.Lines) {
      line.postCreateDraftBranchInNewPeriod()
    }
    draft.clearDenormalizedReferenceDates()
    draft.WorksheetContainer = null
    draft.RateAsOfDate = null //reset the Rate as of Date, this should not be carried over from a past Period
    draft.removePeriodAnswersToQuestionSetsOfType(QuestionSetType.TC_PREQUAL) //remove pre-qual question's answers
    draft.mergeDuplicatePolicyContactRoles()
    draft.FailedOOSEEvaluation = false
    draft.FailedOOSEValidation = false
  }

  override function postCopyBranchIntoNewPolicy(policyPeriod: PolicyPeriod): void {
    var draft = policyPeriod
    draft.AllAccountSyncables.each(\a -> a.prepareForJobEdit())
    draft.cloneAutoNumberSequences()
    draft.resetAutoNumberSequences()
    draft.UWIssuesIncludingSoftDeleted.each(\issue -> issue.remove())
    draft.FailedOOSEEvaluation = false
    draft.FailedOOSEValidation = false
    draft.AllCosts.each(\cost -> cost.removeFromTerm())
    for (line in draft.Lines) {
      line.postCopyBranchIntoNewPolicy()
    }
    draft.mergeDuplicatePolicyContactRoles()
    // make sure our policy locations have proper territory codes set
    draft.updateTerritoryCodes();
    draft.WorksheetContainer = null
    draft.QuoteHidden = false
    draft.EditLocked = false
    draft.PolicyNumber = null
    draft.RateAsOfDate = null
    //reset the Rate as of Date, this should not be carried over from a past Period
    draft.TermNumber = null
    draft.PolicyTerm.PreRenewalDirection = null
    // reset individual columns and denormalized field totals
    draft.AllocationOfRemainder = null
    draft.BillImmediatelyPercentage = null
    draft.DepositAmount = null
    draft.DepositCollected = null
    draft.DepositOverridePct = null
    draft.OverrideBillingAllocation = null
    draft.RefundCalcMethod = null
    draft.TotalCostRPT = null
    draft.TotalPremiumRPT = null
    draft.TransactionCostRPT = null
    draft.TransactionPremiumRPT = null
    draft.WaiveDepositChange = null
    // reset reinsurance values
    draft.AllReinsurables.each(\r -> r.VersionList.AllVersions.each(\s -> {
      s.RiskNumber = null
    }))
    //force recalculation of reference dates
    draft.Lines.each(\line -> line.clearDenormalizedReferenceDates())
    draft.Policy.MovedPolicySourceAccount = null
    draft.Policy.clearPolicyLinksForRewriteNewAccount()
    draft.setDoNotPurge(false, \-> "")
  }

  override function prePromote(policyPeriod: PolicyPeriod) {
    var draft = policyPeriod
    draft.denormalizeReferenceDates()
    for (issue in draft.UWIssuesIncludingSoftDeleted.where(\i -> i.HasApprovalOrRejection)) {
      issue.Approval.EditBeforeBind = true
    }
  }

  override function postCreateNewBranchForPreemption(preemption: PolicyPeriod, preempted: PolicyPeriod) {
    preemption.AllAccountSyncables.each(\a -> a.prepareForJobEdit())
    preemption.mergeDuplicatePolicyContactRoles()
    preemption.WorksheetContainer= null
    copyNonEffDatedFieldsForPreemption( preemption, preempted )
  }

  override function postCreateInitialBranch(period: PolicyPeriod)
  {
    period.PolicyNumber = null
  }

  /**
   * Copies over non-EffDated fields from the preempted branch to the preemption branch
   * @param preemption The newly created preemption branch
   * @param preemted The preempted branch
   */
  private function copyNonEffDatedFieldsForPreemption(preemption: PolicyPeriod, preempted: PolicyPeriod) {
    // We have to clone the preempting payment plan onto the preemption period for now but we will
    // refactor it to make payment plans part of the effdated graph
    var copiedPaymentPlan = cloneAndSetPaymentPlanOnPeriod(preemption, preemption.BasedOn.SelectedPaymentPlan)

    if (preempted.BaseState != preempted.BasedOn.BaseState){
      preemption.BaseState = preempted.BaseState
    }
    if (preempted.BillImmediatelyPercentage != preempted.BasedOn.BillImmediatelyPercentage){
      preemption.BillImmediatelyPercentage = preempted.BillImmediatelyPercentage
    }
    if (preempted.BillingMethod != preempted.BasedOn.BillingMethod){
      preemption.BillingMethod = preempted.BillingMethod
    }
    if (preempted.DepositAmount != preempted.BasedOn.DepositAmount){
      preemption.DepositAmount = preempted.DepositAmount
    }
    if (preempted.DepositCollected != preempted.BasedOn.DepositCollected){
      preemption.DepositCollected = preempted.DepositCollected
    }
    if (preempted.DepositOverridePct != preempted.BasedOn.DepositOverridePct){
      preemption.DepositOverridePct = preempted.DepositOverridePct
    }
    if (preempted.InvoiceStreamCode != preempted.BasedOn.InvoiceStreamCode){
      preemption.InvoiceStreamCode = preempted.InvoiceStreamCode
    }
    if (preempted.NewInvoiceStream != preempted.BasedOn.NewInvoiceStream){
      preemption.NewInvoiceStream = preempted.NewInvoiceStream
    }
    if (preempted.Offering != preempted.BasedOn.Offering){
      preemption.Offering = preempted.Offering
    }
    if (preempted.OverrideBillingAllocation != preempted.BasedOn.OverrideBillingAllocation){
      preemption.OverrideBillingAllocation = preempted.OverrideBillingAllocation
    }
    if (preempted.SelectedPaymentPlan.BillingId != preempted.BasedOn.SelectedPaymentPlan.BillingId) {
      if(preempted.SelectedPaymentPlan != null) {
        cloneAndSetPaymentPlanOnPeriod(preemption, preempted.SelectedPaymentPlan)
        if (copiedPaymentPlan != null) {
          copiedPaymentPlan.remove()
        }
      }
    }
    if (preempted.PeriodEnd != preempted.BasedOn.PeriodEnd){
      preemption.PeriodEnd = preempted.PeriodEnd
    }
    if (preempted.ProducerCodeOfRecord != preempted.BasedOn.ProducerCodeOfRecord){
      preemption.ProducerCodeOfRecord = preempted.ProducerCodeOfRecord
    }
    if (preempted.RateAsOfDate != preempted.BasedOn.RateAsOfDate){
      preemption.RateAsOfDate = preempted.RateAsOfDate
    }
    if (preempted.Segment != preempted.BasedOn.Segment){
      preemption.Segment = preempted.Segment
    }
    if (preempted.UWCompany != preempted.BasedOn.UWCompany){
      preemption.UWCompany = preempted.UWCompany
    }
    if (preempted.WaiveDepositChange != preempted.BasedOn.WaiveDepositChange){
      preemption.WaiveDepositChange = preempted.WaiveDepositChange
    }
    if (!preemption.DoNotPurge and preempted.DoNotPurge) {
      preemption.setDoNotPurge(preempted.DoNotPurge, \-> displaykey.PolicyPeriod.PurgeFlag.HandlingPreemptionReason)
    }
  }

  override function postCreateNewBranchForChangeEditEffectiveDate(newBranch: PolicyPeriod, oldBranch: PolicyPeriod) {
    copyNonEffDatedFieldsForPreemption(newBranch, oldBranch)
  }

  override function postCreateDraftBranchInSamePeriod(policyPeriod: PolicyPeriod) {
    var draft = policyPeriod
    draft.AllAccountSyncables.each(\ a -> a.prepareForJobEdit())
    draft.WorksheetContainer = null
    draft.removePeriodAnswersToQuestionSetsOfType(QuestionSetType.TC_PREQUAL) //remove pre-qual question's answers
    draft.mergeDuplicatePolicyContactRoles()
    draft.FailedOOSEEvaluation = false
    draft.FailedOOSEValidation = false
    cloneAndSetPaymentPlanOnPeriod(draft, draft.BasedOn.SelectedPaymentPlan)
  }

  override function postCreateDraftMultiVersionJobBranch(branch: PolicyPeriod) {
    var version = branch
    version.AllAccountSyncables.each(\a -> a.prepareForJobEdit())
    version.mergeDuplicatePolicyContactRoles()
    version.WorksheetContainer = null
    version.setDoNotPurge(false, \ -> "")
  }

  override function determineWrittenDate(owningPolicyPeriod: PolicyPeriod, transaction: Transaction): Date {
    return {transaction.PostedDate, owningPolicyPeriod.EditEffectiveDate}.max()
  }

  override function getSupportedBillingMethods(policyPeriod: PolicyPeriod): BillingMethod[] {
    return BillingMethod.getTypeKeys(false).toTypedArray()
  }

  override function canWaiveNonreportingFinalAudit(policyPeriod: PolicyPeriod, auditInfo: AuditInformation): boolean {
    return true // no extra conditions by default
  }

  override function getAllAccountSyncables(policyPeriod: PolicyPeriod): AccountSyncable[] {
    var syncables = new ArrayList <AccountSyncable>()
    syncables.addAll(policyPeriod.PolicyContactRoles.toList())
    syncables.addAll(policyPeriod.PolicyLocations.toList())
    syncables.add(policyPeriod.PolicyAddress)
    return syncables.toTypedArray()
  }

  override function computeAuditDates(policyPeriod: PolicyPeriod, pattern: SeriesAuditSchedulePattern): List <Date> {
    // This code assume that the interval is monthly or quarterly. If another option is added
    // this code may have to be rewritten.
    return (pattern.IntervalComputationType == "CalendarMonth"
        ? AuditDateCalculator.forCalendarMonths(
            pattern.CalendarMonthRoundDate,
                pattern.Frequency,
                pattern.MinimumAuditPeriodLength,
                pattern.ExcludeLastAuditPeriod)
        : AuditDateCalculator.forPolicyMonths(
            pattern.Frequency,
                pattern.MinimumAuditPeriodLength,
                pattern.ExcludeLastAuditPeriod)).computeDates(policyPeriod.PeriodStart, policyPeriod.EndOfCoverageDate)
  }

  override function getTrackedOutOfGraphReferences(period: PolicyPeriod): List <RefersOutOfDomainGraph> {
    var references = new ArrayList <RefersOutOfDomainGraph>()
    var versionList = period.VersionList
    references.addAll(versionList.PolicyContactRoles*.AllVersions.toList().flatten().toList())
    references.addAll(versionList.PolicyLocations*.AllVersions.toList().flatten().toList())
    references.addAll(versionList.EffectiveDatedFieldsArray*.AllVersions.toList().flatten()*.PolicyAddress.toList())
    return references
  }

  override function getDenormalizedOutOfGraphReferences(period: PolicyPeriod): List <DenormalizedFKOutOfDomainGraph> {
    var references = new ArrayList <DenormalizedFKOutOfDomainGraph>()
    var versionList = period.VersionList
    references.addAll(versionList.PolicyContactRoles*.AllVersions.toList().flatten().toList())
    references.addAll(versionList.PolicyLocations*.LocationRisks*.AllVersions.toList().flatten().toList())
    references.add(period)
    return references
  }

  override property get UnassignedPolicyNumberIdentifier(): String {
    return displaykey.PolicyPeriod.UnassignedPolicyNumberIdentifier
  }

  private function cloneAndSetPaymentPlanOnPeriod(policyPeriod: PolicyPeriod, sourcePaymentPlan: PaymentPlanSummary) : PaymentPlanSummary {
    if (sourcePaymentPlan == null) {
      return null
    }
    var paymentPlanClone = sourcePaymentPlan.shallowCopy() as PaymentPlanSummary
    policyPeriod.SelectedPaymentPlan = paymentPlanClone
    return paymentPlanClone
  }
}
