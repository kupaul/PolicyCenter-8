package gw.lob.wc.rating

uses gw.rating.CostData
uses gw.rating.RateAdjFactorSearchCriteria
uses java.math.BigDecimal
uses gw.api.util.StateJurisdictionMappingUtil

@Export
class TerrorismPremiumRater {
  
  private construct() {
  }
  
  static function rate(ratingPeriod : WCRatingPeriod, step : WCRatingStepExt, context : WCSysTableRatingEngine) : WCJurisdictionCostData {
    var costData : WCJurisdictionCostData = null
    if (ratingPeriod.RatingStart.compareIgnoreTime(context.Period.PeriodStart) == 0) {
      var terrorismRate = new RateAdjFactorSearchCriteria("wcTerrorism", ratingPeriod.RatingDate).match("base", ratingPeriod.Jurisdiction.State)
      terrorismRate = context.convertRateByUsage(terrorismRate, step.rateConversionType)
      if (terrorismRate <> 0) {
        var statePayroll = context.Payroll.get(ratingPeriod.Jurisdiction.State)
        if (statePayroll > 0) {
          costData = ratingPeriod.createCostData(step, context.RateCache)
          var existingCost = costData.getExistingCost(context.PolicyLine)
          
          costData.SubjectToReporting = true
          costData.Basis = statePayroll
          costData.StandardBaseRate = terrorismRate
          costData.StandardAdjRate = costData.StandardBaseRate
          costData.StandardTermAmount = computeTermAmount(costData.Basis, costData.StandardAdjRate, context)
          costData.StandardAmount = costData.StandardTermAmount

          costData.copyOverridesFromCost(existingCost)          
          computeValuesFromCostOverrides(existingCost, costData, context)
        }
      }
    }
    return costData  
  }

  //
  // PRIVATE SUPPORT METHODS
  //  
  private static function computeValuesFromCostOverrides(cost : WCJurisdictionCost, costData : CostData, context : WCSysTableRatingEngine) {
    if (cost.OverrideBaseRate != null) {
      costData.ActualBaseRate = cost.OverrideBaseRate
      costData.ActualAdjRate = cost.OverrideBaseRate
      costData.ActualTermAmount = computeTermAmount(costData.Basis, costData.ActualAdjRate, context)
      costData.ActualAmount = costData.ActualTermAmount
    }
    else if (cost.OverrideAdjRate != null) {
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = cost.OverrideAdjRate
      costData.ActualTermAmount = computeTermAmount(costData.Basis, costData.ActualAdjRate, context)
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
  
  private static function computeTermAmount (basis : BigDecimal, rate : BigDecimal, context : WCSysTableRatingEngine) : BigDecimal {
    return (basis * rate / 100).setScale(context.RoundingLevel, context.RoundingMode)    
  }
}
