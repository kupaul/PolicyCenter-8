package gw.lob.wc.rating
uses gw.rating.CostData

@Export
class ExpenseConstantRater {
  
  construct() {
  }
  
  static function rate(ratingPeriod : WCRatingPeriod, step : WCRatingStepExt, context : WCSysTableRatingEngine) : WCJurisdictionCostData {
    var costData : WCJurisdictionCostData = null
    if (shouldRate(ratingPeriod, context)) {
      costData = ratingPeriod.createCostData(step, context.RateCache)
      var existingCost = costData.getExistingCost(context.PolicyLine)
      
      costData.SubjectToReporting = true
      costData.Basis = 0
      costData.StandardBaseRate = 0
      costData.StandardAdjRate = costData.StandardBaseRate
      costData.StandardTermAmount = context.ExpenseConstant
      costData.StandardAmount = costData.StandardTermAmount
      
      costData.copyOverridesFromCost(existingCost)
      computeValuesFromCostOverrides(existingCost, costData)
            
    }  
    return costData 
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private static function computeValuesFromCostOverrides(cost : WCJurisdictionCost, costData : CostData) {
    if (cost.OverrideAmount != null) {
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
   * Return true if this is the first rating period and it has a positive expense constant in the matching state
   */
  private static function shouldRate(period : WCRatingPeriod, context : WCSysTableRatingEngine) : boolean {
    return (context.ExpenseConstant > 0
         and period.Jurisdiction.State == context.ExpenseConstantState
         and period.RatingStart.compareIgnoreTime(context.Period.PeriodStart) == 0)
  }
}
