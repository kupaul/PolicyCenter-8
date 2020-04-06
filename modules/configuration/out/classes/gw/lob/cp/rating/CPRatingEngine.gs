package gw.lob.cp.rating

uses entity.windowed.CPBuildingVersionList
uses entity.windowed.CPBuildingCovVersionList
uses entity.windowed.CPBuildingCovCostVersionList
uses gw.api.productmodel.Offering
uses gw.api.util.JurisdictionMappingUtil
uses gw.job.RenewalProcess
uses gw.rating.AbstractRatingEngine
uses gw.rating.CostData
uses java.lang.Iterable
uses java.util.Collections
uses java.util.Date
uses java.util.Map
uses gw.rating.RateFlowLogger
uses java.util.LinkedList

@Export
class CPRatingEngine extends AbstractRatingEngine<productmodel.CPLine> {

  static var _rfLogger = RateFlowLogger.Logger

  var _baseRatingDate     : Date
  var _jurisdiction       : Jurisdiction
  var _minimumRatingLevel : RateBookStatus
  var _renewal            : boolean
  var _uwCompany          : UWCompany
  var _offering           : Offering
  var _linePatternCode    : String

  construct(line : CPLine) {
    this(line, RateBookStatus.TC_ACTIVE)
  }

  construct(line : CPLine, minimumRatingLevel : RateBookStatus) {
    super(line)

    _minimumRatingLevel = minimumRatingLevel

    // Populate most of the instance vars from line
    _jurisdiction = line.BaseState
    _baseRatingDate = line.Branch.RateAsOfDate
    _renewal = line.Branch.JobProcess typeis RenewalProcess
    _uwCompany = line.Branch.UWCompany
    _offering = line.Branch.Offering
    _linePatternCode = line.PolicyLine.PatternCode
  }

  override protected function existingSliceModeCosts() : Iterable<Cost> {
    return PolicyLine.Costs.whereTypeIs(CPBuildingCovCost)
  }

  // Used by the extractCostDatasFromExistingCosts method.  Must be implemented if that method is going to be called
  override protected function createCostDataForCost(c : Cost) : CPCostData {
    switch(typeof c) {
      case CPBuildingCovBroadCost: return new CPBuildingCovBroadCostData(c, RateCache)
      case CPBuildingCovGrp1Cost:  return new CPBuildingCovGroup1CostData(c, RateCache)
      case CPBuildingCovGrp2Cost:  return new CPBuildingCovGroup2CostData(c, RateCache)
      case CPBuildingCovSpecCost:  return new CPBuildingCovSpecialCostData(c, RateCache)
      default: throw "Unexpected cost type ${c.DisplayName}"
    }
  }

  override function preLoadCostArrays() {
    PolicyLine.VersionList.CPLocations.arrays<CPBuildingVersionList>("Buildings")
                                 .arrays<CPBuildingCovVersionList>("Coverages")
                                 .arrays<CPBuildingCovCostVersionList>("Costs")
  }

  //===========================================================================
  // Rate Flow
  //===========================================================================

  protected override function rateWindow(lineVersion : CPLine) {
    var cpBuildingCovCostDatas = CostDatas as List<CPBuildingCovCostData>
    var basesMap  = cpBuildingCovCostDatas.partition(\ c -> c.State).mapValues(\ l -> l.sum(\ c -> c.ActualAmountBilling.Amount))
    for (st in basesMap.Keys) {
      var subtotal = basesMap.get(st)
      if (subtotal == 0) {
        continue
      }
      var costData = new CPStateTaxCostData(lineVersion.Branch.PeriodStart, lineVersion.Branch.PeriodEnd,TaxRatingCurrency, RateCache, st)
      costData.Overridable = false
      costData.NumDaysInRatedTerm = lineVersion.Branch.NumDaysInPeriod

      var rateRoutineParameterMap : Map<CalcRoutineParamName, Object> =
            {TC_POLICYLINE   ->PolicyLine,
             TC_TAXABLEBASIS ->subtotal,
             TC_STATE        ->st}
      var refDate = Branch.PeriodStart
      var rateBook = getRateBook(refDate, lineVersion.Branch.Offering.Code)
      costData.RateBook = rateBook
      rateBook.executeCalcRoutine("cp_state_tax_rr", costData, costData, rateRoutineParameterMap)
      costData.StandardAmount = costData.StandardTermAmount
      costData.copyStandardColumnsToActualColumns()  // no overrides
      addCost(costData)
      if (_rfLogger.DebugEnabled) {
        logDebugRatedCost(costData)
      }
    }
  }

  protected override function rateSlice(lineVersion : CPLine) {
    if (lineVersion.Branch.isCanceledSlice()) {
      if (_rfLogger.DebugEnabled) {
        _rfLogger.debug("Not rating " + lineVersion + " " + lineVersion.SliceDate + " version because it is in the cancelled period of time.")
      }
    } else {
      _rfLogger.info("Rating " + lineVersion + " " + lineVersion.SliceDate + " version...")
      for (location in lineVersion.CPLocations) {
        if (_rfLogger.DebugEnabled) {
          _rfLogger.debug("Rating " + location + "...")
        }
        for (building in location.Buildings) {
          if (_rfLogger.DebugEnabled) {
            _rfLogger.debug("Rating " + building + "...")
          }
          // All coverages on CP are referenced to the Coverable reference date.   If this were not so, we would
          // want to loop over the coverages, and call ReferenceDatePlugin.getCoverageReferenceDate() for each one.
          var rateBook =  getRateBook(building.CoverableReferenceDate, lineVersion.Branch.Offering.Code)
          for (cov in building.Coverages) {
            // not including cost datas that have a zero term amount
            addCosts(rateCPBuildingCov(cov, rateBook).where(\ c -> c.StandardTermAmount != 0))
          }
          if (_rfLogger.DebugEnabled) {
            _rfLogger.debug("Rating " + building + "...")
          }
        }
        if (_rfLogger.DebugEnabled) {
          _rfLogger.debug("Rating " + location + "...Done")
        }
      }
      _rfLogger.info("Rating " + lineVersion + " " + lineVersion.SliceDate + " version...Done")
    }
  }

  private function rateCPBuildingCov(cov : CPBuildingCov, rateBook : RateBook) : List<CPBuildingCovCostData> {
    var costs = new LinkedList<CPBuildingCovCostData>()
    assertSliceMode(cov)
    switch (typeof cov) {
      case CPBldgCov: return rateCPBuildingCov(cov, costs, rateBook, cov.CPBldgCovCauseOfLossTerm.Value)
      case CPBPPCov: return rateCPBuildingCov(cov, costs, rateBook, cov.CPBPPCovCauseOfLossTerm.Value)
      default:
        if (_rfLogger.DebugEnabled) {
          _rfLogger.debug((typeof cov) + " has no rating logic.")
        }
        return Collections.emptyList<CPBuildingCovCostData>()
    }
  }

  private function rateCPBuildingCov(cov : CPBuildingCov, costs: List<CPBuildingCovCostData>, rateBook : RateBook, causeOfLoss : CPCauseOfLoss) : List<CPBuildingCovCostData> {
    var routineName = getRateRoutineName(cov)
    var params = createParamMap(cov, "cpDeductGrp1")
    costs.add(executeCPRateRoutine(cov, createCostData(cov, "cpDeductGrp1"), rateBook, params, routineName))
    updateDeductFactor(params, "cpDeductGrp2")
    costs.add(executeCPRateRoutine(cov, createCostData(cov, "cpDeductGrp2"), rateBook, params, routineName))
    if (causeOfLoss == TC_BROAD or causeOfLoss == TC_SPECIAL) {
      updateDeductFactor(params, "cpDeductBroad")
      costs.add(executeCPRateRoutine(cov, createCostData(cov, "cpDeductBroad"), rateBook, params, routineName))
    }
    if (causeOfLoss == TC_SPECIAL) {
      updateDeductFactor(params, "cpDeductSpecial")
      costs.add(executeCPRateRoutine(cov, createCostData(cov, "cpDeductSpecial"), rateBook, params, routineName))
    }
    return costs
  }

// Naive implementation:
//  private function rateCPBuildingCov(cov : CPBuildingCov, costs: List<CPBuildingCovCostData>, rateBook : RateBook) : List<CPBuildingCovCostData> {
//    costs.add(executeCPRateRoutine(cov, createCostData(cov, "cpDeductGrp1"), rateBook, createParamMap(cov, "cpDeductGrp1"), getRateRoutineName(cov)))
//    costs.add(executeCPRateRoutine(cov, createCostData(cov, "cpDeductGrp2"), rateBook,  createParamMap(cov, "cpDeductGrp2"), getRateRoutineName(cov)))
//    costs.add(executeCPRateRoutine(cov, createCostData(cov, "cpDeductBroad"), rateBook,  createParamMap(cov, "cpDeductBroad"), getRateRoutineName(cov)))
//    costs.add(executeCPRateRoutine(cov, createCostData(cov, "cpDeductSpecial"), rateBook,  createParamMap(cov, "cpDeductSpecial"), getRateRoutineName(cov)))
//    return costs
//  }

  private function executeCPRateRoutine (cov: CPBuildingCov,
                                         data: CPBuildingCovCostData<CPBuildingCovCost>,
                                         rateBook : RateBook,
                                         rateRoutineParameterMap: Map<CalcRoutineParamName, Object>,
                                         rateRoutineName: String) : CPBuildingCovCostData<CPBuildingCovCost> {
    data.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
    data.Basis = 1

    data.RateBook = rateBook
    rateBook.executeCalcRoutine(rateRoutineName, data, data, rateRoutineParameterMap)

    if (_rfLogger.DebugEnabled) {
      _rfLogger.debug("Rate " + typeof cov)
      _rfLogger.debug("   Standard Base Rate:     ${data.StandardBaseRate}")
      _rfLogger.debug("   Standard Adjusted Rate: ${data.StandardAdjRate}")
      _rfLogger.debug("   Standard Term Amount:   ${data.StandardTermAmount}")
    }
    return data
  }

  //===========================================================================
  // Utility Functions
  //===========================================================================

  private function createCostData(cov: CPBuildingCov, deductFactorName: String): CPBuildingCovCostData {
    var start = cov.SliceDate
    var end = getNextSliceDateAfter(start)
    var state = JurisdictionMappingUtil.getJurisdiction(cov.CPBuilding.CPLocation.Location)
    var cpCostData : CPBuildingCovCostData

    switch (deductFactorName) {
      case ("cpDeductGrp1") :  cpCostData = new CPBuildingCovGroup1CostData(start, end, cov.Currency, RateCache, cov.FixedId, state)
                               break
      case ("cpDeductGrp2") :  cpCostData = new CPBuildingCovGroup2CostData(start, end, cov.Currency, RateCache, cov.FixedId, state)
                               break
      case ("cpDeductBroad") : cpCostData = new CPBuildingCovBroadCostData(start, end, cov.Currency, RateCache, cov.FixedId, state)
                               break
      case ("cpDeductSpecial") :  cpCostData =  new CPBuildingCovSpecialCostData(start, end, cov.Currency, RateCache, cov.FixedId, state)
                               break
      default: throw "Unknown Deductible Factor Name"
    }
    cpCostData.init(PolicyLine)

    return cpCostData
  }

  private function getRateBook( refDate : Date, offeringCode: String ) : RateBook {
    return RateBook.selectRateBook(refDate,
                                   _baseRatingDate,
                                   _linePatternCode,
                                   _jurisdiction,
                                   _minimumRatingLevel,
                                   _renewal,
                                   offeringCode)
  }

  private function getRateRoutineName(cov: CPBuildingCov) : String {
    switch (typeof cov) {
      case CPBldgCov:
        return "cp_bldg_cov_premium_rr"
      case CPBPPCov:
        return "cp_bpp_cov_premium_rr"
      default:
        throw "No rate routine defined for " + typeof cov + " coverage"
    }
  }

  private function updateDeductFactor(params : Map<CalcRoutineParamName, Object>, factorName : String) {
    params.put(TC_CPDEDUCTFACTORNAME, factorName)
  }


  private function createParamMap(cov: CPBuildingCov, deductFactorName: String) : Map<CalcRoutineParamName, Object> {
    switch (typeof cov) {
      case CPBldgCov: return {TC_POLICYLINE->PolicyLine,
                              TC_BUILDING ->cov.CPBuilding,
                              TC_CPBLDGCOV ->cov,
                              TC_CPDEDUCTFACTORNAME ->  deductFactorName
                              }

      case CPBPPCov: return {TC_POLICYLINE->PolicyLine,
                             TC_BUILDING ->cov.CPBuilding,
                             TC_CPBPPCOV ->cov,
                             TC_CPDEDUCTFACTORNAME ->  deductFactorName}

      default: throw "No rate routine param set defined for " + typeof cov + " coverage"
    }
  }

  private function logDebugRatedCost(costData : CostData) {
    logDebugRatedCost("Rated", costData)
  }

  private function logDebugRatedCost(preMsg : String, costData : CostData) {
    if (_rfLogger.DebugEnabled) {
      _rfLogger.debug(preMsg + " " + costData.debugString() + " for " + costData)
    }
  }

}
