package gw.lob.cp.rating

uses entity.windowed.CPBuildingCovCostVersionList
uses entity.windowed.CPBuildingCovVersionList
uses entity.windowed.CPBuildingVersionList
uses gw.api.domain.financials.PCFinancialsLogger
uses gw.api.productmodel.CoveragePattern
uses gw.api.util.JurisdictionMappingUtil
uses gw.rating.AbstractRatingEngine
uses gw.rating.CostData
uses gw.rating.RateAdjFactorSearchCriteria

uses java.lang.Iterable
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.util.ArrayList
uses java.util.Collections

@Export
class CPSysTableRatingEngine extends AbstractRatingEngine<CommercialPropertyLine> {

  var _baseRatingDate : DateTime

  construct(cpLineArg : CommercialPropertyLine) {
    super(cpLineArg)
    // set the base Rating using the first policyperiod in the term.
    // this will be used for U/W lookup and other basic items
    // rating date by object will be set separately
    _baseRatingDate  = cpLineArg.Branch.FirstPeriodInTerm.getReferenceDateForCurrentJob( cpLineArg.BaseState )
  }

  override protected function existingSliceModeCosts() : Iterable<Cost> {
    return PolicyLine.Costs.whereTypeIs(CPBuildingCovCost)
  }

    // Used by the extractCostDatasFromExistingCosts method.  Must be implemented if that method is going to be called
  override protected function createCostDataForCost(c : Cost) : CostData {
    switch(typeof c) {
      case CPBuildingCovBroadCost: return new CPBuildingCovBroadCostData(c, RateCache)
      case CPBuildingCovGrp1Cost:  return new CPBuildingCovGroup1CostData(c, RateCache)
      case CPBuildingCovGrp2Cost:  return new CPBuildingCovGroup2CostData(c, RateCache)
      case CPBuildingCovSpecCost:  return new CPBuildingCovSpecialCostData(c, RateCache)
      default: throw "Unepxected cost type ${c.DisplayName}"
    }
  }

  protected override function rateSlice(lineVersion : CommercialPropertyLine) {
    if (lineVersion.Branch.isCanceledSlice()) {
      PCFinancialsLogger.logInfo("Not rating " + lineVersion + " " + lineVersion.SliceDate + " version because it is in the cancelled period of time.")
    } else {
      PCFinancialsLogger.logInfo("Rating " + lineVersion + " " + lineVersion.SliceDate + " version...")
      for (location in lineVersion.CPLocations) {
        PCFinancialsLogger.logInfo("Rating " + location + "...")
        for (building in location.Buildings) {
          PCFinancialsLogger.logInfo("Rating " + building + "...")
          for (cov in building.Coverages) {
            addCosts(rateCPBuildingCov(cov))
          }
          PCFinancialsLogger.logInfo("Rating " + building + "...")
        }
        PCFinancialsLogger.logInfo("Rating " + location + "...Done")
      }
      PCFinancialsLogger.logInfo("Rating " + lineVersion + " " + lineVersion.SliceDate + " version...Done")
    }
  }

  function rateCPBuildingCov(cov : CPBuildingCov) : List<CPBuildingCovCostData> {
    switch (typeof cov) {
      case CPBldgCov: return rateCPBldgCov(cov)
      case CPBPPCov: return rateCPBPPCov(cov)
      default: PCFinancialsLogger.logDebug((typeof cov) + " has no rating logic.")
        return Collections.emptyList<CPBuildingCovCostData>()
    }
  }

  function rateCPBldgCov(cov : CPBldgCov) : List<CPBuildingCovCostData> {
    var costs = new ArrayList<CPBuildingCovCostData>()
    // PC-14453 : the standard rates below, need to come from the policy graph (probably the building) where it was already set from an ISO plugin lookup prior to rating
    var limitValue = cov.CPBldgCovLimitTerm.Value
    var deductibleValue = cov.CPBldgCovDeductibleTerm.Value
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var state = JurisdictionMappingUtil.getJurisdiction(cov.CPBuilding.CPLocation.Location)

    costs.add(rateCPBuildingCov_impl(new CPBuildingCovGroup1CostData(start, end, cov.Currency, RateCache, cov.FixedId, state), cov, 0.12, limitValue, deductibleValue, "cpDeductGrp1"))
    costs.add(rateCPBuildingCov_impl(new CPBuildingCovGroup2CostData(start, end, cov.Currency, RateCache, cov.FixedId, state), cov, 0.08, limitValue, deductibleValue, "cpDeductGrp2"))
    if (cov.CPBldgCovCauseOfLossTerm.Value == "Broad" or cov.CPBldgCovCauseOfLossTerm.Value == "Special") {
      costs.add(rateCPBuildingCov_impl(new CPBuildingCovBroadCostData(start, end, cov.Currency, RateCache, cov.FixedId, state), cov, 0.08, limitValue, deductibleValue, "cpDeductBroad"))
    }
    if (cov.CPBldgCovCauseOfLossTerm.Value == "Special") {
      costs.add(rateCPBuildingCov_impl(new CPBuildingCovSpecialCostData(start, end, cov.Currency, RateCache, cov.FixedId, state), cov, 0.08, limitValue, deductibleValue, "cpDeductSpecial"))
    }
    return costs
  }

  function rateCPBPPCov(cov : CPBPPCov) : List<CPBuildingCovCostData> {
    var costs = new ArrayList<CPBuildingCovCostData>()
    // PC-14453 : the standard rates below, need to come from the policy graph (probably the building) where it was already set from an ISO plugin lookup prior to rating
    var limitValue = cov.CPBPPCovLimitTerm.Value
    var deductibleValue = cov.CPBPPCovDeductibleTerm.Value
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var state = JurisdictionMappingUtil.getJurisdiction(cov.CPBuilding.CPLocation.Location)

    costs.add(rateCPBuildingCov_impl(new CPBuildingCovGroup1CostData(start, end, cov.Currency, RateCache, cov.FixedId, state),cov, 0.15, limitValue, deductibleValue, "cpDeductGrp1"))
    costs.add(rateCPBuildingCov_impl(new CPBuildingCovGroup2CostData(start, end, cov.Currency, RateCache, cov.FixedId, state), cov, 0.15, limitValue, deductibleValue, "cpDeductGrp2"))
    if (cov.CPBPPCovCauseOfLossTerm.Value == "Broad" or cov.CPBPPCovCauseOfLossTerm.Value == "Special") {
      costs.add(rateCPBuildingCov_impl(new CPBuildingCovBroadCostData(start, end, cov.Currency, RateCache, cov.FixedId, state), cov, 0.08, limitValue, deductibleValue, "cpDeductBroad"))
    }
    if (cov.CPBPPCovCauseOfLossTerm.Value == "Special") {
      costs.add(rateCPBuildingCov_impl(new CPBuildingCovSpecialCostData(start, end, cov.Currency, RateCache, cov.FixedId, state), cov, 0.08, limitValue, deductibleValue, "cpDeductSpecial"))
    }
    return costs
  }

  override function getNextSliceDateAfter(start : DateTime) : DateTime {
    var ret = AllEffectiveDates.firstWhere(\ d -> d > start)
    return ret == null ? Branch.PeriodEnd : ret
  }

  function rateCPBuildingCov_impl(costData : CPBuildingCovCostData, cov : CPBuildingCov, stdBaseRate : BigDecimal,
                                  limitValue : BigDecimal, deductibleValue : BigDecimal, factorName : String) : CPBuildingCovCostData {
    var state = JurisdictionMappingUtil.getJurisdiction(cov.CPBuilding.CPLocation.Location)
    var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(cov.Pattern as CoveragePattern, cov.CPBuilding)
    var existingCost = costData.getExistingCost(this.PolicyLine)

    costData.init(this.PolicyLine)
    costData.NumDaysInRatedTerm   = this.NumDaysInCoverageRatedTerm
    costData.Basis                = limitValue
    costData.setBaseRateAndHandleOverrides(stdBaseRate)

    var deductibleFactor          = new RateAdjFactorSearchCriteria(factorName, ratingDate)
                                      .matchInRange(deductibleValue as String, limitValue as double, state.Code)
    var fireProtectionClassFactor = getFireProtectionClassFactor(cov.CPBuilding.CPLocation.Location)
    var uwCompanyFactor           = cov.Branch.getUWCompanyRateFactor(_baseRatingDate, state)
    var calcAdjRate               = costData.StandardBaseRate * deductibleFactor * fireProtectionClassFactor * uwCompanyFactor
                                    * Branch.getProductModifierFactor()
    costData.setAdjRateAndHandleOverrides(calcAdjRate)
    var basisFactor = 0.01  // CP rates per $100 of limit
    var calcTermAmount             = (costData.Basis * costData.StandardAdjRate * basisFactor).setScale(Branch.Policy.Product.QuoteRoundingLevel, this.RoundingMode)
    costData.setTermAmountAndHandleOverrides(calcTermAmount)

    logDebugRatedCostTermValues(costData)
    return costData
  }

  function getFireProtectionClassFactor(location : PolicyLocation) : BigDecimal {
    switch(location.FireProtectClass) {
      case "1" : return 0.7
      case "2" : return 1.0
      case "3" : return 1.25
      case "4" : return 2.0
      case "5" : return 2.0
      default  : return 1.0  // null or unknown type returns standard 1.0
    }
  }

  private property get RoundingMode() : RoundingMode {
    return Branch.Policy.Product.QuoteRoundingMode
  }

  protected override function rateWindow(lineVersion : CommercialPropertyLine) {
    var cpBuildingCovCostDatas = CostDatas as List<CPBuildingCovCostData>  // PC-14454 : this assumes that all cost datas are CPBuildingCovCostData which is not going to be true when we fill out rating more
    var basesMap  = cpBuildingCovCostDatas.partition(\ c -> c.State).mapValues(\ l -> l.sum(\ c -> c.ActualAmountBilling.Amount))
    for (st in basesMap.Keys) {
      var subtotal = basesMap.get(st)
      if (subtotal != 0) {
        var costData = new CPStateTaxCostData(lineVersion.Branch.PeriodStart, lineVersion.Branch.PeriodEnd, TaxRatingCurrency, RateCache, st)
        costData.NumDaysInRatedTerm = lineVersion.Branch.NumDaysInPeriod
        costData.Basis              = subtotal
        costData.StandardBaseRate   = getStateTaxRate(st)
        costData.StandardAdjRate    = costData.StandardBaseRate
        costData.StandardTermAmount = (costData.Basis * costData.StandardAdjRate)
                                        .setScale(lineVersion.Branch.Policy.Product.QuoteRoundingLevel, this.RoundingMode)
        costData.StandardAmount     = costData.StandardTermAmount
        costData.copyStandardColumnsToActualColumns()  // no overrides
        addCost(costData)

        logDebugRatedCost(costData)
      }
    }
  }

  function logDebugRatedCost(costData : CostData) {
    logDebugRatedCost("Rated", costData)
  }

  function logDebugRatedCostTermValues(costData : CostData) {
    logDebugRatedCost("Rated term values", costData)
  }

  private function logDebugRatedCost(preMsg : String, costData : CostData) {
    PCFinancialsLogger.logDebug(preMsg + " " + costData.debugString() + " for " + costData)
  }

  override function preLoadCostArrays() {
    PolicyLine.VersionList.CPLocations.arrays<CPBuildingVersionList>("Buildings").arrays<CPBuildingCovVersionList>("Coverages").arrays<CPBuildingCovCostVersionList>("Costs")
  }

  private function getActualTermAmount(costData : CostData): BigDecimal {
    var basisFactor = 0.01  // CP rates per $100 of limit
    costData.ActualTermAmount = (costData.Basis * costData.ActualAdjRate * basisFactor)
        .setScale(Branch.Policy.Product.QuoteRoundingLevel, this.RoundingMode)
    return costData.ActualTermAmount
  }
}