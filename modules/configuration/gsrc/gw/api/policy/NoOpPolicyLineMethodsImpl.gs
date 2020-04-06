package gw.api.policy

uses gw.api.copy.CompositeCopier
uses gw.api.domain.Clause
uses gw.api.match.MatchableTreeTraverserConfig
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.Schedule
uses gw.api.tree.RowTreeRootNode
uses gw.entity.IEntityType
uses gw.job.sxs.SideBySideInitialConfig
uses gw.lob.common.SegmentEvaluator
uses gw.lob.common.UnderwriterEvaluator
uses gw.pl.currency.MonetaryAmount
uses gw.pl.persistence.core.effdate.EffDatedVersionList
uses gw.plugin.diff.impl.DiffHelper
uses gw.policy.PolicyEvalContext
uses gw.policy.PolicyLineValidation
uses gw.rating.AbstractRatingEngine
uses gw.validation.PCValidationContext

uses java.lang.Iterable
uses java.util.Date
uses java.util.Map
uses java.util.Set

/**
 * <p>This is a default implementation class for the PolicyLineMethods interface used in PolicyLine.eti. This class cannot be extended
 * and should never be used.</p>
 */
@Export
final class NoOpPolicyLineMethodsImpl implements PolicyLineMethods {

  var _line : PolicyLine

  construct(line : PolicyLine){ _line = line }

  override property get AllClauses() : Clause[] {
    return null
  }

  override property get AllConditions() : PolicyCondition[] {
    return null
  }

  override property get AllCoverables() : Coverable[] {
    return null
  }

  override property get AllCoverages() : Coverage[] {
    return null
  }

  override property get AllExclusions() : Exclusion[] {
    return null
  }

  override property get CostVLs() : Iterable<EffDatedVersionList> {
    return null
  }

  override property get Costs() : Set<Cost> {
    return null
  }

  override property get CoveredStates() : Jurisdiction[] {
    return null
  }

  override property get OfficialIDStates() : State[] {
    return null
  }

  override property get Transactions() : Set<Transaction> {
    return null
  }

  override function canSafelyCEED() : boolean {
    return null
  }

  override function canSafelyDeleteBuilding(building : Building) : String {
    return null
  }

  override function canSafelyDeleteLocation(location : PolicyLocation) : String {
    return null
  }

  override function checkLocationInUse(location : PolicyLocation) : boolean {
    return null
  }

  override function initialize() {
  }

  override function onPrimaryLocationCreation(location : PolicyLocation) {
  }

  override function onPrimaryNamedInsuredChange(p0 : PolicyPriNamedInsured) {
  }

  override function postApplyChangesFromBranch(p0 : PolicyPeriod) {
  }

  override function postCopyBranchIntoNewPolicy() {
  }

  override function postCreateDraftBranchInNewPeriod() {
  }

  override function postSetPeriodWindow(p0 : Date, p1 : Date) {
  }

  override function preLoadCoverages() {
  }

  override function preLocationDelete(location : PolicyLocation) {
  }

  override function prorateBasesFromCancellation() {
  }

  override function syncComputedValues() {
  }

  override property get AllModifiables() : Modifiable[] {
    return null
  }

  override property get SupportsRatingOverrides() : boolean {
    return null
  }

  override function cloneAutoNumberSequences() {
  }

  override function resetAutoNumberSequences() {
  }

  override function bindAutoNumberSequences() {
  }

  override function renumberAutoNumberSequences() {
  }

  override function onIssuanceBeginEditing() {
  }

  override function onSubmissionBeginEditing() {
  }

  override function onRenewalInitialize() {
  }

  override property get Auditable() : boolean {
    return null
  }

  override property get AllowsPremiumAudit() : boolean {
    return null
  }

  override function createPolicyLineValidation(validationContext : PCValidationContext) : PolicyLineValidation {
    return null
  }

  override function prePeriodStartChanged(newDate : Date) {
  }

  override function createPolicyLineDiffHelper(reason : DiffReason, policyLine : PolicyLine) : DiffHelper<PolicyLine> {
    return null
  }

  override function getCostForCoverage(covered : Coverable, covPat : CoveragePattern) : Cost {
    return null
  }

  override function getAllCostsForCoverage(covered : Coverable, covPat : CoveragePattern) : List<Cost> {
    return null
  }

  override function isCostVisible(covered : Coverable, covPat : CoveragePattern) : boolean {
    return null
  }

  override function getQuoteValidationLevel(qType : QuoteType) : ValidationLevel {
    return null
  }

  override function getQuoteRatingStyle(qType : QuoteType) : RatingStyle {
    return null
  }

  override property get Copier() : CompositeCopier<PolicyPeriod, PolicyLine> {
    return null
  }

  override function onBeginIssueJob() {
  }

  override function calculateTotalInsuredValue(coverages : List<Coverage>) : MonetaryAmount {
    return null
  }

  override function calculateTotalInsuredValue(coverages : List<Coverage>, currency : Currency) : MonetaryAmount {
    return null
  }

  override function canDateSliceOnPropertyChange(bean : KeyableBean) : boolean {
    return null
  }

  override property get TypesToNotDateSliceOnApplyDiff() : Set<IEntityType> {
    return null
  }

  override function createUnderwriterEvaluator(context : PolicyEvalContext) : UnderwriterEvaluator {
    return null
  }

  override function createSegmentEvaluator(policyPeriod : PolicyPeriod) : SegmentEvaluator {
    return null
  }

  override property get AdditionalDaysInAnnualTerm() : int {
    return 0
  }

  override property get SideBySideEnabled() : boolean {
    return null
  }

  override property get SideBySideBaseDataConfig() : MatchableTreeTraverserConfig {
    return null
  }

  override property get SideBySideInitialConfig() : SideBySideInitialConfig {
    return null
  }


  override property get WorkersComp() : boolean {
    return false
  }

  override property get EmergencyServiceFunding() : boolean {
    return false
  }

  override property get PolicyLocationCanBeRemovedWithoutRemovingAssociatedRisks() : boolean {
    return false
  }

  override property get SupportsNonSpecificLocations() : boolean {
    return false
  }

  override function validateLocations(location : PolicyLocation) {
  }

  override function validateSubmissionWizardPolicyInfo(period : PolicyPeriod) {
  }

  override property get AllCurrentAndFutureScheduledItems() : List<ScheduledItem> {
    return null
  }

  override function canSafelyDeleteExistingContact(toContact : Contact) : String {
    return null
  }

  override function canSafelyDeleteNamedInsured(polNamedInsured : PolicyNamedInsured) : String {
    return null
  }

  override property get AllSchedules() : Schedule[] {
    return null
  }

  override function checkForDuplicates() {
  }

  override function getWorksheetRootNode(showConditionals : boolean) : RowTreeRootNode {
    return null
  }

  override property get ContainsBuildings(): boolean {
    return null
  }

  override function createRatingEngine(method: RateMethod, parameters: Map<RateEngineParameter, Object>): AbstractRatingEngine {
    return null
  }

  override property get BaseStateRequired(): boolean {
    return null
  }

  override function updateTerritoryCodes(location: gw.pc.policy.period.entity.PolicyLocation) {
  }
}