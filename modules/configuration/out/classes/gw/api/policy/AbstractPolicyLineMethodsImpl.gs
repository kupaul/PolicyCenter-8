package gw.api.policy

uses com.guidewire.commons.collections.GreedyMaps
uses gw.pl.persistence.core.effdate.EffDatedVersionList
uses com.guidewire.pl.system.util.DateFormatUtil
uses gw.i18n.DateTimeFormat
uses gw.api.copy.CompositeCopier
uses gw.api.diff.DiffUtils
uses gw.api.domain.Clause
uses gw.pl.currency.MonetaryAmount
uses gw.api.match.MatchableTreeTraverserConfig
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.Schedule
uses gw.api.tree.RowTreeRootNode
uses gw.rating.worksheet.treenode.WorksheetTreeNodeUtil
uses gw.entity.IEntityType
uses gw.api.util.MonetaryAmounts
uses gw.job.sxs.SideBySideInitialConfig
uses gw.lob.common.SegmentEvaluator
uses gw.lob.common.UnderwriterEvaluator
uses gw.plugin.diff.impl.PCBeanMatcher
uses gw.plugin.diff.impl.DiffHelper
uses gw.policy.PolicyEvalContext

uses java.lang.UnsupportedOperationException
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.Date
uses java.util.Map
uses java.util.Set
uses gw.api.domain.LineSpecificBuilding
uses java.lang.Long
uses java.util.HashMap

uses gw.internal.ext.org.apache.commons.collections.keyvalue.MultiKey
uses gw.api.util.FXRateUtil
uses gw.api.util.CurrencyUtil
uses java.lang.IllegalStateException
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern

/**
 * <p>This is the abstract implementation class for the PolicyLineMethods interface.  Subclasses must, at
 * a minimum, implement the properties:</p>
 * <ul>
 * <li>CoveredStates
 * <li>AllClauses
 * <li>AllCoverages
 * <li>AllExclusions
 * <li>AllConditions
 * <li>AllCoverables
 * <li>AllModifiables
 * <li>AvailabilityForAllCoverables
 * <li>Costs
 * <li>Transactions
 * </ul>
 */
@Export
abstract class AbstractPolicyLineMethodsImpl implements PolicyLineMethods {

  var _line : PolicyLine

  construct(line : PolicyLine){ _line = line }

  override property get OfficialIDStates() :  State[] {
    return new State[0]
  }

  override property get CoveredStates() : Jurisdiction[] {
    throw new UnsupportedOperationException(displaykey.PolicyLineMethods.Error.MustOverride.CoveredStates)
  }

  override property get AllClauses() : Clause[] {
    var clauses = new ArrayList<Clause>()
    AllCoverages.each( \ cov -> clauses.add(cov) )
    AllExclusions.each( \ excl -> clauses.add(excl) )
    AllConditions.each( \ cond -> clauses.add(cond) )
    return clauses as Clause[]
  }

  override property get SupportsRatingOverrides() : boolean {
    return false
  }

  override property get AllSchedules() : Schedule[] {
    //If a line has schedules defined then this method should be overridden by line specific method
    return {}
  }

  override function syncComputedValues() {
    syncAllScheduleRateModifiers()
  }

  /**
   * Updates the rate modifier of all schedule rate modifiers from the rate factors
   * of the modifier
   */
  protected function syncAllScheduleRateModifiers() {
    _line.Branch.EffectiveDatedFields.ProductModifiers.each(\ modifier -> {
        if (modifier.ScheduleRate) {
          modifier.updateRateModifierFromRateFactors()
        }
    })
    AllModifiables.each(\ modifiable -> modifiable.Modifiers.each(\ modifier -> {
        if (modifier.ScheduleRate) {
          modifier.updateRateModifierFromRateFactors()
        }
    }))
  }

  @Deprecated("Any possible duplicate checking should be handled by implementing a logical match for the entity instead.")
  override function checkForDuplicates() {}

  override function initialize() {}

  override function resetAutoNumberSequences() {}

  override function bindAutoNumberSequences() {}

  override function renumberAutoNumberSequences() {}

  override function cloneAutoNumberSequences() : void {}

  override function onIssuanceBeginEditing() {}

  override function onSubmissionBeginEditing() {}

  override function onRenewalInitialize() {}

  override function canSafelyCEED() : boolean {
    return true
  }

  override function canSafelyDeleteLocation( location: PolicyLocation ) : String {
    if (location.PrimaryLoc) {
      return displaykey.Web.Policy.LocationContainer.Location.PrimaryLocationError.CanNotRemovePrimaryLocation
    }
    return ""
  }

  override function canSafelyDeleteNamedInsured(polNamedInsured : PolicyNamedInsured) : String {
    var scheduledItems = AllCurrentAndFutureScheduledItems
    if (scheduledItems != null || !scheduledItems.Empty){
      var allScheduledItemsReferencingNamedInsured = scheduledItems.where(\ item -> item.NamedInsured.FixedId == polNamedInsured.FixedId)
      var currentOrFutureSchedItemMap = allScheduledItemsReferencingNamedInsured
        .where(\ item -> (item as EffDated).ExpirationDate >  polNamedInsured.SliceDate)
        .partition(\ item -> (item as EffDated).EffectiveDate <= polNamedInsured.SliceDate ? SliceType.CURRENT : SliceType.FUTURE)

      var errorMsgForCurrentItems = currentOrFutureSchedItemMap.get(SliceType.CURRENT) != null ?
                                  getErrorMsgForScheduleItems(currentOrFutureSchedItemMap.get(SliceType.CURRENT)) : ""
      var errorMsgForFutureItems = currentOrFutureSchedItemMap.get(SliceType.FUTURE) != null ?
                                  getErrorMsgForScheduleItemsWithEffDate(currentOrFutureSchedItemMap.get(SliceType.FUTURE)) : ""

      if (isCurrentAndFutureItemExistInScheduledItemMap(currentOrFutureSchedItemMap)){
          return displaykey.Web.Policy.NamedInsured.Schedule.CannotDelete.HasCurrentAndFutureSchedules(polNamedInsured, errorMsgForCurrentItems, errorMsgForFutureItems)

      } else if (isCurrentItemExistsInScheduledItemMap(currentOrFutureSchedItemMap)){
          return displaykey.Web.Policy.NamedInsured.Schedule.CannotDelete.HasCurrentOrFutureSchedules(polNamedInsured, errorMsgForCurrentItems)

      } else if (isFutureItemExistsInScheduledItemMap(currentOrFutureSchedItemMap)){
          return displaykey.Web.Policy.NamedInsured.Schedule.CannotDelete.HasCurrentOrFutureSchedules(polNamedInsured, errorMsgForFutureItems)
      }
    }
    return null
  }

  override function canSafelyDeleteExistingContact(toContact : Contact) : String {
    var scheduledItems = AllCurrentAndFutureScheduledItems
    if (scheduledItems != null || !scheduledItems.Empty){
      var additionalNamedInsuredRole = _line.Branch.PolicyContactRoles.whereTypeIs(PolicyAddlNamedInsured).firstWhere(\ p -> p.AccountContactRole.AccountContact.Contact == toContact )
      var allScheduledItemsReferencingAddlNamedInsured = scheduledItems.where(\ item -> item.NamedInsured.AccountContactRole.AccountContact.Contact.ID == toContact.ID)
      var currentOrFutureSchedItemMap = allScheduledItemsReferencingAddlNamedInsured
        .where(\ item -> (item as EffDated).ExpirationDate >  additionalNamedInsuredRole.SliceDate)
        .partition(\ item -> (item as EffDated).EffectiveDate <= additionalNamedInsuredRole.SliceDate ? SliceType.CURRENT : SliceType.FUTURE)

      var errorMsgForCurrentItems = currentOrFutureSchedItemMap.get(SliceType.CURRENT) != null ?
                                  getErrorMsgForScheduleItems(currentOrFutureSchedItemMap.get(SliceType.CURRENT)) : ""
      var errorMsgForFutureItems = currentOrFutureSchedItemMap.get(SliceType.FUTURE) != null ?
                                  getErrorMsgForScheduleItemsWithEffDate(currentOrFutureSchedItemMap.get(SliceType.FUTURE)) : ""

      if (isCurrentAndFutureItemExistInScheduledItemMap(currentOrFutureSchedItemMap)){
          return displaykey.Web.Policy.AdditionalInsured.Schedule.CannotDelete.HasCurrentAndFutureSchedules(toContact, errorMsgForCurrentItems,
            errorMsgForFutureItems)

      } else if (isCurrentItemExistsInScheduledItemMap(currentOrFutureSchedItemMap)){
          return displaykey.Web.Policy.AdditionalInsured.Schedule.CannotDelete.HasCurrentOrFutureSchedules(toContact, errorMsgForCurrentItems)

      } else if (isFutureItemExistsInScheduledItemMap(currentOrFutureSchedItemMap)){
          return displaykey.Web.Policy.AdditionalInsured.Schedule.CannotDelete.HasCurrentOrFutureSchedules(toContact, errorMsgForFutureItems)
      }
    }
    return null
  }

  override property get AllCurrentAndFutureScheduledItems() : List<ScheduledItem> {
    return {}
  }

  override function checkLocationInUse(location : PolicyLocation) : boolean {
    return location.PrimaryLoc
  }

  override function preLocationDelete(location : PolicyLocation) {}

  override function onPrimaryLocationCreation(location : PolicyLocation) {}

  override property get Auditable() : boolean {
    return false
  }

  override property get AllowsPremiumAudit() : boolean {
    return false
  }

  /**
   * Checks for duplicated coverages, and if found merge them.  Note, coverages with
   * later effective dates will be replaced with ones with earlier effective dates.
   *
   * A duplicate coverage may be created with an OOS change, e.g. a policy change adds
   * a coverage at T2, is bound, then an OOS policy change adds the same coverage at
   * T1 (but you don't see that it also existed at T2 when adding it at T1).
   *
   * @param versionLists {@link List<EffDatedVersionList>)  Note, that this should be a list of version lists for coverages.
   */
  function mergeDuplicates(versionLists : List<EffDatedVersionList>) {
    var utils = new DiffUtils(new PCBeanMatcher())
    var dups = utils.findDuplicates( versionLists )
    for (dup in dups) {
      // This will merge the "old" coverage (the one added later in effective time)
      // into the "new" coverage, then remove the "old" coverage.
      dup.first().merge( dup.last() )
    }
  }

  /**
   * Checks for duplicated coverages, and if found merge them.  Note, coverages with
   * later effective dates will be replaced with ones with earlier effective dates.
   *
   * A duplicate coverage may be created with an OOS change, e.g. a policy change adds
   * a coverage at T2, is bound, then an OOS policy change adds the same coverage at
   * T1 (but you don't see that it also existed at T2 when adding it at T1).
   *
   * @param mapOfVersionLists note, that this should be a map of versions lists of coverages
   *
   * @link DiffUtils#findDuplicates(Map<EffDatedVersionList, List<EffDated>>)
   */
  function mergeDuplicates(mapOfVersionLists : Map<EffDatedVersionList, List<EffDated>>) {
    var utils = new DiffUtils(new PCBeanMatcher())
    var dups = utils.findDuplicates( mapOfVersionLists )
    for (dup in dups) {
      // This will merge the "old" coverage (the one added later in effective time)
      // into the "new" coverage, then remove the "old" coverage.
      dup.first().merge( dup.last() )
    }
  }

  protected function versionsByVersionListPerRoot<CVL extends EffDatedVersionList, C extends EffDated>(
          parents : EffDated[], arrayProp : String) : List<Map<CVL, List<C>>> {
    var childVLsByParentVLs = GreedyMaps.mergedMappedSets(parents.map(\ p -> {
      return {p.VersionList -> (p.VersionList[arrayProp] as List<CVL>).toSet()}
    }))
    var childrenByChildVL = childVLsByParentVLs.Values.map(\ cvls -> cvls.toList()).flatten().allVersions<C>(false)
    var childrenByParentVL : Map<EffDatedVersionList, Set<C>> = {}.toAutoMap(\ k -> {return {}})
    childVLsByParentVLs.eachKeyAndValue(\ pvl, cvls -> cvls.each(\ cvl -> {
      childrenByParentVL[pvl] = childrenByParentVL[pvl].union(childrenByChildVL[cvl])
    }))
    return parents.map(\ p -> GreedyMaps.mergedMappedSets(childVLsByParentVLs[p.VersionList].map(\ cvl -> {
      return {cvl -> childrenByChildVL[cvl].toSet()}
    }).toTypedArray()).mapValues(\ s -> s.toList().cast(C))).toList()
  }

  override property get Costs() : Set<Cost> {
    return CostVLs.allVersionsFlat<Cost>().toSet()
  }

  override function prorateBasesFromCancellation() : void {
    // Do nothing by default
  }

  override function prePeriodStartChanged( newDate: Date ) : void {
    // do nothing by default
  }

  override function onPrimaryNamedInsuredChange(newPrimaryNamedInsured : PolicyPriNamedInsured) {
    // do nothing by default
  }

  /**
   * Returns null string for lines that it's not applicable to.
   */
  override function canSafelyDeleteBuilding( building : Building ) : String {
    if (not ContainsBuildings) {
      return ""
    }
    var currentOrFutureLineBuildingForBuilding = getCurrentOrFutureLineBuildingsForBuilding(building).partition(\item -> (item as EffDated).EffectiveDate <= building.SliceDate ? "current" : "future")

    if( currentOrFutureLineBuildingForBuilding["current"].HasElements) {
      return getCannotDeleteBuildingMessage(building)
    }
    if( currentOrFutureLineBuildingForBuilding["future"].HasElements) {
      var futureDatesStr = currentOrFutureLineBuildingForBuilding["future"].map(\l -> (l as EffDated).EffectiveDate).order().join(", ")
      return getCannotDeleteBuildingFutureMessage(building, futureDatesStr)
    }
    return ""
  }

  /**
   * Override to define message if not able to safely delete current building.
   */
  protected function getCannotDeleteBuildingMessage(building : Building) : String {
    return ""
  }

  /**
   * Override to define message if not able to safely delete future building.
   */
  protected function getCannotDeleteBuildingFutureMessage(building : Building, dates : String) : String {
    return ""
  }

  private function getCurrentOrFutureLineBuildingsForBuilding(building : Building) : List<LineSpecificBuilding> {
    var allLineBldgsAndBldgs = maybeLookupAllLineBuildingsEver()
    return allLineBldgsAndBldgs.Keys.where(\ lb ->
      ( (lb as EffDated).ExpirationDate > building.SliceDate )
        and ( allLineBldgsAndBldgs[lb] == building.FixedId.Value )
    )
  }

  /**
   * Performance note: During a quote, cache the value of all line-specific Buildings Ever
   */
  private function maybeLookupAllLineBuildingsEver() : Map<LineSpecificBuilding, Long> {
    var jobProcess = _line.Branch.JobProcess
    var isQuoting = jobProcess.IsQuoting
    var key : MultiKey
    var allBldgsWithBldgs : Map<LineSpecificBuilding, Long>

    if (isQuoting) {
      key = new MultiKey("AllBuildingsFor" + _line.PatternCode, _line)
      allBldgsWithBldgs = jobProcess.BeanCache[key] as Map<LineSpecificBuilding, Long>
      if (allBldgsWithBldgs != null) {
        return allBldgsWithBldgs // cached map...
      }
    }

    allBldgsWithBldgs = getAllLineBuildingsEverWithBuildings()

    if (isQuoting) {
      // cache...
      jobProcess.BeanCache[key] = allBldgsWithBldgs
    }

    return allBldgsWithBldgs
  }

  /**
   * Override to find all line buildings. Used for #canSafelyDeleteBuilding.
   * Example for CPLine:
   * _line.VersionList.CPLocations.arrays<CPBuildingVersionList>("Buildings").allVersionsFlat<CPBuilding>() as List<LineSpecificBuilding>
   */
  protected function getAllLineBuildingsEver() : List<LineSpecificBuilding> {
    return {}
  }

  /**
   * Performance note:
   * Return a Map of LineSpecificBuildings as keys with Building's FixedId's as values,
   *   to avoid excessive bean gets when the Buildings are needed in method
   *   canSafelyDeleteBuilding.
   */
  private function getAllLineBuildingsEverWithBuildings() : Map<LineSpecificBuilding, Long> {
    var lineBldgs = getAllLineBuildingsEver()
    var bldgMap = new HashMap<LineSpecificBuilding, Long>(lineBldgs.Count)
    lineBldgs.each(\ lb -> {
        if ( lb.LocationBuilding != null ) bldgMap[lb] = lb.LocationBuilding.FixedId.Value })
    return bldgMap
  }

  override function createPolicyLineDiffHelper(reason : DiffReason, policyLine : PolicyLine) : DiffHelper {
    return new DiffHelper(reason, this._line, policyLine)
  }

  override function postApplyChangesFromBranch(sourcePeriod : PolicyPeriod) {}

  override function postSetPeriodWindow( oldEffDate: Date, oldExpDate: Date) {}

  override function postCreateDraftBranchInNewPeriod() {}

  override function postCopyBranchIntoNewPolicy() {}

  override property get Copier() : CompositeCopier<PolicyPeriod, ? extends PolicyLine> {
    return null
  }

  override function isCostVisible(covered : Coverable, covPat : CoveragePattern) : boolean {
    if (not _line.Branch.JobProcess.canViewQuote()) {
      return false
    }
    var allCostsForCoverage = getAllCostsForCoverage(covered, covPat)
    if ( allCostsForCoverage.size() == 0) {
      return false
    }
    return true
  }

  override function getQuoteValidationLevel(qType : QuoteType) : ValidationLevel {
    return ValidationLevel.TC_QUOTABLE
  }

  override function getQuoteRatingStyle(qType : QuoteType) : RatingStyle {
    return RatingStyle.TC_DEFAULT
  }

  override function onBeginIssueJob() {
    // Do nothing by default
  }

  override function preLoadCoverages() {}

  override function calculateTotalInsuredValue(coverages : List<Coverage>) : MonetaryAmount {
    if (CurrencyUtil.isMultiCurrencyMode()) {
      throw new IllegalStateException("For multi-currency mode, use method with currency parameter.");
    }
    return calculateTotalInsuredValue(coverages, CoverageCurrency)
  }

  override function calculateTotalInsuredValue(coverages : List<Coverage>, targetCurrency  : Currency) : MonetaryAmount {
    var tiv = MonetaryAmounts.zeroOf(targetCurrency)
    for (cov in coverages) {
      if (isUnlimited(cov)) {
        return null
      } else {
        var coverageTIV = getTIVForCoverage(cov)
        if (coverageTIV != null and coverageTIV.Currency != targetCurrency) {
          var policyRate = _line.Branch.findOrCreatePolicyFXRate(coverageTIV.Currency, targetCurrency)
          coverageTIV = FXRateUtil.convertAmount(coverageTIV, policyRate)
        }
        tiv = addNullSafe(tiv, coverageTIV)
      }
    }

    return tiv
  }

  override function getCostForCoverage(covered : Coverable, covPat : CoveragePattern) : Cost {
    throw new UnsupportedOperationException(displaykey.PolicyLineMethods.Error.MustOverride.GetCostForCoverage)
  }

  override function getAllCostsForCoverage(covered : Coverable, covPat : CoveragePattern) : List<Cost> {
    throw new UnsupportedOperationException(displaykey.PolicyLineMethods.Error.MustOverride.GetAllCostsForCoverage)
  }

  override function getWorksheetRootNode(showConditionals : boolean) : RowTreeRootNode {
    return WorksheetTreeNodeUtil.buildRootNode(_line.Branch.AllBeansWithWorksheets, showConditionals)
  }

  override property get ContainsBuildings() : boolean {
    return false
  }

  /**
   * A enumeration describing beans that exist in the "current" slice or "future" slices.
   * Note, "current" implies that an eff-dated is effective as of the period's edit effective date.
   * "future" implies effective sometime after the period's edit effective date.
   */
  enum SliceType {
    CURRENT, FUTURE
  }

  /**
   * @param scheduleMap a map of {@link #SliceType} to list of schedules.  Basically a 2 lists, one for
   *                    current items and one for future items.
   *
   * @return true if any scheduled items exist in current or future slices
   */
  protected function isCurrentAndFutureItemExistInScheduledItemMap(scheduleMap : Map<SliceType, List<ScheduledItem>>) : boolean {
    return (not (scheduleMap[SliceType.CURRENT] == null or scheduleMap[SliceType.CURRENT].Empty))
         and (not (scheduleMap[SliceType.FUTURE] == null or scheduleMap[SliceType.FUTURE].Empty))
  }

  /**
   * @param scheduleMap a map of {@link #SliceType} to list of schedules.  Basically a 2 lists, one for
   *                    current items and one for future items.
   *
   * @return true if any scheduled items exist in the current slice
   */
  protected function isCurrentItemExistsInScheduledItemMap(scheduleMap : Map<SliceType, List<ScheduledItem>>) : boolean {
    return (not (scheduleMap[SliceType.CURRENT] == null or scheduleMap[SliceType.CURRENT].Empty))
  }

  /**
   * @param scheduleMap a map of {@link #SliceType} to list of schedules.  Basically a 2 lists, one for
   *                    current items and one for future items.
   *
   * @return true if any scheduled items exist in future slices
   */
  protected function isFutureItemExistsInScheduledItemMap(scheduleMap : Map<SliceType, List<ScheduledItem>>) : boolean {
    return (not (scheduleMap[SliceType.FUTURE] == null or scheduleMap[SliceType.FUTURE].Empty))
  }

  /**
   * Get a string containing all the scheduled item names and effective date.  This list will be sorted and contain
   * only unique value for any given display name/effective date. This is useful in situations such as
   * {@link #canSafelyDeleteLocation(PolicyLocation)}
   * @param scheduleItemList a list of scheduled items to use as input for the result string.
   *
   * @return string of all the scheduled item names with effective dates
   */
  protected function getErrorMsgForScheduleItemsWithEffDate(scheduleItemList : List<ScheduledItem>) : String {
    var dateFormat = DateFormatUtil.getOutputDateFormat(DateTimeFormat.SHORT, null)
    return scheduleItemList.map(\ c -> c.DisplayName.concat(" ["+dateFormat.format((c as EffDated).EffectiveDate)+ "]")).toSet().order().join(", ")
  }

  /**
   * Get a string containing all the scheduled item names.  This list will be sorted and contain only unique values.
   * This is useful in situations such as {@link #canSafelyDeleteLocation(PolicyLocation)}
   * @param scheduleItemList a list of scheduled items to use as input for the result string.
   *
   * @return string of all the scheduled item names
   */
  protected function getErrorMsgForScheduleItems(scheduleItemList : List<ScheduledItem>) : String {
    return scheduleItemList.map(\ c -> c.DisplayName).toSet().order().join(", ")
  }

  /**
   * @return true if the coverage represents an unlimited TIV (e.g. certain WC coverages)
   * false otherwise
   */
  function isUnlimited(cov : Coverage) : boolean {
    return false
  }

  override function canDateSliceOnPropertyChange(bean : KeyableBean) : boolean {
    return true
  }

  override property get TypesToNotDateSliceOnApplyDiff() : Set<IEntityType> {
    return {}
  }

  /**
   * The TIV or Total Insurable Value for the given coverage.
   */
  final function getTIVForCoverage(cov : Coverage) : MonetaryAmount {
    var amount = doGetTIVForCoverage(cov)
    if (amount == null) {
      return null
    } else {
      return new MonetaryAmount(amount, cov.Currency)
    }
  }

  abstract function doGetTIVForCoverage(cov : Coverage) : BigDecimal

  /**
   * Perform a null-safe add operation
   * @param tiv the total insurable value
   * @param limit the limit (may be null)
   */
  protected final function addNullSafe(tiv : MonetaryAmount, limit : MonetaryAmount) : MonetaryAmount {
    return limit == null ? tiv : tiv + limit
  }

  /**
   * Perform a null-safe add operation
   * @param tiv the total insurable value
   * @param limit the limit (may be null)
   */
  protected final function addNullSafe(cAmt : BigDecimal, limit : BigDecimal) : BigDecimal {
    return limit == null ? cAmt : cAmt + limit
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
    return (not _line.Branch.MultiLine) and SideBySideBaseDataConfig != null
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
    //Do nothing by default
  }

  override function validateSubmissionWizardPolicyInfo(period : PolicyPeriod) {
    //Do nothing by default
  }

  override function updateTerritoryCodes(location: PolicyLocation) {
    // by default, make sure one TerritoryCode exists (when needed)
    if (_line.Pattern.TerritoryCodeNeeded and location.getTerritoryCodesForLine(_line.Pattern).Empty) {
      var code = new TerritoryCode(_line.Branch)
      code.PolicyLinePattern = _line.Pattern
      location.addToTerritoryCodes(code);
    }
  }

  /**
   * @return the preferred coverage currency of the branch {@link PolicyPeriod#PreferredCoverageCurrency}
   */
  protected final property get CoverageCurrency() : Currency {
    return _line.Branch.PreferredCoverageCurrency
  }

  override property get BaseStateRequired() : boolean {
    throw new UnsupportedOperationException(displaykey.PolicyLineMethods.Error.MustOverride.BaseStateRequired)
  }
}
