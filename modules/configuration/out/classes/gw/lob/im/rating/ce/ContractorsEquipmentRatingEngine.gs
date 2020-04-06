package gw.lob.im.rating.ce

uses gw.api.domain.financials.PCFinancialsLogger
uses gw.api.util.Math
uses gw.lob.im.rating.IMAbstractPartRatingEngine
uses gw.rating.CostData
uses java.math.BigDecimal
uses java.math.RoundingMode
uses gw.financials.PolicyPeriodFXRateCache

@Export
class ContractorsEquipmentRatingEngine extends IMAbstractPartRatingEngine {

  private var _part : ContractorsEquipPart
  
  private construct(cePart : ContractorsEquipPart, rateCache : PolicyPeriodFXRateCache) {
    super(rateCache)
    _part = cePart
    _line = cePart.InlandMarineLine
    _branch = _part.Branch
  }
  
  static function rate(cePart : ContractorsEquipPart, rateCache : PolicyPeriodFXRateCache) : List<CostData> {
    var engine = new ContractorsEquipmentRatingEngine(cePart, rateCache)
    PCFinancialsLogger.logInfo ("Rating Contractors Equipment Part")
    engine.rateContractorsEquipmentPart()
    engine.rateScheduledEquipments()
    PCFinancialsLogger.logInfo ("Rating Contractors Equipment Part done.")
    return engine._costDatas
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private function rateContractorsEquipmentPart() {
    if (_part.ContractorsEquipMiscUnscheduledCovExists) {
      _costDatas.add(rateMiscUnscheduledCoverage())
    }
    if (_part.ContractorsEquipAdditionallyAcquiredPropertyExists) {
      _costDatas.add(rateAdditionallyAcquiredProperty())
    }
    if (_part.ContractorsEquipDebrisRemovalExists) {
      _costDatas.add(rateDebrisRemoval())
    }
    if (_part.ContractorsEquipEmployeesToolsExists) {
      _costDatas.add(rateEmployeesTools())
    }
    if (_part.ContractorsEquipPollutionCleanupExists) {
      _costDatas.add(ratePollutionCleanup())
    }
    if (_part.ContractorsEquipPreservationOfPropertyExists) {
      _costDatas.add(ratePreservationOfProperty()) 
    }
    if (_part.ContractorsEquipRentalReibursementExists) {
      _costDatas.add(rateRentalReibursement()) 
    }
    if (_part.ContractorsEquipRentedEquipmentExists) {
      _costDatas.add(rateRentedEquipment())
    }
  }
  
  private function rateRentedEquipment() : CostData {
    var cov = _part.ContractorsEquipRentedEquipment
    var costData = createEquipPartCovCostData(cov)
    var limit = cov.ContractorsEquipRentedEquipmentLimitTerm.Value
    var deductible = cov.ContractorsEquipRentedEquipmentDeductibleTerm.Value
    var state = _line.BaseState
    var deductibleFactor = createdeductibleFactor(limit, deductible)
    var UWCompanyRateFactor = _part.Branch.getUWCompanyRateFactor(baseRatingDate(), state)
    var existingCost = costData.getExistingCost(_line)

    costData.Basis = limit.setScale(0, RoundingMode.HALF_UP)
    costData.StandardBaseRate = 0.25
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * deductibleFactor
        * UWCompanyRateFactor
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, true)
    applyOverrides(existingCost, costData, true)
    return costData
  }

  private function rateRentalReibursement() : CostData {
    var cov = _part.ContractorsEquipRentalReibursement
    var costData = createEquipPartCovCostData(cov)
    var limit = cov.ContractorsEquipRentalReibursementOccurrenceLimitTerm.Value
    var deductible = cov.ContractorsEquipRentalReibursementDeductibleTerm.Value
    var state = _line.BaseState
    var deductibleFactor = createdeductibleFactor(limit, deductible)
    var UWCompanyRateFactor = _part.Branch.getUWCompanyRateFactor(baseRatingDate(), state)
    var existingCost = costData.getExistingCost(_line)

    costData.Basis = limit.setScale(0, RoundingMode.HALF_UP)
    costData.StandardBaseRate = 0.25
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * deductibleFactor
        * UWCompanyRateFactor
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, true)
    applyOverrides(existingCost, costData, true)
    return costData
  }
  
  private function ratePreservationOfProperty() : CostData {
    var cov = _part.ContractorsEquipPreservationOfProperty
    var costData = createEquipPartCovCostData(cov)
    var existingCost = costData.getExistingCost(_line)

    costData.Basis = 1
    costData.StandardBaseRate = 500
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * _part.Branch.getUWCompanyRateFactor(baseRatingDate(), _line.BaseState)
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, false)
    applyOverrides(existingCost, costData, false)
    return costData
  }
  
  private function ratePollutionCleanup() : CostData {
    var cov = _part.ContractorsEquipPollutionCleanup
    var costData = createEquipPartCovCostData(cov)
    var existingCost = costData.getExistingCost(_line)

    costData.Basis = 1
    costData.StandardBaseRate = 500
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * _part.Branch.getUWCompanyRateFactor(baseRatingDate(), _line.BaseState)
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, false)
    applyOverrides(existingCost, costData, false)
    return costData
  }
  
  private function rateEmployeesTools() : CostData {
    var cov = _part.ContractorsEquipEmployeesTools
    var costData = createEquipPartCovCostData(cov)
    var limit = _part.ContractorsEquipEmployeesTools.ContractorsEquipEmployeesToolsLimitTerm.Value
    var deductible = _part.ContractorsEquipEmployeesTools.ContractorsEquipEmployeesToolsDeductibleTerm.Value
    var standardBaseRate = 0.85
    var state = _line.BaseState
    var deductibleFactor = createdeductibleFactor(limit, deductible)
    var UWCompanyRateFactor = _part.Branch.getUWCompanyRateFactor(baseRatingDate(), state)
    var existingCost = costData.getExistingCost(_line)

    costData.Basis = limit.setScale(0, RoundingMode.HALF_UP)
    costData.StandardBaseRate = standardBaseRate
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * deductibleFactor
        * UWCompanyRateFactor
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, true)
    costData.Overridable = false
    applyOverrides(existingCost, costData, true)
    return costData
  }
  
  private function rateDebrisRemoval() : CostData {
    var cov = _part.ContractorsEquipDebrisRemoval
    var costData = createEquipPartCovCostData(cov)
    var existingCost = costData.getExistingCost(_line)
    
    costData.Basis = 1
    costData.StandardBaseRate = 750
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * _part.Branch.getUWCompanyRateFactor(baseRatingDate(), _line.BaseState)
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, false)
    applyOverrides(existingCost, costData, false)
    return costData
  }
  
  private function rateAdditionallyAcquiredProperty() : CostData {
    var cov = _part.ContractorsEquipAdditionallyAcquiredProperty
    var costData = createEquipPartCovCostData(cov)
    var existingCost = costData.getExistingCost(_line)
    
    costData.Basis = 1
    costData.StandardBaseRate = 250
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * _part.Branch.getUWCompanyRateFactor(baseRatingDate(), _line.BaseState)
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, false)
    applyOverrides(existingCost, costData, false)
    return costData
  }
  
  private function rateMiscUnscheduledCoverage() : CostData {
    var cov = _part.ContractorsEquipMiscUnscheduledCov
    var limit = cov.ContractorsEquipMiscUnscheduledLimitTerm.Value
    var deductible = cov.ContractorsEquipMiscUnscheduledDeductibleTerm.Value
    var start = _part.SliceDate
    var end = nextSliceDateAfter(start)
    var state = _line.BaseState
    var costData = createEquipPartCovCostData(_part.ContractorsEquipMiscUnscheduledCov)
    var UWCompanyRateFactor = _part.Branch.getUWCompanyRateFactor(baseRatingDate(), state)
    var deductibleFactor = createdeductibleFactor(limit, deductible)
    var existingCost = costData.getExistingCost(_line)
    
    costData.NumDaysInRatedTerm = 365
    costData.EffectiveDate = start
    costData.ExpirationDate = end
    costData.Basis = (limit).setScale(0, RoundingMode.HALF_UP)
    costData.StandardBaseRate = 0.85
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * deductibleFactor
        * UWCompanyRateFactor
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, true)
    applyOverrides(existingCost, costData, true)
    return costData
  }
  
  private function rateScheduledEquipments() {
    PCFinancialsLogger.logInfo ("Rating Contractors Equipment...")
    for (equipment in _part.ContractorsEquipments) {
      _costDatas.add(rateScheduledEquipment(equipment))
    }
    PCFinancialsLogger.logInfo ("Rating Contractors Equipment done.")
  }
  
  private function rateScheduledEquipment (equipment : ContractorsEquipment) : CostData {
    var cov = equipment.ContractorsEquipSchedCov
    var limit = cov.ContractorsEquipSchedCovLimitTerm.Value
    var deductible = cov.ContractorsEquipSchedCovDeductibleTerm.Value
    var state = _line.BaseState
    var costData = new ContractorsEquipSchedCovCostData(_part.SliceDate, nextSliceDateAfter(_part.SliceDate), equipment.PreferredCoverageCurrency, RateCache, cov.FixedId, _part.FixedId)
    var UWCompanyRateFactor = equipment.Branch.getUWCompanyRateFactor(baseRatingDate(), state)
    var deductibleFactor = createdeductibleFactor(limit, deductible)
    var existingCost = costData.getExistingCost(_line)
    
    costData.NumDaysInRatedTerm = 365
    costData.Basis = limit.setScale(0, RoundingMode.HALF_UP)
    costData.StandardBaseRate = 0.85
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * deductibleFactor
        * UWCompanyRateFactor
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, true)
    applyOverrides(existingCost, costData, true)
    return costData
  }

  private function createEquipPartCovCostData(cov : ContrEquipPartCov) : CostData {
    var costData = new ContractorsEquipPartCovCostData(_part.SliceDate, nextSliceDateAfter(_part.SliceDate), cov.Currency, RateCache, cov.FixedId, _part.FixedId)
    costData.NumDaysInRatedTerm = 365
    return costData
  }
  
  private function createdeductibleFactor(limit : BigDecimal, deductible : BigDecimal) : BigDecimal {
    if (deductible == null or deductible == BigDecimal.ZERO) {
      return 1
    }
    return (1 - Math.sqrt(deductible as double / limit as double) as BigDecimal)
  }
}
