package gw.lob.wc.rating

uses gw.rating.CostData
uses gw.api.util.StateJurisdictionMappingUtil

@Export
class PolicyLevelMinimumPremiumRater {
  private construct() {
  }
  
  static function rate(ratingPeriod : WCRatingPeriod, step : WCRatingStepExt, context : WCSysTableRatingEngine) : WCJurisdictionCostData {
    var costData : WCJurisdictionCostData = null
    if (shouldRate(ratingPeriod, context)) {
      costData = ratingPeriod.createCostData(step, context.RateCache)
      var existingCost = costData.getExistingCost(context.PolicyLine)
      costData.Basis      = context.MinimumPremiumBasis
      costData.SubjectToReporting = true
      
      costData.StandardBaseRate    = context.MinimumPremiumAdjustment
      costData.StandardAdjRate = costData.StandardBaseRate
      costData.StandardTermAmount = context.MinimumPremiumAdd
      costData.StandardAmount     = costData.StandardTermAmount
      
      costData.copyOverridesFromCost(existingCost)
      computeValuesFromCostOverrides(existingCost, costData, context)
    }
    return costData
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private static function computeValuesFromCostOverrides(cost : WCJurisdictionCost,
                                                         costData : CostData, context : WCSysTableRatingEngine) {
      if (cost.OverrideBaseRate != null) {
        costData.ActualBaseRate = cost.OverrideBaseRate  
        costData.ActualAdjRate = cost.OverrideBaseRate  
        if (cost.OverrideBaseRate > context.MinimumPremiumBasis) {
          costData.ActualTermAmount = cost.OverrideBaseRate - context.MinimumPremiumBasis
          costData.ActualAmount = costData.ActualTermAmount
        }
        else {
          costData.ActualTermAmount = 0 
          costData.ActualAmount = 0
        }
      }
      else if (cost.OverrideAdjRate != null) {
        costData.ActualBaseRate = 0
        costData.ActualAdjRate = cost.OverrideAdjRate
        if (cost.OverrideAdjRate > context.MinimumPremiumBasis) {
          costData.ActualTermAmount = cost.OverrideAdjRate - context.MinimumPremiumBasis
          costData.ActualAmount = costData.ActualTermAmount
        }
        else {
          costData.ActualTermAmount = 0
          costData.ActualAmount = 0
        }
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
  
  /**
   * Return true if this is the first rating period and it has a positive minimum premium matching the state
   */
  private static function shouldRate(period : WCRatingPeriod, context : WCSysTableRatingEngine) : boolean {
    return (context.MinimumPremiumAdd > 0
         and period.Jurisdiction.State == context.MinimumPremiumState
         and period.RatingStart.compareIgnoreTime(context.Period.PeriodStart) == 0)
  }
}
