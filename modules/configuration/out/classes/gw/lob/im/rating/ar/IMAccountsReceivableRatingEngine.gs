package gw.lob.im.rating.ar

uses gw.api.domain.financials.PCFinancialsLogger
uses gw.lob.im.rating.IMAbstractPartRatingEngine
uses gw.rating.CostData
uses java.math.RoundingMode
uses gw.financials.PolicyPeriodFXRateCache

@Export
class IMAccountsReceivableRatingEngine extends IMAbstractPartRatingEngine {
  
  private var _part : IMAccountsRecPart
  
  construct(arPart : IMAccountsRecPart, rateCache : PolicyPeriodFXRateCache) {
    super(rateCache)
    _line = arPart.InlandMarineLine
    _part = arPart
    _branch = _part.Branch
  }
   
  static function rate(arPart : IMAccountsRecPart, rateCache : PolicyPeriodFXRateCache) : List<CostData> {
    var engine = new IMAccountsReceivableRatingEngine(arPart, rateCache)
    PCFinancialsLogger.logInfo ("Rating Accounts Receivable Part")
    engine.ratePart()
    engine.rateReceivables()
    PCFinancialsLogger.logInfo ("Rating Accounts Receivable Part done.")
    return engine._costDatas
  }

  //
  // PRIVATE SUPPORT FUNCTIONS
  //    
  private function ratePart()  {
    if(_part.AccountsRecOffPremisesPropertyExists) {
      _costDatas.add(rateOffPremisesProperty())
    }   
  }
  
  private function rateOffPremisesProperty() : CostData {
    var arCov = _part.AccountsRecOffPremisesProperty
    var arCovLimit = arCov.AccountsRecOffPremisesPropertyLimitTerm
    var limit = arCovLimit.Value
    var costData = new IMAccountsRecPartCovCostData(_part.SliceDate, nextSliceDateAfter(_part.SliceDate), arCov.Currency, RateCache, arCov.FixedId, _part.FixedId)
    var state = _line.BaseState
    var rateFactor = _part.Branch.getUWCompanyRateFactor(baseRatingDate(), state)
    var existingCost = costData.getExistingCost(_line)

    costData.NumDaysInRatedTerm = 365
    costData.Basis = limit.setScale(0, RoundingMode.HALF_UP)
    costData.StandardBaseRate = 0.25
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * rateFactor
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, true)
    costData.Overridable = false
    applyOverrides(existingCost, costData, true)
    return costData 
  }

  private function rateReceivables() {
    PCFinancialsLogger.logInfo ("Rating Accounts Receivables...")
    _part.IMAccountsReceivables.each(\ i -> _costDatas.add(rateCoverage(i)))
    PCFinancialsLogger.logInfo ("Rating Accounts Receivables done")
    return
  }
    
  private function rateCoverage(arCoverable : entity.IMAccountsReceivable) : CostData {
    var arCov = arCoverable.IMAccountReceivableCov
    var arCovLimit = arCov.IMAccountsReceivableLimitTerm
    var costData = new IMAccountsRecCovCostData(_part.SliceDate, nextSliceDateAfter(_part.SliceDate), arCov.Currency, RateCache, arCov.FixedId, _part.FixedId)
    var limit = arCovLimit.Value
    var state = _line.BaseState
    var rateFactor = _part.Branch.getUWCompanyRateFactor(baseRatingDate(), state)
    var existingCost = costData.getExistingCost(_line)

    costData.NumDaysInRatedTerm = 365
    costData.Basis = limit.setScale(0, RoundingMode.HALF_UP)
    costData.StandardBaseRate =  0.25
    costData.StandardAdjRate =
        costData.StandardBaseRate
        * rateFactor
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, true)
    applyOverrides(existingCost, costData, true)
    return costData
  }
}
