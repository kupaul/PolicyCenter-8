package gw.rating
uses java.math.RoundingMode
uses gw.api.profiler.PCProfilerTag

uses gw.pl.util.BigDecimalUtil
uses gw.api.domain.financials.PCFinancialsLogger
uses gw.api.util.CurrencyUtil
uses gw.financials.Prorater
uses gw.plugin.rateflow.CostDataBase
uses java.lang.IllegalStateException
uses gw.financials.Prorater
uses gw.plugin.Plugins
uses java.math.BigDecimal
uses gw.plugin.rateflow.CostDataBase
uses gw.plugin.rateflow.IRateRoutinePlugin
uses gw.rating.worksheet.domain.Worksheet
uses gw.rating.worksheet.domain.WorksheetEntry
uses gw.rating.worksheet.domain.WorksheetEntryContainer
uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException
uses java.lang.Integer
uses java.math.MathContext
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.util.Date
uses java.util.LinkedList
uses gw.pl.currency.MonetaryAmount
uses gw.financials.PolicyPeriodFXRateCache
uses gw.util.concurrent.LockingLazyVar

/**
 * The CostData class is used to represent a piece of Cost on a policy.  CostData objects are used for rating
 * in preference to actual Cost entities because that allows us to build up the graph and manipulate the
 * objects much more flexibly (including making integration easier), and only at the end do we actually
 * transform the CostData objects into actual Cost entities.  As a general rule, every Cost entity should
 * have a corresponding CostData subclass, with the hierarchy of CostData classes roughly matching
 * the hierarchy of Cost classes.  Subclasses are expected to add in their own specific fields (fks to
 * lines, coverages, vehicles, buildings, etc. as well as other values like typekeys that indicate what
 * subline a cost is for, etc.) and then to implement the abstract methods defined on this class, which
 * are generally used for persisting the CostData by copying it into the appropriate Cost entity.
 *
 * The two generic parameters on this class are the type of Cost that this CostData will be persisted as
 * and the PolicyLine that this type of CostData is associated with.
 */
@Export
abstract class CostData<S extends entity.Cost, V extends PolicyLine> extends CostDataBase implements WorksheetEntryContainer{

  /**
   * The property GuardAgainstRoundingChange controls a behavior
   * related to re-rated costs, which means it predominantly affects
   * PolicyChange and [prorata] Cancellation.   This property controls whether
   * populateCostEntity() calls shouldKeepOldRatedAmountAndLogDiscrepancies().
   * The latter method was created when the implementation of computeAmount()
   * was changed to bring its behavior in line with that of the Prorater.
   * The purpose of shouldKeepOldRatedAmountAndLogDiscrepancies() is to
   * prevent small cost changes from showing up due to differences
   * between the older behavior and the new one.
   *
   * If you put PC into production at version 7.0.2/4.0.6 or later, your policies
   * were always rated using the new computeAmount() and you should just let this
   * return false always.
   *
   * If you have a system that was put into production prior to 7.0.2 or 4.0.6,
   * however, AND you are seeing jobs with extraneous changes that are within
   * rounding error (+/- $1 if you round to dollars, for example) you may want
   * this to return true.
   *
   * There is a significant performance cost incurred when this returns true,
   * so it would probably be worthwhile to restrict the circumstances in
   * which true is returned.   For example, you might check the date range
   * to see if this cost could have been created by a version prior
   * to 7.0.2/4.0.6.  Or if you have several lines which went live on different
   * dates, you might have the rating engine for the older lines set this to true.
   * (In the latter case you might still want a date check also; a submission
   * or renewal which is bound on 7.0.2 or 4.0.6 will not benefit from the
   * rounding change check.)
   */
  property get GuardAgainstRoundingChange() : boolean {
    return _roundingGuard
  }
  // The function form above makes it easy to insert logic here or in a
  // subclass override.  A settable property allows the rating engine
  // to contain the decision logic instead.
  var _roundingGuard : boolean as GuardAgainstRoundingChange = false

  var _basis : BigDecimal as Basis
  // Optimize this for appending, because if the rate routine is long and
  // you use an ArrayList it would incur a bunch of reallocations.
  var _entries : List<WorksheetEntry> as WorksheetEntries = new LinkedList<WorksheetEntry>()


  var _actualAmount : BigDecimal as ActualAmount
  var _actualTermAmount : BigDecimal as ActualTermAmount
  var _actualAdjRate : BigDecimal as ActualAdjRate
  var _actualBaseRate : BigDecimal as ActualBaseRate

  var _standardAmount : BigDecimal as StandardAmount
  var _standardTermAmount : BigDecimal as StandardTermAmount
  var _standardAdjRate : BigDecimal as StandardAdjRate
  var _standardBaseRate : BigDecimal as StandardBaseRate
  var _subjectToReporting : boolean as SubjectToReporting

  var _numDaysInRatedTerm : int as NumDaysInRatedTerm
  var _effDate : DateTime as EffectiveDate
  var _expDate : DateTime as ExpirationDate

  var _overridable : boolean as Overridable
  var _overrideAmount : BigDecimal as OverrideAmount
  var _overrideTermAmount : BigDecimal as OverrideTermAmount
  var _overrideAdjRate : BigDecimal as OverrideAdjRate
  var _overrideBaseRate : BigDecimal as OverrideBaseRate
  var _overrideReason : String as OverrideReason
  var _overrideSource : OverrideSourceType as OverrideSource

  var _rateAmountType : RateAmountType as RateAmountType

  var _chargePattern : typekey.ChargePattern as ChargePattern
  var _chargeGroup : String as ChargeGroup

  var _roundingLevel : Integer as RoundingLevel
  var _roundingMode : RoundingMode as RoundingMode

  var _asRatedCurrency : Currency as readonly Currency

  var _calculationMethod : ProrationMethod as ProrationMethod
  var _rateBook : RateBook as RateBook

  var _settlementCurrency : Currency as readonly SettlementCurrency

  var _policyFXRate : PolicyFXRate

  final var _actualAmountBilling = new LazyFXConversion(\ -> ActualAmount)
  property get ActualAmountBilling() : MonetaryAmount    { return _actualAmountBilling.get() }
  property set ActualAmountBilling(amt : MonetaryAmount) { _actualAmountBilling.set(amt) }

  final var _actualTermAmountBilling = new LazyFXConversion(\ -> ActualTermAmount)
  property get ActualTermAmountBilling() : MonetaryAmount    { return _actualTermAmountBilling.get() }
  property set ActualTermAmountBilling(amt : MonetaryAmount) { _actualTermAmountBilling.set(amt) }

  final var _standardAmountBilling = new LazyFXConversion(\ -> StandardAmount)
  property get StandardAmountBilling() : MonetaryAmount    { return _standardAmountBilling.get() }
  property set StandardAmountBilling(amt : MonetaryAmount) { _standardAmountBilling.set(amt) }

  final var _standardTermAmountBilling = new LazyFXConversion(\ -> StandardTermAmount)
  property get StandardTermAmountBilling() : MonetaryAmount    { return _standardTermAmountBilling.get() }
  property set StandardTermAmountBilling(amt : MonetaryAmount) { _standardTermAmountBilling.set(amt) }

  final var _overrideAmountBilling = new LazyFXConversion(\ -> OverrideAmount)
  property get OverrideAmountBilling() : MonetaryAmount    { return _overrideAmountBilling.get() }
  property set OverrideAmountBilling(amt : MonetaryAmount) { _overrideAmountBilling.set(amt) }

  final var _overrideTermAmountBilling = new LazyFXConversion(\ -> OverrideTermAmount)
  property get OverrideTermAmountBilling() : MonetaryAmount    { return _overrideTermAmountBilling.get() }
  property set OverrideTermAmountBilling(amt : MonetaryAmount) { _overrideTermAmountBilling.set(amt) }

  private class LazyFXConversion extends LockingLazyVar<MonetaryAmount> {
    var _source : block() : BigDecimal

    construct(source : block() : BigDecimal) {
      _source = source
    }

    function set(val : MonetaryAmount) {
      initDirectly(val) // LazyVar has a special value for "the value is set to null"
    }

    override function init(): MonetaryAmount {
      return _source()?.ofCurrency(Currency)?.convertAndScale(_policyFXRate)
    }
  }

  /**
   * Constructs a new CostData with the specified effective and expiration dates.
   * All appropriate defaults will be applied.
   * Customers running in MultiCurrencyMode may not use this constructor.  It is recommended that customers using
   * MultiCurrencyMode delete this constructor (here and in all the subclasses of CostData) so that errors can be caught
   * at validation and not at runtime.
   */
  construct(effDate : DateTime, expDate : DateTime) {
    if (CurrencyUtil.isMultiCurrencyMode()) {
      throw new IllegalStateException(displaykey.Java.Rating.Error.CostDataInitialization)
    }
    initializeCostData(effDate, expDate, CurrencyUtil.getDefaultCurrency(), null)
  }

  /**
   * Constructs a new CostData with the specified effective and expiration dates and the currency.
   * All appropriate defaults will be applied.
   * Customers running in MultiCurrencyMode are required to use this constructor which includes Currency as an argument.
   */
  construct(effDate : DateTime, expDate : DateTime, asRatedCurrency : Currency, rateCache : PolicyPeriodFXRateCache) {
    initializeCostData(effDate, expDate, asRatedCurrency, rateCache)
  }

  /**
   * Using a private initializer instead of chaining constructors.  Chaining constructors will not allow the if statement that is being used to check for multicurrency mode.
   */
  private function initializeCostData(effDate : DateTime, expDate : DateTime, asRatedCurrency : Currency, rateCache : PolicyPeriodFXRateCache) {
    gw.pl.util.ArgCheck.nonNull(asRatedCurrency, "currencyArg")
    _asRatedCurrency = asRatedCurrency
    _settlementCurrency = rateCache?.SettlementCurrency ?: asRatedCurrency
    _policyFXRate = (asRatedCurrency == _settlementCurrency) ? null : rateCache.getPolicyFXRate(asRatedCurrency, effDate)

    ActualTermAmount = 0
    Basis = 0
    ActualAdjRate = 1
    ActualBaseRate = 1
    Overridable = true
    SubjectToReporting = false
    EffectiveDate = effDate
    ExpirationDate = expDate
    RateAmountType = "StdPremium"
    OverrideAdjRate = null
    OverrideAmount = null
    OverrideBaseRate = null
    OverrideTermAmount = null
    ChargePattern = null
    ChargeGroup = null
    OverrideReason = null
    OverrideSource = TC_MANUAL
    RoundingLevel = null
    RoundingMode = null
    ProrationMethod = TC_PRORATABYDAYS
    RateBook = null
  }

  /**
   * Constructs a new CostData based on a pre-existing Cost object.  All fields on the CostData will be populated
   * from the passed-in Cost.
   *
   * Customers running in MultiCurrencyMode may not use this constructor.  It is recommended that customers using
   * MultiCurrencyMode delete this constructor (here and in all the subclasses of CostData) so that errors can be caught
   * at validation and not at runtime.
   */
  construct(c : Cost) {
    if (CurrencyUtil.isMultiCurrencyMode()) {
      throw new IllegalStateException(displaykey.Java.Rating.Error.CostDataInitialization)
    }
    _asRatedCurrency = c.CoverageCurrency
    populateFromCostEntity(c)
  }

  /**
   * Constructs a new CostData based on a pre-existing Cost object.  All fields on the CostData will be populated
   * from the passed-in Cost.
   */
  construct(c : Cost, rateCache : PolicyPeriodFXRateCache) {
    _asRatedCurrency = c.CoverageCurrency
    _settlementCurrency = c.ActualAmountBilling?.Currency ?: rateCache?.SettlementCurrency ?: c.CoverageCurrency

    if (rateCache != null && _settlementCurrency != rateCache.SettlementCurrency) {
      PCFinancialsLogger.logWarning("Cost in database is settled in currency " +_settlementCurrency+ " but period's settlement currency is " +rateCache.SettlementCurrency)
      PCFinancialsLogger.logWarning("Billing amounts will be recomputed.")
      _policyFXRate = rateCache.getPolicyFXRate(c.CoverageCurrency, c.EffectiveDate)
    } else {
      _policyFXRate = c.PolicyFXRate
      ActualAmountBilling = c.ActualAmountBilling
      ActualTermAmountBilling = c.ActualTermAmountBilling
      StandardAmountBilling = c.StandardAmountBilling
      StandardTermAmountBilling = c.StandardTermAmountBilling
      OverrideAmountBilling = c.OverrideAmountBilling
      OverrideTermAmountBilling = c.OverrideTermAmountBilling
    }
    populateFromCostEntity(c)
  }

  // Functions that must or can be overridden by subclasses

  /**
   * Indicates whether or not this CostData should be merged as basis scalable.  If false, this CostData will
   * be merged by using the standard mergeIfCostEqual method.  If overridden to be true, then this CostData
   * will be merged using the mergeAsBasisScalableIfCostEqual method instead, and the rating engine will also
   * treat the cost differently when creating CostDatas based on a set of existing Costs.
   */
  property get MergeAsBasisScalable() : boolean {
    return false
  }

  property get ChargePattern() : ChargePattern {
    return _chargePattern == null
             ? (RateAmountType == typekey.RateAmountType.TC_TAXSURCHARGE
                  ? typekey.ChargePattern.TC_TAXES
                  : typekey.ChargePattern.TC_PREMIUM)
             : _chargePattern
  }

  /**
   * Creates a new instance of the appropriate Cost entity for this CostData.  In general it shouldn't be necessary
   * to override this method; the default behavior is to create a Cost entity of the type indicated by the generic
   * parameters of this class.
   */
  protected function createNewCost(line : V) : S {
    var constructor = S.Type.TypeInfo.getConstructor({PolicyPeriod, DateTime, DateTime})
    var cost = constructor.Constructor.newInstance({line.Branch, EffectiveDate, ExpirationDate}) as S
    cost.ActualAmount = new MonetaryAmount(BigDecimal.ZERO, _asRatedCurrency)
    cost.ActualAmountBilling = new MonetaryAmount(BigDecimal.ZERO, line.Branch.PreferredSettlementCurrency)
    return cost
  }

  /**
   * Returns the values that should be used to determine if this CostData is "the same" as another CostData.  This is analogous to the
   * CostKeys that are automatically computed for every Cost entity based on the set of columns in the database.  This method should
   * always return FixedIds instead of regular ids or actual entities, and should generally return all columns unique to this particular
   * type of cost, such as coverage or line FixedIds, sublines or split types, etc.  Note that in order for two CostDatas to be
   * considered equal (and thus potentially merged) they must both have the same key and be exactly the same type.
   */
  abstract protected property get KeyValues() : List<Object>

  /**
   * Subtypes must implement this function in order to set any subtype-specific fields on the newly-created (or pre-existing) Cost entity
   * that this CostData is being persisted to.  The base class will take care of copying over all the common fields like amounts and rates,
   * so this method merely needs to populate any fields that are unique to this subtype, such as fks to coverages or splittype typekey values.
   *
   * @param line the PolicyLine that we're creating costs for
   * @param cost the Cost entity that's
   */
  abstract protected function setSpecificFieldsOnCost(line : V, cost : S)

  /**
   * Subtypes must implement this function in order to find the candidate set of costs to potentially reuse (or clone)
   * when persisting this CostData.  This function must return a List of size 0 or 1.  For the simple case where a particular
   * thing (like a vehicle-level coverage) only ever has a single cost, this method can generally simply return something
   * like coverageVersionList.Costs.
   *
   * For cases where there could potentially be multiple Costs that live off of an entity
   * (for example, a line-level coverage that has one Cost per vehicle), this method should find the
   * appropriate cost version list.  Thus, the matching code might look more like
   * <code>
   * coverageVersionList.Costs.where(\c -> c.AllVersions.First.Vehicle.FixedID == _vehicleID)
   * </code>
   * i.e. finding the VersionList for each possible cost and then extracting out the ones (there should be 0 or 1) that match.
   *
   * In other words, <em>the implementation of this function must be consistent with the implementation of KeyValues(),
   * so that the values returned from getVersionedCosts() have Key values which match those of this CostData.</em>
   *
   * @param line the PolicyLine that we're creating costs for, which is generally used to access the associated PolicyPeriod in order
   *             to traverse the tree
   */
  abstract protected function getVersionedCosts(line : V) : List<gw.pl.persistence.core.effdate.EffDatedVersionList>

  /**
   * Loop over all the KeyValues.    DiagnosticRatingWorksheet uses this to save the values.
   */
  function eachKey(b : block(o : Object)) {
    KeyValues.each(\ k -> b(k))
  }

  // Public functions and properties

  /**
   * Populates a Cost entity based on this CostData.  Used by the rating engine classes after they've assembled a full
   * list of CostDatas and the engine needs to persist those to the database.  The resulting Cost row will may be
   * a newly-created Cost, a clone of an existing row, or maybe simply be a modification of an existing row, and it
   * will have its effective window set and all its properties initialized to the values in this CostData.
   */
  function getPopulatedCost(line : V) : S {
    var costEntity = PCProfilerTag.COST_GET_OR_CREATE.evaluate(\ -> getOrCreateCost(line.Unsliced as V))
    PCProfilerTag.COST_INIT_BASE.execute(\ -> populateCostEntity(costEntity))
    PCProfilerTag.COST_INIT_SUBTYPE.execute(\ -> setSpecificFieldsOnCost(line.Unsliced as V, costEntity))
    PCProfilerTag.COST_WORKSHEET.execute(\ -> populateRatingWorksheet(line, costEntity))
    return costEntity
  }

  /**
   * Returns the CostDataKey associated with this CostData, suitable for determining if two CostDatas are
   * "the same" and can potentially be merged.
   */
  final property get Key() : CostDataKey {
    return new CostDataKey(this, KeyValues)
  }

  /**
   * Copies the StandardBaseRate, StandardAdjRate, StandardAmount, and StandardTermAmount columns to the
   * Actual versions of those same columns.
   */
  function copyStandardColumnsToActualColumns() {
    ActualBaseRate = StandardBaseRate
    ActualAdjRate = StandardAdjRate
    ActualAmount = StandardAmount
    ActualTermAmount = StandardTermAmount
  }

  /**
   * If the specified cost is non-null, copies the OverrideBaseRate, OverrideAdjRate, OverrideAmount, and
   * OverrideTermAmount columns off of that Cost into this object.
   */
  function copyOverridesFromCost(c : Cost) {
    if (c != null and not (isCostCurrencyChangeFromPreferredCurrency(c))) {
      OverrideBaseRate = c.OverrideBaseRate
      OverrideAdjRate = c.OverrideAdjRate
      OverrideAmount = c.OverrideAmount.Amount
      OverrideTermAmount = c.OverrideTermAmount.Amount
      OverrideReason = c.OverrideReason
      OverrideSource = c.OverrideSource

      var period = c.BranchUntyped as PolicyPeriod
      var level = c.RoundingLevel ?: RoundingLevel ?: period.Policy.Product.QuoteRoundingLevel
      var mode = c.RoundingMode.ModeValue ?: RoundingMode ?: period.Policy.Product.QuoteRoundingMode
      var p = Prorater.forRounding(level, mode, c.ProrationMethod ?: ProrationMethod ?: TC_PRORATABYDAYS)
      if (OverrideAmount != null and (c.EffectiveDate != EffectiveDate or c.ExpirationDate != ExpirationDate)) {
        var proratedAmount = p.prorate(c.EffectiveDate, c.ExpirationDate, EffectiveDate, ExpirationDate, OverrideAmount)
        OverrideAmount = p.scaleAmount(proratedAmount)
      } else if (OverrideAmount != null) {
        // if DB scaled this, it won't be properly rounded
        OverrideAmount = p.scaleAmount(OverrideAmount)
      }
    }
  }

  private function isCostCurrencyChangeFromPreferredCurrency(c : Cost) : boolean {
    var period = c.BranchUntyped as PolicyPeriod
    return c.SettlementCurrency != period.PreferredSettlementCurrency or c.CoverageCurrency != period.PreferredCoverageCurrency
  }

  /**
   * Populates all the standard fields from this CostData onto the specified Cost.  This method should
   * never be invoked directly by client code, as it will bypass any subclass-specific population code.
   * Clients should always call getPopulatedCost() instead.  The one complicated bit is that the ChargePattern
   * will be computed based on the RateAmountType if it hasn't been set explicitly; all other columns are simply
   * copied directly over.
   */
  protected function populateCostEntity(cost : Cost) {
    var costCurrency = Currency
    var keepOldComputedAmounts = GuardAgainstRoundingChange
        and shouldKeepOldRatedAmountAndLogDiscrepancies(cost)

    cost.Basis = Basis

    cost.ActualBaseRate = ActualBaseRate
    cost.ActualAdjRate = ActualAdjRate
    cost.ActualTermAmount = ActualTermAmount?.ofCurrency(costCurrency)

    if (cost.ActualAmount == null or not keepOldComputedAmounts) {
      cost.ActualAmount = ActualAmount?.ofCurrency(costCurrency)
    }

    cost.ActualAmountBilling = ActualAmountBilling
    cost.ActualTermAmountBilling = ActualTermAmountBilling

    cost.StandardBaseRate = StandardBaseRate
    cost.StandardAdjRate = StandardAdjRate
    cost.StandardTermAmount = StandardTermAmount?.ofCurrency(costCurrency)
    if (cost.StandardAmount == null or not keepOldComputedAmounts) {
      cost.StandardAmount = StandardAmount?.ofCurrency(costCurrency)
    }

    cost.StandardAmountBilling = StandardAmountBilling
    cost.StandardTermAmountBilling = StandardTermAmountBilling

    cost.Overridable = Overridable
    cost.OverrideBaseRate = OverrideBaseRate
    cost.OverrideAdjRate = OverrideAdjRate
    cost.OverrideTermAmount = OverrideTermAmount?.ofCurrency(costCurrency)
    cost.OverrideAmount = OverrideAmount?.ofCurrency(costCurrency)
    cost.OverrideReason = OverrideReason
    cost.OverrideSource = OverrideSource

    cost.OverrideAmountBilling = OverrideAmountBilling
    cost.OverrideTermAmountBilling = OverrideTermAmountBilling

    cost.NumDaysInRatedTerm = NumDaysInRatedTerm
    // Don't populate the eff/expdates.  They have revisioning implications that should be handled in PC's code.
    cost.SubjectToReporting = SubjectToReporting
    cost.RateAmountType = RateAmountType
    cost.ChargePattern = ChargePattern
    cost.ChargeGroup = ChargeGroup

    cost.RoundingLevel = RoundingLevel
    cost.RoundingMode = RoundingMode.TypeKey

    cost.ProrationMethod = ProrationMethod
    cost.RateBook = RateBook

    cost.PolicyFXRate = _policyFXRate
  }

  /** Populate the rating worksheet for this cost
   *
   */
  protected function populateRatingWorksheet(line : V, cost : Cost){
    if (Plugins.get(IRateRoutinePlugin).worksheetsEnabledForLine(line.PatternCode)) {
      if (_entries.Count > 0) {
        var worksheet = new Worksheet() { :Description = "${cost}", :WorksheetEntries = _entries }
        line.Branch.addWorksheetFor(cost, worksheet)
      }
    } else {
      line.Branch.removeWorksheetFor(cost)
    }
  }

  /**
   * Extracts all of the fields from the given Cost and copies them to this object.
   */
  private function populateFromCostEntity(cost : Cost) {
    EffectiveDate = cost.EffDate
    ExpirationDate = cost.ExpDate

    Basis = cost.Basis

    ActualBaseRate = cost.ActualBaseRate
    ActualAdjRate = cost.ActualAdjRate
    ActualTermAmount = cost.ActualTermAmount.Amount
    ActualAmount = cost.ActualAmount.Amount

    StandardBaseRate = cost.StandardBaseRate
    StandardAdjRate = cost.StandardAdjRate
    StandardTermAmount = cost.StandardTermAmount.Amount
    StandardAmount = cost.StandardAmount.Amount

    Overridable = cost.Overridable
    OverrideBaseRate = cost.OverrideBaseRate
    OverrideAdjRate = cost.OverrideAdjRate
    OverrideTermAmount = cost.OverrideTermAmount.Amount
    OverrideAmount = cost.OverrideAmount.Amount
    OverrideReason = cost.OverrideReason
    OverrideSource = cost.OverrideSource

    NumDaysInRatedTerm = cost.NumDaysInRatedTerm
    SubjectToReporting = cost.SubjectToReporting
    RateAmountType = cost.RateAmountType
    ChargePattern = cost.ChargePattern
    ChargeGroup = cost.ChargeGroup
    RoundingLevel = cost.RoundingLevel
    RoundingMode = cost.RoundingMode.ModeValue
    ProrationMethod = cost.ProrationMethod
    RateBook = cost.RateBook
  }

  /**
   * Returns a debug string that contains more details about the data stored on this object.
   */
  function debugString() : String {
    return "${typeof this} EffDate: ${EffectiveDate} ExpDate: ${ExpirationDate} " +
           "[Actual: ${_actualBaseRate} : ${_actualAdjRate} : ${_actualTermAmount} : ${_actualAmount}] " +
           "[Standard: ${_standardBaseRate} : ${_standardAdjRate} : ${_standardTermAmount} : ${_standardAmount}] " +
           "[Override: ${_overrideBaseRate} : ${_overrideAdjRate} : ${_overrideTermAmount} : ${_overrideAmount}] " +
           "Basis: ${Basis} RoundingLevel: ${RoundingLevel}"
  }

  /**
   * If the passed-in CostData is effective as of the expiration date of this cost, and if
   * the other cost is equal to this, as determined by the isCostEqual method, this method will extend
   * this CostData to cover the period spanned by the other cost as well.  This method returns true
   * if the costs were merged, false otherwise.  Note that this method should not be used to merge
   * basis-scalable costs, and will throw an exception if called on a CostData where MergeAsBasisScalable
   * is true.
   */
  function mergeIfCostEqual(other : CostData) : boolean {
    assertValidMergeAttempt(other)
    if (MergeAsBasisScalable) {
      throw "Cannot call mergeIfCostEqual on a basis-scalable cost"
    }

    if (ExpirationDate == other.EffectiveDate and isCostEqual(other)) {
      ExpirationDate = other.ExpirationDate
      if (OverrideAmount != null or other.OverrideAmount != null) {
        OverrideAmount = (OverrideAmount ?: ActualAmount) + (other.OverrideAmount ?: other.ActualAmount)
      }
      return true
    } else {
      return false
    }
  }

  /**
   * If the passed-in CostData is effective as of the expiration date of this cost, and if
   * the other cost is equal to this, as determined by the isBasisScalableCostEqual method, this method will extend
   * this CostData to cover the period spanned by the other cost and add together the Basis, ActualTermAmount, and
   * ActualAmount fields.
   */
  function mergeAsBasisScalableIfCostEqual(other : CostData) : boolean {
    assertValidMergeAttempt(other)
    if (not MergeAsBasisScalable) {
      throw "Cannot call mergeAsBasisScalableIfCostEqual on a non-basis-scalable cost"
    }
    if (Basis == null or other.Basis == null or ActualAmount == null or other.ActualAmount == null or ActualTermAmount == null or other.ActualTermAmount == null) {
      throw "Cannot merge basis-scalable costs that don't have their Basis, ActualAmount and ActualTermAmount fields already set"
    }

    if (ExpirationDate == other.EffectiveDate and isBasisScalableCostEqual(other)) {
      // Extend this CostData to cover the whole period of time
      ExpirationDate = other.ExpirationDate

      // If both standard term amounts/amounts are non-null, add them together.  Otherwise, the result
      // isn't meaningful, so just null them out
      if (StandardTermAmount != null and other.StandardTermAmount != null) {
        StandardTermAmount += other.StandardTermAmount
      } else {
        StandardTermAmount = null
      }
      if (StandardAmount != null and other.StandardAmount != null) {
        StandardAmount += other.StandardAmount
      } else {
        StandardAmount = null
      }

      // If either override is present, attempt to add them together, substituting in the actual value
      // if there's no override on one of them.  That way we hopefully end up with some vaguely-valid override
      // instead of either no override or something completely invalid
      if (OverrideTermAmount != null or other.OverrideTermAmount != null) {
        OverrideTermAmount = (OverrideTermAmount ?: ActualTermAmount) + (other.OverrideTermAmount ?: other.ActualTermAmount)
      }
      if (OverrideAmount != null or other.OverrideAmount != null) {
        OverrideAmount = (OverrideAmount ?: ActualAmount) + (other.OverrideAmount ?: other.ActualAmount)
      }

      // When merging basis-scalable costs, we need to add together the basis, actual term amount, and actual amount
      // since the resulting cost won't be pro-rated based on time
      // Note:  We do this AFTER adding up standard/override amounts, since adding override amounts depends on the pre-existing actual amount,
      // so if we do this first those calculations will end up using the summed actual amount, which isn't good
      Basis = Basis + other.Basis
      ActualTermAmount += other.ActualTermAmount
      ActualAmount += other.ActualAmount

      return true
    } else {
      return false
    }
  }

  /**
   * Set the rounding level and mode to be used for prorating (and stored with the Cost entity).
   * @param level the level to round to, defined as per the specification in BigDecimal.setScale(level, mode)
   * @param mode the rounding mode to use, as defined per the specification in BigDecimal.setScale(level, mode)
   * @throws IllegalStateException if level or mode has already been set and is being changed
   */
  function setRounding(level : int, mode : RoundingMode) {
    if (RoundingLevel != null and RoundingLevel != level) {
      throw new IllegalStateException("Changing rounding level after it has been set")
    }
    if (RoundingMode != null and RoundingMode != mode) {
      throw new IllegalStateException("Changing rounding mode after it has been set")
    }
    var maxAmountScale = CurrencyUtil.getStorageScale(_asRatedCurrency)
    if (level > maxAmountScale) {
      throw new IllegalStateException("Requesting rounding level ${level} which is greater than the configured maximum ${maxAmountScale}")
    }
    RoundingLevel = level
    RoundingMode = mode
  }

  /**
   * Sets the RoundingLevel and RoundingMode fields on this CostData IF AND ONLY IF THEY HAVE NOT ALREADY
   * BEEN SET.   Then sets the ActualAmount and StandardAmount fields based on prorating the corresponding
   * term amounts, if and only if they're not null.
   *
   * @param level the level to round to, defined as per the specification in BigDecimal.setScale(level, mode)
   * @param mode the rounding mode to use, as defined per the specification in BigDecimal.setScale(level, mode)
   * @throws IllegalStateException under any of the conditions that setRounding() or updateAmountFields() does.
   */
  function updateAmountFields(level : int, mode : RoundingMode, periodStartDate : Date) {
    if (RoundingLevel == null) {
      RoundingLevel = level
    }
    if (RoundingMode == null) {
      RoundingMode = mode
    }
    updateAmountFields(periodStartDate)
  }

  /**
   * Sets the RoundingMode field on this CostData IF AND ONLY IF IT HAS NOT ALREADY
   * BEEN SET.   Then sets the ActualAmount and StandardAmount fields based on prorating the corresponding
   * term amounts, if and only if they're not null.
   *
   * @param mode the rounding mode to use, as defined per the specification in BigDecimal.setScale(level, mode)
   * @throws IllegalStateException under any of the conditions that setRounding() or updateAmountFields() does.
   */
  function updateAmountFields(mode : RoundingMode, periodStartDate : Date) {
      if (RoundingMode == null) {
        RoundingMode = mode
      }
      updateAmountFields(periodStartDate)
  }

  /**
   * Sets the ActualAmount and StandardAmount fields based on prorating the corresponding term amounts,
   * provided that each field is null.  If either field is not null on arrival, that means that it was
   * already set by the rating engine and no further action is necessary.
   *
   * This function only works if NumDaysInRatedTerm has been set to a nonzero value and both
   * EffectiveDate and ExpirationDate are set.
   * @throws IllegalStateException if the NumDaysInratedTerm, EffectiveDate or ExpirationDate are not correctly set.
   */
  function updateAmountFields(periodStartDate : Date) {
    if (NumDaysInRatedTerm == null || NumDaysInRatedTerm == 0) {
      throw new IllegalStateException("Cannot update the amount of a cost with NumDaysInRatedTerm set to null or zero")
    }
    if (EffectiveDate == null || ExpirationDate == null) {
      throw new IllegalStateException("Cannot update the amount of a cost with a null effective or expiration date")
    }

    if (ActualAmount == null) {
      // ActualTermAmount is NOT optional.  Fail fast.
      if (ActualTermAmount == null) {
        throw new IllegalStateException("Cannot compute the actual amount if the actual term amount is null")
      }
      ActualAmount = computeAmount(ActualTermAmount, periodStartDate)
    }

    // Currently, StandardTermAmount is effectively optional.
    if (StandardAmount == null and StandardTermAmount != null) {
      StandardAmount = computeAmount(StandardTermAmount, periodStartDate)
    }
  }

  /**
   * Returns the amount between the specified two dates, as a proration of the ActualAmount and rounded to
   * the specified rounding level.
   *
   * @param startDate the starting date
   * @param endDate the ending date
   * @param roundingLevel the level to round to, defined as per the specification in BigDecimal.setScale(roundingLevel)
   * @param method the rounding method to use; if null or omitted, TC_PRORATABYDAYS will be used.
   */
  function amountBetween(startDate : Date, endDate : Date, level : int, mode : RoundingMode, method : ProrationMethod = null) : BigDecimal {
    if (endDate.before(startDate)) {
      throw "The endDate ${endDate} cannot be before the startDate ${startDate}"
    }
    if (ActualAmount == null) {
      throw "amountBetween cannot be called if ActualAmount is null"
    }

    var prorater = Prorater.forRounding(level, mode, method ?: TC_PRORATABYDAYS)
    var prorateStart = (EffectiveDate > startDate ? EffectiveDate : startDate)
    var prorateEnd = (ExpirationDate < endDate ? ExpirationDate : endDate)
    return prorater.prorate(EffectiveDate, ExpirationDate, prorateStart, prorateEnd, ActualAmount)
  }

  /**
   * Finds the existing cost, if any, that this CostData maps to.  Unlike the getOrCreateCost method,
   * this method will not modify the effective window of the returned cost:  it merely finds the
   * matching cost, if any, that's effective as of this CostData's EffectiveDate.  This method
   * is primarily intended to be used for handling rating overrides.
   *
   * @param line the PolicyLine that should be searched for the associated cost
   * @return the existing cost, or null if there's no matching cost
   */
  function getExistingCost(line : V) : S {
    var costVLs = getVersionedCosts(line)
    if (costVLs.Count > 1) {
      throw "Expected at most one cost version list on ${this}; found ${costVLs.Count}."
    } else if (costVLs.Count == 1) {
      return costVLs.get(0).getVersionAsOf(EffectiveDate) as S
    } else {
      return null
    }
  }


  //
  // PRIVATE/PROTECTED SUPPORT FUNCTIONS
  //
  /**
   * Calculates the correct amount for the cost's start and end dates.
   *
   * If this is a flat rate cost, the amount is simply TermAmount.
   *
   * If it is a pro-rata amount, use a Prorater instance built with the CostData's rounding level and mode.
   * Use this to calculate the portion of TermAmount which applies for the interval [EffectiveDate, ExpirationDate)
   * Unlike Prorater.prorate (which is designed to maintain consistent totals) computeAmount
   * will always scale its result.
   */
  protected function computeAmount(termAmount : BigDecimal, periodStartDate : Date) : BigDecimal {
    switch (ProrationMethod) {
      case TC_FLAT: // flat rate -- amount is always termAmount
        return termAmount

      case TC_PRORATABYDAYS: // pro rata based on number of days
        var p = Prorater.forRounding(RoundingLevel, RoundingMode, TC_PRORATABYDAYS)
        var endDate = p.findEndOfRatedTerm(periodStartDate, NumDaysInRatedTerm)
        var proratedAmount = p.prorate(periodStartDate,  endDate, EffectiveDate, ExpirationDate, termAmount)
        return p.scaleAmount(proratedAmount)

      default: // use some other method
        return computeExtendedAmount(termAmount, periodStartDate)
    }
  }

 /**
  * add handling for unusual amounts--like nonlinear earning--by overriding this method
  * or simply by implementing a prorater which does the correct thing.
  *
  * @param termAmount The calculated amount for a standard term
  * @param periodStartDate The start date of the PolicyPeriod
  * @return The correct amount for the range [EffectiveDate, ExpirationDate}
  */
  protected function computeExtendedAmount(termAmount : BigDecimal, periodStartDate : Date) : BigDecimal {
    // assuming you've implemented a ProrationPlugin which supports ProrationMethod:
    var p = Prorater.forRounding(RoundingLevel, RoundingMode, ProrationMethod)
    var endDate = p.findEndOfRatedTerm(periodStartDate, NumDaysInRatedTerm)
    var proratedAmount = p.prorate(periodStartDate,  endDate, EffectiveDate, ExpirationDate, termAmount)
    return p.scaleAmount(proratedAmount)
  }

  /**
   * Determine if two costs are equal, assuming that neither is basis-scalable.  The costs are considered
   * equal if they have the same base, actual rates, actual term amount, number of rated days, neither has
   * an ActualAmount already set, and all overrides match.
   */
  protected function isCostEqual(other : CostData) : boolean {
    switch(false){
      case BigDecimalUtil.isEqual(Basis, other.Basis):
          logAlmostMergedCost(other, "Basis")
          return false
      case BigDecimalUtil.isEqual(ActualBaseRate, other.ActualBaseRate):
          logAlmostMergedCost(other, "ActualBaseRate")
          return false
      case BigDecimalUtil.isEqual(ActualAdjRate, other.ActualAdjRate):
          logAlmostMergedCost(other, "ActualAdjRate")
          return false
      case BigDecimalUtil.isEqual(ActualTermAmount, other.ActualTermAmount):
          logAlmostMergedCost(other, "ActualTermAmount")
          return false
      case NumDaysInRatedTerm == other.NumDaysInRatedTerm:
          logAlmostMergedCost(other, "NumDaysInRatedTerm")
          return false
      case ActualAmount == null:
          logAlmostMergedCost(other, "ActualAmount")
          return false
      case other.ActualAmount == null:
          logAlmostMergedCost(other, "ActualAmount")
          return false
      case BigDecimalUtil.isEqual(OverrideBaseRate, other.OverrideBaseRate):
          logAlmostMergedCost(other, "OverrideBaseRate")
          return false
      case BigDecimalUtil.isEqual(OverrideAdjRate, other.OverrideAdjRate):
          logAlmostMergedCost(other, "OverrideAdjRate")
          return false
      case BigDecimalUtil.isEqual(OverrideTermAmount, other.OverrideTermAmount):
          logAlmostMergedCost(other, "OverrideTermAmount")
          return false
      default:
          return true
    }
  }

  /**
   * Determines if two basis-scalable costs are equal.  The costs are considered equal if the have the same actual
   * rates, the same override rates, and it's not the case that one overrides the term amount while the other overrides
   * the actual amount.
   */
  public function isBasisScalableCostEqual(other : CostData) : boolean {
    switch(false){
      case BigDecimalUtil.isEqual(ActualBaseRate, other.ActualBaseRate):
        logAlmostMergedCost(other, "ActualBaseRate")
        return false
      case BigDecimalUtil.isEqual(ActualAdjRate, other.ActualAdjRate):
        logAlmostMergedCost(other, "ActualAdjRate")
        return false
      case BigDecimalUtil.isEqual(OverrideBaseRate, other.OverrideBaseRate):
        logAlmostMergedCost(other, "OverrideBaseRate")
        return false
      case BigDecimalUtil.isEqual(OverrideAdjRate, other.OverrideAdjRate):
        logAlmostMergedCost(other, "OverrideAdjRate")
        return false
      case !(OverrideTermAmount != null and OverrideAmount == null and other.OverrideTermAmount == null and other.OverrideAmount != null):
        logAlmostMergedCost(other, "OverrideTermAmount and OverrideAmount")
          return false
      case !(OverrideTermAmount == null and OverrideAmount != null and other.OverrideTermAmount != null and other.OverrideAmount == null):
        logAlmostMergedCost(other, "OverrideTermAmount and OverrideAmount")
          return false
      default:
        return true
    }
  }

  /**
   * Either finds an existing cost row to re-use/clone or creates a new Cost row.
   */
  private function getOrCreateCost(line : V) : S {
    var costVLs = getVersionedCosts(line)
    if (costVLs.Count > 1) {
      throw "Expected at most one cost version list on ${this}; found ${costVLs.Count}."
    }

    var cost = (costVLs.Count == 0)
            ? createNewCost(line)
            : findExistingCost(costVLs.first())

    cost = cost.getSliceUntyped(EffectiveDate) as S
    return cost
  }

  /**
   * Given a version list of existing costs to search through, this method will either return the existing
   * cost as of this CostData's EffectiveDate or, if no such cost is found, will clone the first cost row
   * in the version list.  In either case, the resulting cost will then have its effective window set.
   */
  private function findExistingCost(costVL : gw.pl.persistence.core.effdate.EffDatedVersionList) : S {
    var cost = costVL.getVersionAsOf(EffectiveDate) as S  // get the cost at the slice date
    if (cost == null) { // no cost at this slice date, so clone the first one to preserve the FixedID
      cost = (costVL.AllVersionsUntyped.first() as S).cloneUntyped() as S
    }
    cost.setEffectiveWindow(EffectiveDate, ExpirationDate)
    return cost
  }

  /**
   * Asserts that the given key is of the appropriate type.
   */
  protected final function assertKeyType(id : Key, type : Type) {
    if (!type.isAssignableFrom( id.Type )) {
      throw new IllegalArgumentException("Expected key to be of type ${type} but was of type ${id.Type}")
    }
  }

  /**
   * Asserts that it's even valid to attempt to merge the passed-in CostData with this CostData.  The merge is invalid
   * if the other CostData is null, has a different type, has a different key, is effective before this cost expires,
   * or doesn't have the same MergeAsBasisScalable flag.
   */
  private function assertValidMergeAttempt(other : CostData) {
    if (other == null) {
      throw "the other argument to mergeIfCostEqual cannot be null"
    }
    if (typeof(this) != typeof(other)) {
      throw "Cannot merge costs that are not of the same type.  This cost is a " + typeof(this) + " while the other cost is a " + typeof(other)
    }
    if (Key != other.Key) {
      throw "Cannot merge costs that price different elements.\n" + this + "\n" + other
    }
    if (other.EffectiveDate < ExpirationDate) {
      throw "The other cost passed in must be later then this cost.  This cost expires at ${ExpirationDate} but the other argument is effective as of ${other.EffectiveDate}"
    }
    if (other.MergeAsBasisScalable != MergeAsBasisScalable) {
      throw "Cannot merge costs that don't both return the same value for MergeAsBasisScalable"
    }
  }

  /**
   * Log message for the situation when it's not obvious why the costs are not merged
   */
  protected final function logAlmostMergedCost(other : CostData, field : String) {
    if (PCFinancialsLogger.isDebugEnabled()) {
      PCFinancialsLogger.logDebug ("Costs were not merged because ${field} are not equal. This cost: ${this.debugString()}. Other cost: ${other.debugString()}" )
    }
  }

  protected function getMaxAllowableDiscrepancy(rounding : Integer) : BigDecimal {
    // pow doesn't allow negative exponents with infinite precision
    // rounding level is allowed to be negative (which creates zeros before the decimal point)
    // as well as positive (significant digits after the decimal point)
    return 10.0bd.pow(-rounding, MathContext.DECIMAL128)
  }

  private function shouldKeepOldRatedAmountAndLogDiscrepancies(cost : Cost) : boolean {
    // if there is an existing cost which was created using a different version of computeAmount()
    // we want to avoid causing off-by-one-errors
    var basedOn = cost.BasedOnUntyped as Cost
    if (basedOn == null) {
      return false
    }

    var keepOldComputedAmounts =
            cost.EffectiveDate == basedOn.EffectiveDate   // only consider costs that have not
        and cost.ExpirationDate == basedOn.ExpirationDate // been lengthened or shortened by any means
        and not cost.isFieldChanged("EffectiveDate")
        and not cost.isFieldChanged("ExpirationDate")
        and cost.ActualTermAmount.Amount == ActualTermAmount
        and cost.StandardTermAmount.Amount == StandardTermAmount
        and cost.OverrideAdjRate == OverrideAdjRate
        and cost.OverrideAmount.Amount == OverrideAmount
        and cost.OverrideBaseRate == OverrideBaseRate
        and cost.OverrideTermAmount.Amount == OverrideTermAmount

    // if  keepOldComputedAmounts is true, but the difference is more than could be accounted for by
    // rounding, we will log warnings
    if (keepOldComputedAmounts) {
      var period = basedOn.BranchUntyped as PolicyPeriod
      var level = basedOn.RoundingLevel ?: RoundingLevel ?: period.Policy.Product.QuoteRoundingLevel
      var maxError = getMaxAllowableDiscrepancy(level)

      var error = (cost.ActualAmount.Amount - ActualAmount).abs()
      if (error > maxError) {
        PCFinancialsLogger.logWarning("keeping old amount ${cost.ActualAmount} on ${typeof cost} ${cost.DisplayName} because dates and term amounts match"
                                    + " but difference between that amount and ${ActualAmount} exceeds probable rounding error?")
      }

      if (cost.StandardAmount != null and StandardAmount != null) {
        error = (cost.StandardAmount.Amount - StandardAmount).abs()
        if (error > maxError) {
          PCFinancialsLogger.logWarning("keeping old standard amount ${cost.StandardAmount} on ${typeof cost} ${cost.DisplayName} because dates and term amounts match"
                                      + " but difference between that amount and ${StandardAmount} exceeds probable rounding error?")
        }
      }
    }

    return keepOldComputedAmounts
  }

  /**
   * Convenience function to scale a value that might be null.
   */
  private function scaledValue(value : BigDecimal, amountScale : AbstractRatingEngineBase.AmountKeyScale) : BigDecimal {
    if (value == null) {
      return null
    }

    // TODO: is a static reference to AbstractRatingEngine a good idea here?
    var scale = AbstractRatingEngineBase.CurrencyAmountScale.getCurrencyScale(_asRatedCurrency, amountScale)
    return value.setScale(scale, RoundingMode ?: HALF_UP)
  }

  override function toString() : String {
    return (typeof this).toString() + " for dates (" + this.EffectiveDate + "-" + this.ExpirationDate+ ") with keys " + KeyValues.toString()
  }

  // Setters for the various amount, rate, and basis fields need to set the scale on the amounts in order to match how the
  // actual entities work

  property set ActualAmount(amount : BigDecimal) {
    _actualAmount = scaledValue(amount, FinalAmountScale)
    _actualAmountBilling.clear()
  }

  property set ActualTermAmount(amount : BigDecimal) {
    _actualTermAmount = scaledValue(amount, FinalAmountScale)
    _actualTermAmountBilling.clear()
  }

  property set ActualBaseRate(rate : BigDecimal) {
    _actualBaseRate = scaledValue(rate, InterimRateScale)
  }

  property set ActualAdjRate(rate : BigDecimal) {
    _actualAdjRate = scaledValue(rate, InterimRateScale)
  }

  property set StandardAmount(amount : BigDecimal) {
    _standardAmount = scaledValue(amount, FinalAmountScale)
    _standardAmountBilling.clear()
  }

  property set StandardTermAmount(amount : BigDecimal) {
    _standardTermAmount = scaledValue(amount, FinalAmountScale)
    _standardTermAmountBilling.clear()
  }

  property set StandardBaseRate(rate : BigDecimal) {
    _standardBaseRate = scaledValue(rate, InterimRateScale)
  }

  property set StandardAdjRate(rate : BigDecimal) {
    _standardAdjRate = scaledValue(rate, InterimRateScale)
  }

  property set OverrideAmount(amount : BigDecimal) {
    _overrideAmount = scaledValue(amount, FinalAmountScale)
    _overrideAmountBilling.clear()
  }

  property set OverrideTermAmount(amount : BigDecimal) {
    _overrideTermAmount = scaledValue(amount, FinalAmountScale)
    _overrideTermAmountBilling.clear()
  }

  property set OverrideBaseRate(rate : BigDecimal) {
    _overrideBaseRate = scaledValue(rate, InterimRateScale)
  }

  property set OverrideAdjRate(rate : BigDecimal) {
    _overrideAdjRate = scaledValue(rate, InterimRateScale)
  }

  property set Basis(b : BigDecimal) {
    _basis = scaledValue(b, FinalAmountScale)
  }

}
