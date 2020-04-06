package gw.lob.wc.rating

uses gw.rating.CostData
uses java.math.BigDecimal

@Export
class ShortRatePremiumRater {
  private construct() {
  }
  
  static function rate(shortRateFactor : BigDecimal, ratingPeriod : WCRatingPeriod,
                       step : WCRatingStepExt, context : WCSysTableRatingEngine) : WCJurisdictionCostData {
    var costData : WCJurisdictionCostData = null
    if (shortRateFactor != null) {
      var subtotal = context.getCostAmountSum(ratingPeriod)
      if (subtotal > 0) {
        costData = ratingPeriod.createCostData(step, context.RateCache)
        var existingCost = costData.getExistingCost(context.PolicyLine)
        costData.Basis = subtotal
        costData.SubjectToReporting = true        

        costData.StandardBaseRate = shortRateFactor
        costData.StandardAdjRate = costData.StandardBaseRate
        costData.StandardTermAmount = (costData.Basis * costData.StandardBaseRate).setScale(context.RoundingLevel, context.RoundingMode)
        costData.StandardAmount = costData.StandardTermAmount
        
        costData.copyOverridesFromCost(existingCost)
        computeValuesFromCostOverrides(existingCost, costData, context)
      }
    }
    return costData
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private static function computeValuesFromCostOverrides(cost : WCJurisdictionCost, costData : CostData, context : WCSysTableRatingEngine) {
    if (cost.OverrideBaseRate != null) {
      costData.ActualBaseRate = cost.OverrideBaseRate
      costData.ActualAdjRate = cost.OverrideBaseRate
      costData.ActualTermAmount = computeTermAmount(costData, context)
      costData.ActualAmount = costData.ActualTermAmount
    }
    else if (cost.OverrideAdjRate != null) {
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = cost.OverrideAdjRate
      costData.ActualTermAmount = computeTermAmount(costData, context)
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
  
  private static function computeTermAmount(costData : CostData, context : WCSysTableRatingEngine) : BigDecimal {
    return (costData.Basis * costData.ActualAdjRate).setScale(context.RoundingLevel, context.RoundingMode)
  }
}
