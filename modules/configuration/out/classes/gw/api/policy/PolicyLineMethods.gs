package gw.api.policy

uses gw.api.copy.CompositeCopier
uses gw.api.diff.DiffItem
uses gw.api.domain.Clause
uses gw.pl.currency.MonetaryAmount
uses gw.api.match.MatchableTreeTraverserConfig
uses gw.api.productmodel.CoveragePattern
uses gw.entity.IEntityType
uses gw.job.sxs.SideBySideInitialConfig
uses gw.lob.common.AbstractUnderwriterEvaluator
uses gw.lob.common.SegmentEvaluator
uses gw.lob.common.UnderwriterEvaluator
uses gw.plugin.diff.impl.DiffHelper
uses gw.policy.PolicyLineValidation
uses gw.policy.PolicyEvalContext
uses gw.policy.PolicyPeriodCopier
uses gw.validation.PCValidationContext

uses java.math.BigDecimal
uses gw.api.tree.RowTreeRootNode
uses gw.api.productmodel.Schedule
uses java.util.Date
uses java.util.Set
uses gw.rating.AbstractRatingEngine
uses java.util.Map
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern

/**
 * This interface defines all the methods that can be overridden by subtypes of the PolicyLine class.  All
 * PolicyLine subtypes must define a delegate using this interface and some line-specific implementation class,
 * generally one that extends the AbstractPolicyLineMethods class.  Adding methods to this interface and
 * then implementing those methods on the delegate implementations is the only real way to obtain polymorphic
 * behavior among PolicyLine subtypes.
 */
@Export
interface PolicyLineMethods extends gw.api.policy.PolicyLineJavaMethods {

  /**
   * Returns jurisdictions that are covered by this line.
   *
   * @return Jurisdiction[] states covered by this line
   */
  override property get CoveredStates() : Jurisdiction[]

  /**
   * <b>Note:</b> this method is expensive and should be used infrequently.
   *
   * @return all coverages, exclusions, and conditions on the policy line
   */
  override property get AllClauses() : Clause[]

  /**
   * <b>Note:</b> this method is expensive and should be used infrequently.
   * Moreover, each policy line should override this and include coverages
   * specific to the line. For instance, BA Line needs to add coverages on its
   * vehicles and jurisdictions.
   *
   * @return all coverages on the policy line
   */
  override property get AllCoverages() : Coverage[]

  /**
   * Returns all exclusions on the policy line
   *
   * @return all exclusions on the policy line
   */
  override property get AllExclusions() : Exclusion[]

  /**
   * Returns all conditions on the policy line
   *
   * @return all conditions on the policy line
   */
  override property get AllConditions() : PolicyCondition[]

  /**
   * Returns all Coverables on the policy line.
   *
   * @return Coverable[]
   */
  override property get AllCoverables() : Coverable[]

  /**
   * Returns all Modifiables on the policy line.
   */
  property get AllModifiables() : Modifiable[]

  /**
   * Returns all Schedules on the policy line.
   */
  property get AllSchedules() : Schedule[]

  /**
   * Return true if this line supports rating overrides; false otherwise.
   */
  property get SupportsRatingOverrides() : boolean

  /**
   * This base class implementation updates all the CoveredState. Subclasses may
   * update their own particular computed values.
   * <p/>
   * This method is typically called at "key" points in the lifecycle of a
   * policy, such as just before quoting and just before issuance.
   *
   * @see com.guidewire.pc.domain.policy.period.PolicyPeriod#syncComputedValues
   */
  override function syncComputedValues()

  /**
   * Look for duplicates entries in the same array, for example 2 coverages of
   * the same pattern on the same coverable. It's possible to create duplicates
   * when making OOSE changes, e.g. at 6/1 I add a coverage to a vehicle. I bind
   * this change then make an OOSE change where I add the same coverage to the
   * same vehicle at 3/1. In effective time, at 6/1 and beyond there will be
   * duplicate coverages.
   * <p/>
   * This method should be called at the beginning of the quote process before
   * validation occurs. It's expected that if duplicates are found they are also
   * dealt with, e.g. duplicates are merged using EffDatedDuplicate.
   */
  @Deprecated("Any possible duplicate checking should be handled by implementing a logical match for the entity instead.")
  function checkForDuplicates()

  /**
   * Returns all states for which official IDs should be created.
   */
  override property get OfficialIDStates() : State[]

  /**
   * Policy Line Subtype specific initialization
   */
  override function initialize()

  /**
   * Clones autonumbering sequences for this policy line
   */
  function cloneAutoNumberSequences()

  /**
   * Resets autonumbering sequences for this policy line
   */
  function resetAutoNumberSequences()

  /**
   * Binds autonumbering sequences for this policy line
   */
  function bindAutoNumberSequences()

  /**
   * Finds new sequenced beans to renumber, called after changes have been
   * applied to a branch, e.g. from preemption or apply a PolicyChange to
   * a future period.
   */
  function renumberAutoNumberSequences()

  /**
   * Callback executed during the beginEditing method of IssuanceProcess.
   */
  function onIssuanceBeginEditing()

  /**
   * Callbacks executed during the beginEditing method of SubmissionProcess
   */
  function onSubmissionBeginEditing()

  /**
   * Callback executed as part of the initialize() method on the RenewalProcess, which is called
   * when a renewal is started and before the workflow is kicked off.
   */
  function onRenewalInitialize()

  /**
   * True if this line requires an audit, false otherwise.
   */
  property get Auditable() : boolean

  /**
   * True if this line allows Premium Audits, false otherwise.
   */
  property get AllowsPremiumAudit() : boolean

  /**
   * Indicates whether ChangeEditEffectiveDate (CEED) can be performed on this policy line.
   * @return true if can CEED, false otherwise.
   */
  override function canSafelyCEED() : boolean

  /**
   * Indicates whether or not this location can be safely deleted, according to this policy line.  If this returns
   * a null or empty string, that means that the line thinks it's okay to delete the location.  Otherwise, this method
   * should return an error message indicating why the location can't be deleted.  This method is used by the UI
   * to determine whether the user is allowed to remove a particular location.
   * <p>Depending on the line, it may be possible to safely delete a location even
   * {@link #checkLocationInUse(com.guidewire.pc.domain.policy.period.PolicyLocation) if it is in use}.
   *
   * @param location the PolicyLocation to check
   * @return an error message if it can't be safely deleted, null or the empty String if it can
   */
  override function canSafelyDeleteLocation(location : PolicyLocation) : String

  /**
   * Indicates whether or not this policy named insured can be safely deleted, according to this policy line.  If this returns
   * a null or empty string, that means that the line thinks it's okay to delete the policy named insured.  Otherwise, this method
   * should return an error message indicating why the policy named insured can't be deleted.
   *
   * @param polNamedInsured the PolicyNamedInsured to check
   * @return an error message if it can't be safely deleted, null or the empty String if it can
   */
  override function canSafelyDeleteNamedInsured(polNamedInsured : PolicyNamedInsured) : String

  /**
   * Indicates whether or not this contact can be safely deleted, according to this policy line.  If this returns
   * a null or empty string, that means that the line thinks it's okay to delete this contact.  Otherwise, this method
   * should return an error message indicating why this contact can't be deleted.
   *
   * @param toContact the contact to check
   * @return an error message if it can't be safely deleted, null or the empty String if it can
   */
  override function canSafelyDeleteExistingContact(toContact : Contact) : String

  /**
   * If schedules are implemented on policy line, this method will return a list of current and future scheduled items.
   *
   * @return all scheduled items on policy line
   */
  override property get AllCurrentAndFutureScheduledItems() : List<ScheduledItem>

  /**
   * Indicates whether or not this location is in use by the policy line.  This method is checked prior to rating
   * and unused locations will be removed at that time.  This cleanup is necessary to eliminate obsolete locations
   * that may have been created in products that don't have a Locations screen or in package products that have both
   * policy-level and line-level location screens.
   * <p>Depending on the line, {@link #canSafelyDeleteLocation(com.guidewire.pc.domain.policy.period.PolicyLocation) it may
   * be possible to safely delete a location} even if it is in use.
   *
   * @param location the PolicyLocation to check
   * @return true if the PolicyLocation is in use by this line, false if it is not
   */
  override function checkLocationInUse(location : PolicyLocation) : boolean

  /**
   * Generic callback executed on each line whenever a primary location is created during submission, allowing the line
   * to do any necessary book-keeping or updates to its own datamodel.
   *
   * @param location the PolicyLocation being created
   */
  override function onPrimaryLocationCreation(location : PolicyLocation)

  /**
   * Generic callback executed on each line whenever a location is about to be deleted, allowing the line to do any
   * necessary book-keeping or updates to its own datamodel.
   *
   * @param location the PolicyLocation that's about to be deleted
   */
  override function preLocationDelete(location : PolicyLocation)


  /**
   * Indicates whether or not this building can be safely deleted.
   */
  override function canSafelyDeleteBuilding(building : Building) : String

  /**
   * Prorate bases from the cancellation dates. This method should only be called from
   * the start of an Audit job.
   */
  override function prorateBasesFromCancellation()

  /**
   * Create the appropriate line-specific subclass of PolicyLineValidation to use in validating this line.
   *
   * @param validationContext the PCValidationContext to pass to the validation object being created
   */
  function createPolicyLineValidation(validationContext : PCValidationContext) : PolicyLineValidation

  /**
   * Executed before the period start date changed on submission
   */
  function prePeriodStartChanged(newDate : Date)

  /**
   * Instantiates a DiffHelper based on the type of policyline
   * @param reason The reason for the diff
   * @param policyLine The policy line of the second period to compare
   * @return the diff helper for the LOB
   */
  function createPolicyLineDiffHelper(reason : DiffReason, policyLine : PolicyLine) : DiffHelper

  /**
   * Returns the cost given the coverable and coverage pattern.  If there are multiple costs
   * associated with the coverable for the give coverage pattern, only a single, randomly selected
   * cost will be returned.  Use getAllCostsForCoverage to access all the costs on the coverable.
   * @param covered Coverable associated with cost
   * @param covPat Coverage pattern for which cost is sought for
   * @return The cost associated with coverable and coveragepattern passed in
   */
  @Deprecated("Use getCostsForCoverage(Coverable, CoveragePattern) instead")
  function getCostForCoverage(covered : Coverable, covPat : CoveragePattern) : Cost

  /**
   * Returns all costs given the coverable and coverage pattern.
   * @param covered Coverable associated with cost
   * @param covPat Coverage pattern for which cost is sought for
   * @return The costs associated with coverable and coveragepattern passed in
   */
  function getAllCostsForCoverage(covered : Coverable, covPat : CoveragePattern) : List<Cost>

  /**
   * Returns whether the cost for the given coverable and coverage pattern are visible
   * @param covered Coverable associated with cost
   * @param covPat Coverage pattern for which cost is sought for
   * @return True if the cost is visible otherwise returns false
   */
  function isCostVisible(covered : Coverable, covPat : CoveragePattern) : boolean

  /**
   * Returns validation level to use during quoting based on the policy period
   */
  function getQuoteValidationLevel(qType : QuoteType) : ValidationLevel

  /**
   * Returns ratingStyle to use during quoting based on the policy period
   */
  function getQuoteRatingStyle(qType : QuoteType) : RatingStyle

  /**
   * Returns the Copier to use for copying data within this policy line, or null if copying is not
   * supported for this line.
   */
  property get Copier() : CompositeCopier<PolicyPeriod, ? extends PolicyLine>

  /**
   * Called before the job is bound/issued.  The last chance to change any effective dated entities in the policy
   * before the bind process begins and locks the branch containing these entities.
   *
   */
  function onBeginIssueJob()

  /**
   * Calculate the Total Insured Value for a Reinsurable Risk, given all its coverages.
   * Ignore (i.e. value at zero) any coverage that is not recognized.
   *
   * @param coverages all coverages of a single Reinsurable Risk
   * @return the total insured value (TIV) (aka Sum Insured)
   */
  function calculateTotalInsuredValue(coverages : List<Coverage>) : MonetaryAmount


  /**
   * Calculate the Total Insured Value for a Reinsurable Risk, given all its coverages.
   *
   * @param coverages all coverages of a single Reinsurable Risk
   * @param currency currency to be used for TIV summation
   * @return the total insured value (TIV) (aka Sum Insured)
   */
  function calculateTotalInsuredValue(coverages : List<Coverage>, currency : Currency) : MonetaryAmount

  /**
   * Some beans (for example, exposures in GL and WC lines) can be sliced
   * but a property change applied as of a certain date will cause incorrect prorating.
   *
   * @param bean that has a property change diff
   * @return true if a property change on this bean can be sliced, false otherwise.
   */
  function canDateSliceOnPropertyChange(bean : KeyableBean) : boolean

  /**
   * Some beans (for example, Jurisdiction in  WC lines) apply to the whole period,
   * and should never be split.  Applying a diff as of a particular date should not
   * be allowed to create a date split for these beans.
   *
   * @return The types of the beans that should never be date sliced when applying a diff.
   */
  property get TypesToNotDateSliceOnApplyDiff() : Set<IEntityType>

  /**
   * Replaces LOB-specific code contained in the (now deleted) rule set PolicyEvalNew.
   * The default behavior is to return a null evaluator for the given line as most LOBs
   * only use the default evaluator. Be sure to check for a null evaluator when implementing.
   *
   * @param context the PolicyEvalContext that the underwriter is to evaluate
   * @return the evaluator
   */
  function createUnderwriterEvaluator(context : PolicyEvalContext) : UnderwriterEvaluator

  /**
   * Creates the evaluator for a segment that a underwriting company is eligible to provide insurance for.
   * The default behavior is to return a null evaluator for the given line as most LOBs
   * only use the default evaluator. Be sure to check for a null evaluator when implementing.
   *
   * @param policyPeriod the policy period that is to be evaluated
   * @return the evaluator
   */
  function createSegmentEvaluator(policyPeriod : PolicyPeriod) : SegmentEvaluator

  /**
   * Some lines (only WC at the moment) are allowed to have an annual term with a duration different from the
   * 1-year standard. This property allows each line to specify if there are additional days in an annual term.
   * The default value is 0.
   *
   * @return the number of additional days.
   */
  property get AdditionalDaysInAnnualTerm() : int

  /**
   * Determines if a line has been configured to support Side By Side quoting.
   */
  property get SideBySideEnabled() : boolean

  property get SideBySideBaseDataConfig() : MatchableTreeTraverserConfig

  property get SideBySideInitialConfig() : SideBySideInitialConfig

  /**
   * Marks lines that are WorkersComp lines. OOTB this is only the WCLine.
   *
   * @return true: Is a WorkersComp line.
   */
  property get WorkersComp() : boolean

  /**
   * Marks lines that are used in determining funding for emergency services.
   * OOTB these are BOP, CP, WC
   *
   * @return true: Line is used in determining funding for emergency services
   */
  property get EmergencyServiceFunding() : boolean

  /**
   * Determine if a policy location can be removed without first removing associated risks
   *
   * @return true:
   */
  property get PolicyLocationCanBeRemovedWithoutRemovingAssociatedRisks() : boolean

  /**
   * Build a RowTreeRootNode suitable for displaying the worksheets for a line.
   * @param showConditionals flag to display worksheet conditionals
   * @return a row tree root node.
   */
  function getWorksheetRootNode(showConditionals: boolean) : RowTreeRootNode

  /**
   * True: The line supports buildings and as such has a meaningful {@link #canSafelyDeleteBuilding} implementation.
   */
  property get ContainsBuildings() : boolean

  /*
   * True if line supports non-specific locations (e.g. GL, IM or WC)
   *
   * @return true: Line supports non-specific locations
   */
  property get SupportsNonSpecificLocations() : boolean

  /**
   * True if Base State is required for this line
   *
   * @return boolean: Line requires Base State
   */
  property get BaseStateRequired() : boolean

  /**
   * Run validation on a specific location
   * @param location the policy location to be validated
   * @throws EntityValidationException if a validation error is found
   */
  function validateLocations(location : PolicyLocation)

  /**
   * Run validation of policy info fields associated with a submission
   * @param period the policy period to be validated
   * @throws EntityValidationException if a validation error is found
   */
  function validateSubmissionWizardPolicyInfo(period : PolicyPeriod)

  /**
   * Creates a new rating engine supporting given {@link RateMethod} and {@link RateEngineParamater} map.
   *
   * @return The created rating engine
   */
  function createRatingEngine(method : RateMethod, parameters : Map<RateEngineParameter, Object>) : AbstractRatingEngine
}
