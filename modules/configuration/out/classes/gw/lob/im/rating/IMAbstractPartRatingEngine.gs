package gw.lob.im.rating

uses gw.api.domain.financials.PCFinancialsLogger
uses gw.rating.CostData
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.util.ArrayList
uses gw.financials.PolicyPeriodFXRateCache

@Export
class IMAbstractPartRatingEngine {

  protected var _line : InlandMarineLine
  protected var _branch : PolicyPeriod
  protected var _costDatas : List<CostData> = new ArrayList<CostData>()
  protected var _rateCache : PolicyPeriodFXRateCache as readonly RateCache
  
  property get RatingCurrency() : Currency {
    return _branch.PreferredCoverageCurrency  
  }

  construct(rateCache : PolicyPeriodFXRateCache) {
    _rateCache = rateCache
  }
  
  protected function logDebugRatedCostData(costData : CostData) {
    PCFinancialsLogger.logDebug("Rated ${costData.debugString()} for ${costData}")
  }
  
  protected function roundingLevel() : int {
    return _line.Branch.Policy.Product.QuoteRoundingLevel
  }
  
  protected function baseRatingDate() : DateTime {
    return _line.Branch.FirstPeriodInTerm.getReferenceDateForCurrentJob(_line.BaseState)
  }
  
  protected function effectiveDates() : List<DateTime> {
    return _branch.EffectiveDatesForRating
  }

  protected function nextSliceDateAfter(start : DateTime) : DateTime {
    var ret = effectiveDates().firstWhere(\ d -> d > start)
    return ret == null ? _branch.PeriodEnd : ret
  }

  protected function applyOverrides(cost : Cost, costData : CostData, asPercentage : boolean) {
    costData.copyStandardColumnsToActualColumns()
    if (costData.Overridable) {
      costData.copyOverridesFromCost(cost)
      computeValuesFromCostOverrides(cost, costData, asPercentage)
    }
    logDebugRatedCostData(costData)
  }
  
  protected function computeTermAmount(costData : CostData, rate : BigDecimal, asPercentage : boolean) : BigDecimal {
    return (costData.Basis * rate / (asPercentage ? 100 : 1)).setScale(roundingLevel(), this.RoundingMode)
  }
  
  private property get RoundingMode() : RoundingMode {
    return _line.Branch.Policy.Product.QuoteRoundingMode
  }
  
  //
  // PRIVATE SUPPORT METHODS
  //
  private function computeValuesFromCostOverrides(cost : Cost, costData : CostData, asPercentage : boolean) {
    if (cost.OverrideBaseRate != null) {
      costData.ActualBaseRate = cost.OverrideBaseRate
      costData.ActualAdjRate = cost.OverrideBaseRate
      costData.ActualTermAmount = computeTermAmount(costData, costData.ActualAdjRate, asPercentage)
    }
    else if (cost.OverrideAdjRate != null) {
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = cost.OverrideAdjRate
      costData.ActualTermAmount = computeTermAmount(costData, costData.ActualAdjRate, asPercentage)
    }
    else if (cost.OverrideTermAmount != null) {
      costData.Basis = 0
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = 0
      costData.ActualTermAmount = cost.OverrideTermAmount
    }
    else if (cost.OverrideAmount != null) {
      costData.Basis = 0
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = 0
      costData.ActualTermAmount = 0
      costData.ActualAmount = cost.OverrideAmount
    }
  }
}
