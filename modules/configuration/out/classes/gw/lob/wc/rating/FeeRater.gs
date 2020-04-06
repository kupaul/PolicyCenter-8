package gw.lob.wc.rating

uses gw.rating.CostData
uses gw.rating.RateAdjFactorSearchCriteria
uses java.math.BigDecimal
uses java.math.RoundingMode

@Export
class FeeRater {

  private construct() {
  }
  
  static function rate(ratingPeriod : WCRatingPeriod, step : WCRatingStepExt,
                       atRatingPeriodLevel : boolean, context : WCSysTableRatingEngine) : WCJurisdictionCostData {
    var costData : WCJurisdictionCostData = null
    var baseRate = new RateAdjFactorSearchCriteria(step.factorName, ratingPeriod.RatingDate).match("base", ratingPeriod.Jurisdiction.State)
    var adjRate  = context.convertRateByUsage(baseRate, step.rateConversionType)
    if (adjRate <> 0) {
      var basis = context.getOrCalcSubtotal(ratingPeriod, step, atRatingPeriodLevel)
      if (basis <> 0) {
        costData = ratingPeriod.createCostData(step, context.RateCache)
        var existingCost = costData.getExistingCost(context.PolicyLine)
        costData.Basis = basis
        
        costData.StandardBaseRate = baseRate
        costData.StandardAdjRate = costData.StandardBaseRate
        costData.StandardTermAmount = (costData.Basis * context.convertRateByUsage(baseRate, step.rateConversionType)).setScale(context.RoundingLevel, RoundingMode.HALF_UP)
        costData.StandardAmount = costData.StandardTermAmount
        
        costData.copyStandardColumnsToActualColumns()  
        costData.copyOverridesFromCost(existingCost)
        computeValuesFromCostOverrides(existingCost, costData, context, step)
      }
    }
    return costData
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private static function computeValuesFromCostOverrides(cost : Cost, costData : CostData, context : WCSysTableRatingEngine, step : WCRatingStepExt) {
    if (cost.OverrideBaseRate != null) {
      costData.ActualBaseRate = cost.OverrideBaseRate
      costData.ActualAdjRate = cost.OverrideBaseRate
      costData.ActualTermAmount = computeTermAmount(costData, context, step)
      costData.ActualAmount = costData.ActualTermAmount   
    }
    else if (cost.OverrideAdjRate != null) {
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = cost.OverrideAdjRate
      costData.ActualTermAmount = computeTermAmount(costData, context, step)
      costData.ActualAmount = costData.ActualTermAmount 
    }
    else if (cost.OverrideAmount != null) {
      costData.Basis = 0
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = 0
      costData.ActualTermAmount = cost.OverrideAmount
      costData.ActualAmount = cost.OverrideAmount
    }
    else { 
      costData.copyStandardColumnsToActualColumns()
    }
  }
  
  private static function computeTermAmount(costData : CostData, context : WCSysTableRatingEngine, step : WCRatingStepExt) : BigDecimal {
    return (costData.Basis * context.convertRateByUsage(costData.ActualAdjRate, step.rateConversionType))
              .setScale(context.RoundingLevel, context.RoundingMode)
  }
}