package gw.plugin.productmodel.impl

uses gw.pl.util.ArgCheck
uses gw.api.productmodel.ConditionPattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.ExclusionPattern
uses gw.api.productmodel.ModifierPattern
uses gw.api.productmodel.ModifierPatternBase
uses gw.api.productmodel.Product
uses gw.job.JobProcess
uses gw.plugin.productmodel.IReferenceDatePlugin
uses gw.internal.ext.org.apache.commons.collections.keyvalue.MultiKey

uses java.lang.IllegalStateException
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.ConditionPattern
uses gw.api.productmodel.ExclusionPattern

/**
 * Contains methods for evaluating the type of date to use
 * to calculate the reference date on a given object.
 */

@Export
class ReferenceDatePlugin implements IReferenceDatePlugin {
  final var _lookupHandler = new RefDateTypeLookupHandler()

  /**
   * @param line The policy line
   * @param state The state
   * @return The type of reference date to use for the given policy line and state.
   */
  override function getReferenceDateType(line : PolicyLine, state : Jurisdiction) : ReferenceDateType {
    var criteria = RefDateTypeCriteriaBuilder.createCriteria(line, state)
    return _lookupHandler.lookupReferenceDateType(criteria)
  }

  /**
   * @param period The policy period
   * @param state The state
   * @return The type of reference date to use for the given period and state.
   */
  override function getReferenceDateType(period : PolicyPeriod, state : Jurisdiction) : ReferenceDateType {
    var criteria = RefDateTypeCriteriaBuilder.createCriteria(period, state)
    return _lookupHandler.lookupReferenceDateType(criteria)
  }

  /**
   * This method is used for calculating the availability of a product such as
   * for new submissions. It must be treated differently since it exists outside
   * the revisioning tree and little context exists from which to work, e.g.,
   * no UWCompany on which to restrict.
   *
   * @param product The product
   * @param uwCompany The underwriting company, if assigned
   * @param state The state
   * @return The type of reference date to use for the given product and state.
   */
  override function getReferenceDateType(product : Product, uwCompany : UWCompany, state : Jurisdiction) : ReferenceDateType {
    var criteria = RefDateTypeCriteriaBuilder.createCriteria(product, uwCompany, state)
    return _lookupHandler.lookupReferenceDateType(criteria)
  }

  /**
   * Resets any state information the plugin uses. In the default configuration,
   * this should be called whenever the RefDateTypeLookup table changes in the server.
   * This should only happen on deployment of system table changes from Studio to a live server.
   */
  override function reset() : void {
    _lookupHandler.reset()
  }

  /**
   * Returns the lookup date used to determine if the given coverage pattern is available for
   * the given coverable. If a coverage for the pattern is already bound on the policy, then
   * this returns the lookup date originally used to determine that the pattern was available
   * (which is persisted in the coverage's ReferenceDateInternal field). Otherwise the lookup
   * date is computed based on the coverable's data.
   */
  override function getCoverageReferenceDate(coveragePattern : CoveragePattern, coverable : Coverable) : DateTime {
    var refDateInternal = coverable.getCoverage(coveragePattern).ReferenceDateInternal
    if (refDateInternal != null) {
      return refDateInternal
    }

    return getCoverageExclusionConditionReferenceDate(coveragePattern.ReferenceDateByType, coverable)
  }

  /**
   * Returns the lookup date used to determine if the given exclusion pattern is available for
   * the given coverable. If a exclusion for the pattern is already bound on the policy, then
   * this returns the lookup date originally used to determine that the pattern was available
   * (which is persisted in the exclusion's ReferenceDateInternal field). Otherwise the lookup
   * date is computed based on the coverable's data.
   */
  override function getExclusionReferenceDate(exclusionPattern : ExclusionPattern, coverable : Coverable) : DateTime {
    var refDateInternal = coverable.getExclusion(exclusionPattern).ReferenceDateInternal
    if (refDateInternal != null) {
      return refDateInternal
    }

    return getCoverageExclusionConditionReferenceDate(exclusionPattern.ReferenceDateByType, coverable)
  }

  /**
   * Returns the lookup date used to determine if the given condition pattern is available for
   * the given coverable. If a condition for the pattern is already bound on the policy, then
   * this returns the lookup date originally used to determine that the pattern was available
   * (which is persisted in the condition's ReferenceDateInternal field). Otherwise the lookup
   * date is computed based on the coverable's data.
   */
  override function getConditionReferenceDate(conditionPattern : ConditionPattern, coverable : Coverable) : DateTime {
    var refDateInternal = coverable.getCondition(conditionPattern).ReferenceDateInternal
    if (refDateInternal != null) {
      return refDateInternal
    }

    return getCoverageExclusionConditionReferenceDate(conditionPattern.ReferenceDateByType, coverable)
  }

  private function jobIsQuoting(period : PolicyPeriod) : boolean {
    return periodHasJob(period) and period.JobProcess.IsQuoting
  }

  private function periodHasJob(period : PolicyPeriod) : boolean {
    return period.Job != null
  }

  /**
   * Performance note:
   * During a quote, cache the ReferenceDates.
   * For a "DefinedObject" type, cache the ReferenceDates keyed by PolicyLine and State
   * For a "PolicyTerm" type, cache the ReferenceDate for the PolicyTerm
   */
  private function getCoverageExclusionConditionReferenceDate(patternRefDateType : typekey.ReferenceDateByType,coverable : Coverable) : DateTime {
    if (patternRefDateType == "ApplicableObject") {
      return coverable.CoverableReferenceDate
    }

    var policyLine = coverable.PolicyLine
    var period = policyLine.Branch
    var key : MultiKey
    var refDate : DateTime
    var jobProcess : JobProcess
    if (periodHasJob(period)) {
      jobProcess = period.JobProcess
    }

    if (jobIsQuoting(period)) {
      if (patternRefDateType == "DefinedObject") {
        key = new MultiKey(policyLine, coverable.CoverableState)
      } else /* "PolicyTerm" */ {
        key = new MultiKey("PolicyTerm", period.FirstPeriodInTerm)
      }
      /**
       * Perform lookup
       */
      refDate = jobProcess.BeanCache.get(key) as DateTime
      if (refDate != null) {
        return refDate
      }
    }

    if (patternRefDateType == "DefinedObject") {
      refDate = getReferenceDateForCurrentJobFromLine(policyLine, coverable.CoverableState)
    } else /* "PolicyTerm" */ {
      var firstPeriod = period.FirstPeriodInTerm
      refDate = getReferenceDateForCurrentJobFromPeriod(firstPeriod, firstPeriod.BaseState)
    }

    if (jobIsQuoting(period)) {
      jobProcess.BeanCache.put(key, refDate)
    }
    return refDate
  }

  /**
   * Returns the lookup date used to determine if the given modifier pattern is available for
   * the given modifiable. If a modifier for the pattern is already bound on the policy, then
   * this returns the lookup date originally used to determine that the pattern was available
   * (which is persisted in the modifier's ReferenceDateInternal field). Otherwise the lookup
   * date is computed based on the modifiable's data.
   */
  override function getModifierReferenceDate(modifierPattern : ModifierPatternBase, modifiable : Modifiable) : DateTime {
    var refDateInternal = modifiable.getModifier(modifierPattern).ReferenceDateInternal
    if (refDateInternal != null) {
      // Use persisted reference date if available
      return refDateInternal
    } else if (modifiable.ModifiableLine == null) {
      // Use policy period reference date for product-level modifiers
      var policyPeriod = modifiable.ModifiablePolicyPeriod
      return getReferenceDateForCurrentJobFromPeriod(policyPeriod, policyPeriod.BaseState)
    }

    var lineModifierPattern = modifierPattern as ModifierPattern
    var patternRefDateType = lineModifierPattern.ReferenceDateByType
    if (patternRefDateType == "ApplicableObject") {
      return modifiable.ModifiableReferenceDate
    }

    var policyLine = modifiable.ModifiableLine
    var period = modifiable.ModifiablePolicyPeriod
    var jobProcess : JobProcess
    if (periodHasJob(period)) {
      jobProcess = period.JobProcess
    }
    var key : MultiKey
    var refDate : DateTime

    if (jobIsQuoting(period)) {
      if (patternRefDateType == "DefinedObject") {
        key = new MultiKey(policyLine, modifiable.ModifiableState)
      } else /* "PolicyTerm" */ {
        key = new MultiKey("PolicyTerm", period.FirstPeriodInTerm)
      }
      /**
       * Perform lookup
       */
      refDate = jobProcess.BeanCache.get(key) as DateTime
      if (refDate != null) {
        return refDate
      }
    }

    if (patternRefDateType == "DefinedObject") {
      refDate = getReferenceDateForCurrentJobFromLine(policyLine, modifiable.ModifiableState)
    } else /* "PolicyTerm" */ {
      var firstPeriod = period.FirstPeriodInTerm
      refDate = getReferenceDateForCurrentJobFromPeriod(firstPeriod, firstPeriod.BaseState)
    }

    if (jobIsQuoting(period)) {
      jobProcess.BeanCache.put(key, refDate)
    }
    return refDate
  }


  // Implementation abstracted from PolicyPeriodImpl.getReferenceDateForCurrentJob for performance...
  private function getReferenceDateForCurrentJobFromPeriod(period : PolicyPeriod, state : Jurisdiction) : DateTime {
    return getActualPeriodReferenceDate(period, getReferenceDateType(period, state), state)
  }

  private function getActualPeriodReferenceDate(period : PolicyPeriod, dateType : ReferenceDateType, state : Jurisdiction) : DateTime {
    var referenceDateForLookup = getPeriodReferenceDate(period, dateType, state)
    if (referenceDateForLookup == null) {
      throw new IllegalStateException("No reference date found for state " + state + ", policy " + period + " and UW company " + period.getUWCompany())
    }

    return referenceDateForLookup
  }

  // Implementation abstracted from PolicyLineImpl.getReferenceDateForCurrentJob for performance...
  private function getReferenceDateForCurrentJobFromLine(policyLine : PolicyLine, state : Jurisdiction) : DateTime{
    var refDateType = getReferenceDateType(policyLine, state)
    return getActualPeriodReferenceDate(policyLine.Branch, refDateType, state)
  }

  override function getPeriodReferenceDate(period : PolicyPeriod, dateType : ReferenceDateType, state : Jurisdiction) : DateTime {
    ArgCheck.nonNull(period, "period")
    ArgCheck.nonNull(dateType, "dateType")

    var retVal : DateTime
    if (dateType == "EffectiveDate") {
      retVal = period.EditEffectiveDate
    } else if (dateType == "WrittenDate") {
      retVal = period.WrittenDate
    } else if (dateType == "RatingPeriodDate") {
      retVal = null
      if (period.WorkersCompLine != null and state != null) {
        var line = period.WorkersCompLine
        var jurisdiction = line.getJurisdiction(state)
        if (jurisdiction != null) {
          retVal = jurisdiction.getPriorRatingDate(line.Branch.EditEffectiveDate.trimToMidnight())
        } else {
          retVal = line.Branch.EditEffectiveDate
        }
      } else {
          throw new IllegalStateException("Rating period reference dates are only supported for Worker's Comp lines.")
      }
    } else {
      throw new IllegalStateException("Unhandled ReferenceDateType " + dateType.Code)
    }

    // Customers may not set dates the way we expect them to. It seems reasonable that this calculator
    // provide a non-null reference date in the off chance that the date we prefer to use has not been
    // set. This should be the rare exception, and customers who want stable availability checks
    // should set the correct dates before checking availability (e.g., syncComputedValues).
    //
    // The policy period effective date should never be null during valid operation, and NPE will happen
    // if policy period is missing. Written date can be null, in which case "today" is a reasonable
    // backup. The method to get the rating period date either comes up with a date or throws, so that
    // should be covered.
    //
    // In other words, this method should only rarly return "today", probably during some kind of entity
    // setup that happens before the real values are recalculated (once our preferred dates have been set).

    return retVal != null ? retVal.trimToMidnight() : DateTime.Today
  }
}
