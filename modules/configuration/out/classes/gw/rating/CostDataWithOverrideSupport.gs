package gw.rating
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.lang.IllegalStateException
uses java.lang.IllegalArgumentException
uses java.util.Date
uses gw.api.domain.financials.PCFinancialsLogger
uses gw.financials.PolicyPeriodFXRateCache

/**
 * This class extends CostData to provide some supporting functions to make it easier to
 * handle rating for costs which can be overridden.  It deals with finding the prior cost (on
 * which the overrides are stored), keeping track of whether an override applies and at what
 * level (the base rate, the final adjusted rate, the unprorated term amount, or the final
 * prorated amount).  It also implements an approach for applying these overrides that makes
 * it much simpler for someone writing their rating logic BUT which makes some assumptions
 * about the nature of that rating algorithm and the desired behavior of overrides.  In
 * particular:
 *
 * 1. If a base rate or adjusted rate is overridden, then the calculations for the next set of
 *    results (adj rate, term amount) should really be done twice, for the "standard" values
 *    (if not overridden) vs. for the values as a consequence of the override.  It is
 *    inconvenient to code the algorithm to run twice for the 2 different starting values,
 *    however, so we make the assumption (by default) that we can run the algorithm once
 *    (using the override to get to the correct "actual" value) and then calculate the
 *    "standard" value as a ratio of the actual values.  For example, Standard Adj Rate =
 *    Standard Base Rate * (Actual Adj Rate / Actual Base Rate).  If you do not agree with
 *    this shortcut, you can calculate the standard value separately and provide it explicitly
 *    instead.
 *
 *    1a. The assumption above about using a ratio to determine the Standard values will work
 *        pretty well only if the algorithm is of the form 
 *
 *            Adj Rate = Base Rate * X 
 *
 *        (where X is any number of factors that are multipled against the Base Rate).
 *        However, if the algorithm is of some other form, for example
 *
 *            Adj Rate = (Base Rate * X) + Y
 *
 *        then applying a simple ratio will clearly not work and the only way to get an
 *        accurate Standard value will be to execute the algorithm twice to compute both
 *        overridden and non-overridden values.
 *
 *    1b. Another problem with the assumption in #1 (even if #1a is not a problem) is that
 *        there are often rounding steps within the algorithm.  These may result in getting a
 *        slightly different result when calculating using the ratio than when running through
 *        the actual calculation and rounding steps.  These differences should be small and
 *        thus may be acceptable since Standard values are used only for reference and
 *        comparison.  Actual values must be accurate according to the algorithm, so that is
 *        why we calculate the Actual values explicitly and then attempt to use a shortcut to
 *        calculate the Standard values.
 *
 * 2. This class assumes (by default) that if a rate or term amount was previously
 *    overridden, the intention is to honor the discount vs. the otherwise standard rate or
 *    term amount.  When the cost is rerated, if the standard rate on the prior cost =
 *    standard rate on the new cost, then preserve the override as is.  Otherwise, if the
 *    standard rate has changed, then set the new override rate using the same ratio:
 *
 *        New override rate = new standard rate * (Prior override rate / prior standard rate)
 *
 *    This assumption allows us to adjust the override if the policy has been changed in a way
 *    that would have affected the rate while preserving the same discount.  However, it is
 *    possible that an override is intended to survive unchanged even if the standard rate has
 *    changed.  Therefore, you should be careful about whether this assumption is really your
 *    intended behavior.  If you do not want the override to be adjusted to retain the
 *    discount %, then set PreserveOverrideDiscounts = false.
 *
 * 3. There is a convention that Actual values will be set to 0 if the cost is overridden at a
 *    later point in the algorithm.  For example, if the Adj Rate is overridden, then the Base
 *    Rate (whatever it was calculated to be) has no bearing on the amount of premium being
 *    charged.  Therefore we set it to 0 to signal that it wasn't really used.
 * 
 * The basic approach to rating using this class will look something like this:
 * 
 *    var cd = new XXCostData(effDate, expDate)  
 *    cd.init(theLine)
 *    cd.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
 *    var calcBaseRate = ...
 *    var actBaseRate = cd.setBaseRateAndHandleOverrides(calcBaseRate)
 *    var calcAdjRate = actBaseRate * ...
 *    var actAdjRate = cd.setAdjRateAndHandleOverrides(calcAdjRate)
 *    var calcTermAmount = actAdjRate * ...
 *    var actTermAmount = cd.setTermAmountAndHandleOverrides(calcTermAmount)
 *    addCost(cd) 
 * 
 * Note: by default, any overrides that are set for a policy term are copied over to a new
 * term (renewal or rewrite).  An OverrideAmount will be prorated to reflect the relative
 * length of the period of time it covered previously vs. the new period length.  Other
 * overrides are copied without scaling since they are used in calculations that lead to an
 * unprorated TermAmount which is then scaled to reflect the actual period of coverage.
 */
@Export
abstract class CostDataWithOverrideSupport<S extends entity.Cost, V extends PolicyLine> extends CostData<S, V> {

  /**
   * This class keeps a reference to the prior cost (if any) in order to get the override information
   * (as well as prior standard amounts).
   */
  protected var _priorCost : S
  
  /**
   * The level at which override was specified on the prior cost.
   */
  protected var _overrideLevel : OverrideLevel

  /**
   * In the base product, rates are rounded to more decimal places than the currency's storage level.   If the customer desires a scale other than
   * the InterimRateScale, this needs to be adjusted.
   */
  protected function getRateRoundingLevel() : int {
    return AbstractRatingEngineBase.CurrencyAmountScale.getInterimRateScale(Currency).intValue()
  }
  
  /**
   * local cache of the rounding level config that is on the policy line
   */ 
  protected var _defaultRoundingLevel : int

  /**
   * local cache of the rounding mode config that is on the policy line
   */ 
  protected var _defaultRoundingMode : RoundingMode
  
  /**
   * If true, adjust the override amount to maintain the percentage discount vs. the standard rate
   */
  var _preserveOverrideDiscounts : boolean as PreserveOverrideDiscounts = true

  /**
   * This class requires two-step initialization, because some of the methods it
   * relies on can be overridden.   To make sure it's done correctly, we keep
   * track of whether the correct initialization has been done (and make sure
   * it isn't done twice.)
   */
  protected var _initialized : boolean
  
  /**
   * Construct a new CostData spanning the given date range.
   * <em>In order to use the override support on this CostData, you will need to call init(V)</em>
   * @param effDate The effective date for this CostData
   * @param expDate The expiration date for this CostData
   */
  construct(effDate : DateTime, expDate : DateTime) {
    super(effDate, expDate)
  }
  
  /**
   * Construct a new CostData spanning the given date range.
   * <em>In order to use the override support on this CostData, you will need to call init(V)</em>
   * @param effDate The effective date for this CostData
   * @param expDate The expiration date for this CostData
   * @param c The Currency for this CostData
   */
  construct(effDate : DateTime, expDate : DateTime, c : Currency, rateCache : PolicyPeriodFXRateCache) {
    super(effDate, expDate, c, rateCache)
  }
  
  /**
   * Do class-specific initialization.  This is in a separate method rather than the constructor
   * because some of the methods it relies on can be overridden.
   * @param line The PolicyLine to which this CostData relates
   */
  public function init(line : V) {
    if (_initialized) {
      throw new IllegalStateException("Cannot call init() twice, or call it on a CostData build from an existing cost.")
    }
    
    // We set default rounding values here instead of setting the actual values on the
    // CostData because once the values on the CostData are set, they should never be changed
    // (causes error).  In case the rating coder wants to set non-default values, we want to
    // leave those values unset until later in the rating process.  However, it is convenient
    // to capture the default values for quick, repeated access to them.
    _defaultRoundingLevel = line.Branch.Policy.Product.QuoteRoundingLevel
    _defaultRoundingMode = line.Branch.Policy.Product.QuoteRoundingMode
    
    _priorCost = getExistingCost(line)
    if (_priorCost != null) {
      // This function will copy the override values from the prior cost into the override
      // fields on this CostData.  If there is an OverrideAmount, it will also prorate that
      // amount if the length of time covered by the prior cost differs from that of this
      // CostData
      copyOverridesFromCost(_priorCost)
    }
    _overrideLevel = OverrideLevel.getLevelFromCostData(this)
    
    _initialized = true
  }


  /**
   * Construct a new CostData from an existing Cost.  Unlike a "new CostData, you should <b>not</b>
   * call init(V) after calling this constructor.
   * @param c The existing Cost from which the new CostData will be initialized.
   */
   construct(c : S) {
      super(c)
      _priorCost = c
      _overrideLevel = OverrideLevel.getLevelFromCostData(this)
      _initialized = true // init() should not be called

      _defaultRoundingLevel = (c.BranchUntyped as PolicyPeriod).Policy.Product.QuoteRoundingLevel
      _defaultRoundingMode = (c.BranchUntyped as PolicyPeriod).Policy.Product.QuoteRoundingMode

      // The code which calls this constructor in AbstractRatingEngine is using it to create
      // CostDatas that represents amounts already calculated for slices of the policy that will
      // not be recalculated.  After constructing the CostData based on the entire Cost, it will
      // prorate the Amount and Basis fields if the CostData represents a shorter span of time
      // than the underlying cost did (i.e.  up to the date of the first slice that will be
      // rerated).  For all non-BasisScalable CostDatas with OverrideAmount==null, it will also
      // set the ActualAmount=null so that these CostDatas can be re-merged with other slices and
      // the ActualAmount recalculated after merging.  For ones that are overridden, it will
      // prorate the OverrideAmount to reflect the shorter period of time.  However, unless we
      // set the ActualAmount field to null, it will not re-merge these CostDatas with future
      // CostDatas that are otherwise unchanged.  We cannot override that behavior and set the
      // ActualAmount field to null here because code that follows this may recompute ActualAmount
      // as a proration of the ActualAmount on the prior cost.  See override of
      // mergeIfCostEqual() to see how we deal with this problem.

      // We also need StandardAmount set to null for non-BasisScalable CostDatas so that it will
      // get recalculated (prorated) after any splitting and merging occurs.  We *can* do that
      // here because it is not altered by any code that follows the superclass constructor.
      if (!MergeAsBasisScalable) {
        StandardAmount = null
      }
   }

  /**
   * Construct a new CostData from an existing Cost.  Unlike a "new CostData, you should <b>not</b>
   * call init(V) after calling this constructor.
   * @param c The existing Cost from which the new CostData will be initialized.
   */
  construct(c : S, rateCache : PolicyPeriodFXRateCache) {
    super(c, rateCache)
    _priorCost = c
    _overrideLevel = OverrideLevel.getLevelFromCostData(this)
    _initialized = true // init() should not be called

    _defaultRoundingLevel = (c.BranchUntyped as PolicyPeriod).Policy.Product.QuoteRoundingLevel
    _defaultRoundingMode = (c.BranchUntyped as PolicyPeriod).Policy.Product.QuoteRoundingMode

    // The code which calls this constructor in AbstractRatingEngine is using it to create
    // CostDatas that represents amounts already calculated for slices of the policy that will
    // not be recalculated.  After constructing the CostData based on the entire Cost, it will
    // prorate the Amount and Basis fields if the CostData represents a shorter span of time
    // than the underlying cost did (i.e.  up to the date of the first slice that will be
    // rerated).  For all non-BasisScalable CostDatas with OverrideAmount==null, it will also
    // set the ActualAmount=null so that these CostDatas can be re-merged with other slices and
    // the ActualAmount recalculated after merging.  For ones that are overridden, it will
    // prorate the OverrideAmount to reflect the shorter period of time.  However, unless we
    // set the ActualAmount field to null, it will not re-merge these CostDatas with future
    // CostDatas that are otherwise unchanged.  We cannot override that behavior and set the
    // ActualAmount field to null here because code that follows this may recompute ActualAmount
    // as a proration of the ActualAmount on the prior cost.  See override of
    // mergeIfCostEqual() to see how we deal with this problem.

    // We also need StandardAmount set to null for non-BasisScalable CostDatas so that it will
    // get recalculated (prorated) after any splitting and merging occurs.  We *can* do that
    // here because it is not altered by any code that follows the superclass constructor.
    if (!MergeAsBasisScalable) {
      StandardAmount = null
    }
  }

  /**
   * Calculate an approximate standard amount based on the ratio of the standard and override rates
   * (or amounts) from the prior stage of the calculation.  For example, if you are trying to get an
   * approximate StandardTermAmount, you would call
   * 
   *     StandardTermAmount = approximateStandardAmount("Standard Term Amount", OverrideTermAmount, StandardAdjRate, ActualAdjRate)
   * 
   * and the resulting calculation would therefore be
   * 
   *     StandardTermAmount = OverrideTermAmount * StandardAdjRate / ActualAdjRate
   * 
   * @param label A name for the value being calculated, used for diagnostic purposes
   * @param overrideAmt The override amount corresponding to the standard amount being calculated
   * @param priorStdRate The standard rate (or amount) from the prior stage of the calculation
   * @param priorOverride The override rate (or amount) from the prior stage of the calculation
   * @return a BigDecimal reflecting the ratio calculation, scaled appropriately for a currency amount
   * @throws IllegalStateException if either of the prior rates is null, or priorOverride (the divisor) is zero.
   */
  protected function approximateStandardAmount(label : String, overrideAmt : BigDecimal, priorStdRate : BigDecimal, priorOverride : BigDecimal) : BigDecimal {
    if (overrideAmt == 0) {
      return overrideAmt
    }

    if (priorStdRate == null) {
      throw new IllegalStateException("Cannot calculate ${label} because prior standard rate is null")
    } 
    if (priorOverride == null) {
      throw new IllegalStateException("Cannot calculate ${label} because prior override rate is null")
    }  
    if (priorOverride == 0) {
      throw new IllegalStateException("Cannot calculate ${label} because prior override rate is zero")
    }

    return (overrideAmt * priorStdRate).divide(priorOverride, RoundingLevelToUse, RoundingModeToUse)
  }

  /**
   * Calculate an approximate standard rate based on the ratio of the standard and override rates
   * from the prior stage of the calculation.  For example, if you are trying to get an
   * approximate StandardAdjRate, you would call
   * 
   *     StandardAdjRate = approximateStandardRate("Standard Adjusted Rate", OverrideAdjRate, StandardBaseRate, ActualBaseRate)
   * 
   * and the resulting calculation would therefore be
   * 
   *     StandardAdjRate = OverrideAdjRate * StandardBaseRate / ActualBaseRate
   * 
   * @param label A name for the value being calculated, used for diagnostic purposes
   * @param overrideRate The override amount corresponding to the standard rate being calculated
   * @param priorStdRate The standard rate from the prior stage of the calculation
   * @param priorOverride The override rate from the prior stage of the calculation
   * @return a BigDecimal reflecting the ratio calculation, scaled appropriately for a rate
   * @throws IllegalStateException if either of the prior rates is null, or priorOverride (the divisor) is zero.
   */
  protected function approximateStandardRate(label : String, overrideRate : BigDecimal, priorStdRate : BigDecimal, priorOverride : BigDecimal) : BigDecimal {
    if (overrideRate == 0) {
      return overrideRate
    }

    if (priorStdRate == null) {
      throw new IllegalStateException("Cannot calculate ${label} because prior standard rate is null")
    } 
    if (priorOverride == null) {
      throw new IllegalStateException("Cannot calculate ${label} because prior override rate is null")
    }  
    if (priorOverride == 0) {
      throw new IllegalStateException("Cannot calculate ${label} because prior override rate is zero")
    }

    return (overrideRate * priorStdRate).divide(priorOverride, getRateRoundingLevel(), RoundingModeToUse)
  }

  /**
   * If a standard amount changes between a prior cost and the current one, and the
   * prior one was set to a reasonable value, we are capable of doing an approximation
   * calculation (very similar to what we use to approximate Standard values, above).
   * So this method returns true only if priorStd is non-null, non-zero, and different
   * from the current amount.
   * @param priorStd the Standard amount from the prior cost
   * @param currStd the Standard amount from this CostData
   * @return true if priorStd and currStd will permit a discount-preserving calculation, false otherwise. 
   */
  protected function canPreserveDiscount(priorStd : BigDecimal, currStd : BigDecimal) : boolean {
    return priorStd != null and priorStd != 0 and priorStd.compareTo(currStd) != 0
  }

  /**
   * If we wish to preserve the discount with respect to a prior override, we need to find the amount
   * by which the standard rates have changed (as a ratio) and then multiply the prior override by that
   * ratio, i.e.
   * 
   *     (prior Override * new Standard Rate) / old Standard Rate
   * 
   * For example, if the old rate was 2.5, the override rate was 2.0, and the new rate goes down to 2.0,
   * keeping the override at 2.0 would lose the original discount.   To restore it, the calculation (as per
   * the formula above) would be
   * 
   *     2.0 * 2.0 / 2.5 = 1.6
   * 
   * @param stdRate the Standard rate from the current CostData
   * @param priorStdRate the Standard rate from the prior Cost
   * @param priorOverride the Override rate from the prior Cost
   * @return a new Override rate (appropriately rounded) which reflects the correct discount off the current Standard rate
   */
  protected function preserveDiscountRate(stdRate : BigDecimal, priorStdRate : BigDecimal, priorOverride : BigDecimal) : BigDecimal {
     return (priorOverride * stdRate).divide(priorStdRate, getRateRoundingLevel(), RoundingModeToUse)
  }

  /**
   * If we wish to preserve the discount with respect to a prior override, we need to find the amount
   * by which the standard rates have changed (as a ratio) and then multiply the prior override by that
   * ratio, i.e.
   * 
   *     (prior Override * new Standard Amount) / old Standard Amount
   * 
   * For example, if the old amount was 250, the override amount was 200, and the new rate goes down to 200,
   * keeping the override at 200 would lose the original discount.   To restore it, the calculation (as per
   * the formula above) would be
   * 
   *     200 * 200 / 250 = 160
   * 
   * @param stdAmount the Standard amount from the current CostData
   * @param priorStdAmount the Standard amount from the prior Cost
   * @param priorOverride the Override amount from the prior Cost
   * @return a new Override amount (appropriately rounded) which reflects the correct discount off the current Standard rate
   */
  protected function preserveDiscountAmount(stdAmount : BigDecimal, priorStdAmount : BigDecimal, priorOverride : BigDecimal) : BigDecimal {
    return (priorOverride * stdAmount).divide(priorStdAmount, RoundingLevelToUse, RoundingModeToUse)
  }  

  /**
   * This implementation overrides the base method in order to force the ActualAmount = null on
   * non-BasisScalable costs with OverrideAmount != null.  Even if you never set ActualAmount
   * for new CostDatas, the value will be set automatically on all CostDatas that are created
   * from prior costs for earlier slices (when rating "this slice forward").  This happens in
   * AbstractRatingEngine.extractCostDatasFromExistingCosts() whenever the
   * OverrideAmount != null.  If we don't set ActualAmount null, then the adjacent CostDatas
   * won't be merged and every time you do a mid-term change, the cost with the override will
   * end up getting split.  Setting it null here is okay because we then set it based on the
   * OverrideAmount after merging by overriding UpdateAmountFields().
   * @param other The CostData with which this one will be merged, if they are mergeable
   */
  override function mergeIfCostEqual(other : CostData) : boolean {
    if (!MergeAsBasisScalable and OverrideAmount != null and ActualAmount != null) {
      ActualAmount = null
    }

    if (!other.MergeAsBasisScalable and other.OverrideAmount != null and other.ActualAmount != null) {
      other.ActualAmount = null 
    }
    
    return super.mergeIfCostEqual(other)
  }

  /*
   * This implementation overrides base CostData logic in order to set the ActualAmount based on an
   * override after the CostDatas calculated slice by slice are merged back together wherever
   * they are essentially unchanged between adjacent slices.  It also calculates the
   * commission amounts once the premium amounts have been set.
   * @param periodStartDate The start date of the period, required in order to prorate amounts correctly
   */
  override function updateAmountFields(periodStartDate : Date) {
    if (OverrideAmount != null and ActualAmount == null) {
      ActualAmount = OverrideAmount
    }
    super.updateAmountFields(periodStartDate)
  }
  
  override function copyStandardColumnsToActualColumns() {
    if (Overridable and _initialized) {
      // If we are planning to use the methods in this extended class, 
      // copying the standard columns to the actual ones would just undo our work!
      PCFinancialsLogger.logWarning("When using CostDataWithOverrideSupport you should not call copyStandardColumnsToActualColumns()")
    }
    super.copyStandardColumnsToActualColumns()
  }

  
  /**
   * Set StandardBaseRate and ActualBaseRate, taking into account any overrides from a prior cost.  
   * Return the base rate value that should be used for further rating calculations, which 
   * might be different from the value passed in if there is an override.  If PreserveOverrideDiscounts 
   * is true, then the function will alter a prior base rate override to preserve the same % discount
   * (override/standard) as on the prior cost; otherwise it will preserve the prior override value
   * even if the standard base rate is different than before.
   * @param calcBaseRate the calculated base rate, which will become the StandardBaseRate.
   * @return The base rate to be used for further calculations (could be StandardBaseRate or OverrideBaseRate)
   * @throws IllegalArgumentException if calcBaseRate is null
   * @throws IllegalStateException if init(V) needed to be called and wasn't
   */
  function setBaseRateAndHandleOverrides(calcBaseRate : BigDecimal) : BigDecimal {
    if (Overridable and not _initialized) {
      throw new IllegalStateException("init() should have been called before using this CostData to do overrides")
    }
      
    if (calcBaseRate == null) {
      throw new IllegalArgumentException("Cannot use function setBaseRateAndHandleOverrides to set BaseRate to null.")
    }

    StandardBaseRate = calcBaseRate

    if (_overrideLevel <= OverrideLevel.OVERRIDE_NONE) {
      // Deal with the common case where there are no overrides
      ActualBaseRate = calcBaseRate
      return ActualBaseRate
    } else if (_overrideLevel == OverrideLevel.OVERRIDE_BASERATE) {
      // Override is at this level.
      
      if (PreserveOverrideDiscounts and canPreserveDiscount(_priorCost.StandardBaseRate, StandardBaseRate)){ 
        OverrideBaseRate = preserveDiscountRate(StandardBaseRate, _priorCost.StandardBaseRate, _priorCost.OverrideBaseRate)
      }
 
      ActualBaseRate = OverrideBaseRate
      return ActualBaseRate
    } else {   
      // Overridden at a later stage
      ActualBaseRate = 0       // Will not be used in determining the final premium anyway
      return StandardBaseRate  // Use this value for further calculations of Standard Amounts
    }
  }
  
  /**
   * Equivalent to setAdjRateAndHandleOverrides(calcAdjRate, null)
   * @see #setAdjRateAndHandleOverrides(BigDecimal, BigDecimal)
   */
  function setAdjRateAndHandleOverrides(calcAdjRate : BigDecimal) : BigDecimal {
    return setAdjRateAndHandleOverrides(calcAdjRate, null)
  }

  /**
   * Set StandardAdjRate and ActualAdjRate, taking into account any overrides from a prior cost.  
   * Return the adj rate value that should be used for further rating calculations, which 
   * might be different from the value passed in if there is an override.  If PreserveOverrideDiscounts 
   * is true and the prior values are set properly (@see canPreserveDiscount(BigDecimal, BigDecimal))
   * then the function will alter the prior adj rate override to preserve the same % discount
   * (override/standard) as on the prior cost. (@see preserveDiscountedRate(BigDecimal, BigDecimal, BigDecimal))
   * Otherwise it will preserve the prior override even if the standard adj rate is different than before.  
   * 
   * If explicitStandardRate is null and the base rate was overridden, StandardAdjRate
   * will be approximated (@see approximateStandardRate(String, BigDecimal, BigDecimal, BigDecimal)) 
   * The approximation used is based on the assumption that the ratios are the same, i.e.
   *
   *     (Standard Adj Rate / Standard Base Rate) = (Actual Adj Rate / Actual Base Rate)
   *
   * If this is not a good assumption, then the caller should provide an explicit value for
   * the Standard Adj Rate rather than leaving it null.
   * @param calcAdjRate The calculated Adjusted Rate, which <b>may</b> become the Standard Adjusted Rate
   * @param explicitStandardAdjRate value for the standard adjusted rate if Base Rate is overridden
   * @return the adjusted rate be used for further calculations
   * @throws IllegalArgumentException if calcAdjRate is null
   * @throws IllegalStateException if init(V) needed to be called
   * @throws IllegalStateException if calculation of StandardAdjRate cannot be performed
   */
  function setAdjRateAndHandleOverrides(calcAdjRate : BigDecimal, 
                                        explicitStandardAdjRate : BigDecimal) : BigDecimal {
    if (Overridable and not _initialized) {
      throw new IllegalStateException("init() should have been called before using this CostData to do overrides")
    }

    if (calcAdjRate == null) {
      throw new IllegalArgumentException("Cannot use function setAdjRateAndHandleOverrides to set AdjRate to null.")
    }

    if (_overrideLevel <= OverrideLevel.OVERRIDE_NONE) {
      // Deal with the common case where there are no overrides
      StandardAdjRate = calcAdjRate
      ActualAdjRate = StandardAdjRate
      return ActualAdjRate
    } else if (_overrideLevel < OverrideLevel.OVERRIDE_ADJRATE) {  
      // Overridden prior to this level (i.e. for Base Rate)
      ActualAdjRate = calcAdjRate
 
      if (explicitStandardAdjRate != null) {
        StandardAdjRate = explicitStandardAdjRate
      } else {
        StandardAdjRate = approximateStandardRate("Standard Adjusted Rate", ActualAdjRate, StandardBaseRate, ActualBaseRate)
      }

      return ActualAdjRate
    } else if (_overrideLevel == OverrideLevel.OVERRIDE_ADJRATE) {  
      // Override is at this level
      StandardAdjRate = calcAdjRate

      if (PreserveOverrideDiscounts and canPreserveDiscount(_priorCost.StandardAdjRate, StandardAdjRate)) { 
        OverrideAdjRate = preserveDiscountRate(StandardAdjRate, _priorCost.StandardAdjRate, _priorCost.OverrideAdjRate)
      }

      ActualAdjRate = OverrideAdjRate
      return ActualAdjRate
    } else {
      // Overridden at a later stage
      StandardAdjRate = calcAdjRate
      ActualAdjRate = 0        // Will not be used in determining the final premium anyway
      return StandardAdjRate   // Use this value for further calculations of Standard Amounts
    }
  }
  
  /**
   * Equivalent to setTermAmountAndHandleOverrides(calcTermAmt, null)
   * @see #setTermAmountAndHandleOverrides(BigDecimal, BigDecimal)
   */
  function setTermAmountAndHandleOverrides(calcTermAmt : BigDecimal) : BigDecimal {
    return setTermAmountAndHandleOverrides(calcTermAmt, null)
  }

  /**
   * Set StandardTermAmount and ActualTermAmount, taking into account any overrides from a prior cost.  
   * return the term amount value that should be used for further rating calculations, which might be
   * different from the value passed in if there is an override.  If PreserveOverrideDiscounts 
   * is true and the prior values are set properly (@see canPreserveDiscount(BigDecimal, BigDecimal))
   * then the function will alter a prior term amount
   * override to preserve the same % discount (override/standard) as on the prior cost. 
   * (@see preserveDiscountedRate(BigDecimal, BigDecimal, BigDecimal))
   * Otherwise it will preserve the prior override even if the standard term amount is different
   * than before.  
   * 
   * If explicitStandardTermAmount is null and the cost was overridden at an
   * earlier stage, StandardTermAmount
   * will be approximated (@see approximateStandardAmount(String, BigDecimal, BigDecimal, BigDecimal)) 
   * The approximation used is based on the assumption that the ratios are the same, i.e.
   *
   *     (Standard Term Amount / Standard Adj Rate) = (Actual Term Amount / Actual Adj Rate) 
   *
   * If this is not a good assumption, then the caller should provide an explicit value for the 
   * Standard Term Amount rather than leaving it null.
   * @param calcTermAmount calculated Term Amount, which <b>may</b> become StandardTermAmount
   * @param explicitStandardTermAmt Value for StandardTermAmount if BaseRate or AdjRate was overridden
   * @return The value for TermAmount that should be used for further calculation
   * @throws IllegalArgumentException if calcTermAmount is null
   * @throws IllegalStateException if init(V) needed to be called
   * @throws IllegalStateException if calculation of StandardTermAmt cannot be performed
   */
  function setTermAmountAndHandleOverrides(calcTermAmt : BigDecimal, 
                                           explicitStandardTermAmt : BigDecimal) : BigDecimal {
    if (Overridable and not _initialized) {
      throw new IllegalStateException("init() should have been called before using this CostData to do overrides")
    }

    if (calcTermAmt == null) {
      throw new IllegalArgumentException("Cannot use function setTermAmountAndHandleOverrides to set TermAmount to null.")
    }

    if (_overrideLevel <= OverrideLevel.OVERRIDE_NONE) {
      // Deal with the common case where there are no overrides
      StandardTermAmount = calcTermAmt
      ActualTermAmount = StandardTermAmount
      return ActualTermAmount
    } else if (_overrideLevel < OverrideLevel.OVERRIDE_TERMAMOUNT) {  
      // Overridden prior to this level (i.e. for Base Rate or Adj Rate)
      ActualTermAmount = calcTermAmt

      if (explicitStandardTermAmt != null) {
        StandardTermAmount = explicitStandardTermAmt
      } else {  
        StandardTermAmount = approximateStandardAmount("Standard Term Amount", ActualTermAmount, StandardAdjRate, ActualAdjRate)
      }

      return ActualTermAmount
    } else if (_overrideLevel == OverrideLevel.OVERRIDE_TERMAMOUNT) {  
      // Overriden at this level
      StandardTermAmount = calcTermAmt

      if (PreserveOverrideDiscounts and canPreserveDiscount(_priorCost.StandardTermAmount, StandardTermAmount)) {
        OverrideTermAmount = preserveDiscountAmount(StandardTermAmount, _priorCost.StandardTermAmount, _priorCost.OverrideTermAmount)
      }
      
      ActualTermAmount = OverrideTermAmount
      return ActualTermAmount
    } else {   
      // Overridden later in the algorithm (i.e. prorated Amount is overridden)
      StandardTermAmount = calcTermAmt
      ActualTermAmount = 0        // Will not be used in determining the final premium anyway

      // This CostData will need to have OverrideAmount set.  Because the rating engine is
      // going to rate in slices and then try to recombine the individual CostDatas for each
      // slice, we need to prorate the OverrideAmount by the length of the slice so that when
      // the slices are recombined, they will add up to the correct amount.  This proration
      // happened earlier as part of the copyOverridesFromCost() function.

      // For non-BasisScalable costs, you might also expect to set the ActualAmount field
      // here, but that is a bad idea.  If ActualAmount != null, then the CostDatas for the
      // different slices will not get merged back together if they are unchanged.  The result
      // will be multiple costs (split by slice) for no apparent reason.  Instead, we will
      // leave ActualAmount null at this point and then override the UpdateAmountFields()
      // logic (for non-BasisScalable costs only) to set the overridden ActualAmount later,
      // after the CostDatas are merged back together.  Note: you DO want to set ActualAmount
      // on BasisScalable costs, but there is a separate function provided for doing this
      // explicitly.

      return StandardTermAmount // Use this value for further calculations of Standard Amounts
    }
  }
  
  /**
   * Equivalent to setAmountAndHandleOverrides(calcAmt, null)
   * @see #setAmountAndHandleOverrides(BigDecimal, BigDecimal)
   */
  function setAmountAndHandleOverrides(calcAmt : BigDecimal) : BigDecimal {
    return setAmountAndHandleOverrides(calcAmt, null)
  }

  /**
   * Set StandardAmount and ActualAmount, taking into account any overrides from a prior cost.  
   * Return the actual amount value, which might be different from the value passed in if there is an override.
   *
   * This function should only be used for BasisScalable CostDatas because it is okay to set the
   * ActualAmount directly on these.  For non-BasisScalable CostDatas, you should leave ActualAmount
   * null and let it be set automatically by prorating TermAmount after merging together
   * CostDatas from multiple slices.
   *
   * If explicitStandardAmount is null and the cost was overridden at anearlier stage, StandardAmount
   * will be approximated. 
   * The approximation used is based on the assumption that the ratios are the same.
   * It will try to use a ratio of TermAmounts first 
   * (@see approximateStandardAmount(String, BigDecimal, BigDecimal, BigDecimal)) 
   * but these values may not be set for BasisScalable costs, 
   * in which cse it will try to use a ratio of AdjRates 
   * (@see approximateStandardRate(String, BigDecimal, BigDecimal, BigDecimal))  
   * If neither values are valid for calculating a ratio, then it will leave StandardAmount == null,
   *  which is acceptable since it is not used for any further calculations.  
   * 
   * If using a ratio is not a good assumption, then the caller should provide an explicit value 
   * for the Standard Amount rather than leaving it null.
   * @param calcAmount calculated Amount, which <b>may</b> become StandardAmount
   * @param explicitStandardAmt Value for StandardAmount if one of the other values was overridden
   * @return The value for Amount that should be used for further calculation
   * @throws IllegalArgumentException if calcAmount is null
   * @throws IllegalStateException if init(V) needed to be called
   */
  function setAmountAndHandleOverrides(calcAmt : BigDecimal, 
                                       explicitStandardAmt : BigDecimal) : BigDecimal {
    if (Overridable and not _initialized) {
      throw new IllegalStateException("init() should have been called before using this CostData to do overrides")
    }

    if (calcAmt == null) {
      throw new IllegalArgumentException("Cannot use function setAmountAndHandleOverrides to set Amount to null.")
    }

    if (!MergeAsBasisScalable) {
      throw new IllegalStateException("Function setAmountAndHandleOverrides should only be used for BasisScalable costs.")
    }

    // Make sure the input amount is properly rounded.
    calcAmt = scaleValue(calcAmt, null)
    
    if (_overrideLevel <= OverrideLevel.OVERRIDE_NONE) {
      // Deal with the common case where there are no overrides
      StandardAmount = calcAmt
      ActualAmount = calcAmt
      return ActualAmount
    } else if (_overrideLevel < OverrideLevel.OVERRIDE_AMOUNT) { 
      // Overridden prior to this level 
      ActualAmount = calcAmt
      
      if (explicitStandardAmt != null) {
        StandardAmount = explicitStandardAmt
      } else if (StandardTermAmount != null and ActualTermAmount != null and ActualTermAmount != 0) {
        StandardAmount = approximateStandardAmount("Standard Amount", ActualAmount, StandardTermAmount, ActualTermAmount)
      } else if (StandardAdjRate != null and ActualAdjRate != null and ActualAdjRate != 0) {
        StandardAmount = approximateStandardAmount("Standard Amount", ActualAmount, StandardAdjRate, ActualAdjRate)
      } else {
        // Otherwise, leave the StandardAmount field null
      }

      return ActualAmount    
    } else if (_overrideLevel == OverrideLevel.OVERRIDE_AMOUNT) {  
      // Overridden at this level
      StandardAmount = calcAmt
      ActualAmount = OverrideAmount
      return ActualAmount
    } else {
      // End of the line...we should never get here unless someone adds more levels to OverrideLevel
      // and forgets to handle one.
      throw new IllegalStateException("Found override level ${_overrideLevel} which is not handled.")
    }
  }

  /**
   * Scale a BigDecimal value.   The scale precision used will be, in order:
   * 
   *   a) an explicitly given scale value, or
   *   b) the RoundingLevel on this CostData, or 
   *   c) default RoundingLevel for the line
   * 
   * @param value the value that will be scaled
   * @param scale the number of digits of precision (@see BigDecimal#setScale(int, RoundingMode))
   * @return the correctly scaled value (or null if value is null)
   */
  function scaleValue(value : BigDecimal, scale : int) : BigDecimal {
    if (value == null) {
      return null 
    } else {
      return value.setScale(scale != null ? scale : RoundingLevelToUse, RoundingModeToUse)
    }
  }
  
  /**
   * @return this.RoundingLevel if it is set; otherwise return _defaultRoundingLevel, which comes from the line
   */
  property get RoundingLevelToUse() : int {
    return this.RoundingLevel ?: _defaultRoundingLevel
  }

  /**
   * @return this.RoundingMode if it is set; otherwise return _defaultRoundingMode, which comes from the line
   */
  property get RoundingModeToUse() : RoundingMode {
    return this.RoundingMode ?: _defaultRoundingMode
  }
}
