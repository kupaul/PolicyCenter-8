package gw.lob.wc.rating
uses gw.rating.RateAdjFactorSearchCriteria
uses java.math.RoundingMode
uses java.math.BigDecimal
uses gw.rating.CostData

@Export
class EmployersLiabilityIncreasedLimitsRater {
  
  construct() {
  }

  static function rate(ratingPeriod : WCRatingPeriod, step : WCRatingStepExt,
                       atRatingPeriodLevel : boolean, context : WCSysTableRatingEngine) : WCJurisdictionCostData {
    var costData : WCJurisdictionCostData = null
    var covs = ratingPeriod.Jurisdiction.WCLine.VersionList.WCLineCoveragesAsOf(ratingPeriod.RatingStart).whereTypeIs(WCEmpLiabCov)
    if (covs.Count > 1)
    {
      throw "Expected at most one coverage of type " + WCEmpLiabCov + " on the line at " + ratingPeriod.RatingStart + "; found " + covs.Count
    }
    var empLiabLimit = covs.first().WCEmpLiabLimitTerm.PackageValue
    if (empLiabLimit != null) {
      // Possibly, this should be finding the limit on pr for looking up the factor but then associating
      // the rating line with the same coverage type on the quote's period.  As is, it will take the limit only from the
      // quote's period, ignoring earlier values.
      var limitFactor = new RateAdjFactorSearchCriteria("wcEmpLiabLimit", ratingPeriod.RatingDate).match(empLiabLimit.PackageCode, ratingPeriod.Jurisdiction.State)
      if (limitFactor <> 1) {
        var basis = context.getRatingSubtotal(step.subtotal, atRatingPeriodLevel ? WCRatingSubtotalGranularity.ratingPeriod : WCRatingSubtotalGranularity.jurisdiction, ratingPeriod.Jurisdiction.State, ratingPeriod.RatingStart as String)
        var convertedRate = context.convertRateByUsage(limitFactor, step.rateConversionType)
        var roundingLevel = context.RoundingLevel
        var roundingMode = context.RoundingMode
        if (not convertedRate.IsZero) {
          costData = ratingPeriod.createCostData(step, context.RateCache)
          var existingCost = costData.getExistingCost(context.PolicyLine)
          costData.Basis = basis
          costData.SubjectToReporting = true

          costData.StandardBaseRate = limitFactor
          costData.StandardAdjRate = costData.StandardBaseRate
          costData.StandardTermAmount = computeTermAmount(costData.Basis, convertedRate, roundingLevel, roundingMode)
          costData.StandardAmount = costData.StandardTermAmount
          
          costData.copyStandardColumnsToActualColumns()
          
          costData.copyOverridesFromCost(existingCost)
          computeValuesFromCostOverrides(existingCost, costData, context, step)
        }
      }
    }
    return costData
  }
  
  private static function computeValuesFromCostOverrides(cost : Cost, costData : CostData,
                                                         context : WCSysTableRatingEngine, step : WCRatingStepExt) {
    var roundingLevel = context.RoundingLevel                                                           
    var roundingMode = context.RoundingMode
    var convertedRate : BigDecimal
    if (cost.OverrideBaseRate != null) {
      costData.ActualBaseRate = cost.OverrideBaseRate
      costData.ActualAdjRate = cost.OverrideBaseRate  
      convertedRate = context.convertRateByUsage(costData.ActualAdjRate, step.rateConversionType)
      costData.ActualTermAmount = computeTermAmount(costData.Basis, convertedRate, roundingLevel, roundingMode)
      costData.ActualAmount = costData.ActualTermAmount   
    }
    else if (cost.OverrideAdjRate != null) {
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = cost.OverrideAdjRate  
      convertedRate = context.convertRateByUsage(costData.ActualAdjRate, step.rateConversionType)
      costData.ActualTermAmount = computeTermAmount(costData.Basis, convertedRate, roundingLevel, roundingMode)
      costData.ActualAmount = costData.ActualTermAmount               
    }
    else if (cost.OverrideAmount != null) {
      costData.Basis = 0
      costData.ActualBaseRate = 0
      costData.ActualAdjRate = 0
      convertedRate = context.convertRateByUsage(costData.ActualAdjRate, step.rateConversionType)
      costData.ActualTermAmount = cost.OverrideAmount
      costData.ActualAmount = cost.OverrideAmount
    }
    else {
      costData.copyStandardColumnsToActualColumns()
    }
}
  private static function computeTermAmount(basis : BigDecimal, 
      convertedRate : BigDecimal, roundingLevel : int, roundingMode : RoundingMode) : BigDecimal {    
    return (basis * convertedRate).setScale(roundingLevel, roundingMode)
  }
}
