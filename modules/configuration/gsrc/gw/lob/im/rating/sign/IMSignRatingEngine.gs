package gw.lob.im.rating.sign

uses gw.api.domain.financials.PCFinancialsLogger
uses gw.lob.im.rating.IMAbstractPartRatingEngine
uses gw.rating.CostData
uses java.math.RoundingMode
uses gw.financials.PolicyPeriodFXRateCache

@Export
class IMSignRatingEngine extends IMAbstractPartRatingEngine {
  
  private var _part : IMSignPart
  
  construct(signPart : IMSignPart, rateCache : PolicyPeriodFXRateCache) {
    super(rateCache)
    _part = signPart
    _line = signPart.InlandMarineLine
    _branch = _part.Branch
  }
  
  static function rate(signPart : IMSignPart, rateCache : PolicyPeriodFXRateCache) : List<CostData> {
    var engine = new IMSignRatingEngine(signPart, rateCache)
    PCFinancialsLogger.logInfo ("Rating IMSign Part")
    engine.rateIMSigns(signPart)
    PCFinancialsLogger.logInfo ("Rating IMSign Part done.")
    return engine._costDatas
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private function rateIMSigns(signPart : IMSignPart) {
    signPart.IMSigns.each(\ sign -> _costDatas.add(rateSign(sign)))
  }
  
  private function rateSign (sign : IMSign) : IMSignCovCostData {
    var cov = sign.IMSignCov
    var limit = cov.IMSignLimitTerm.Value
    if (limit == null) {
      throw "Should not have gotten a null value for sign.IMSignCov.IMSignLimitTerm.Value"
    }

    var deductible = cov.IMSignDeductibleTerm.Value
    var deductibleFactor = 1.0
    var start = sign.SliceDate
    var end = nextSliceDateAfter(start)
    var state = _line.BaseState
    var costData = new IMSignCovCostData(start, end, cov.Currency, RateCache, cov.FixedId, sign.IMSignPart.FixedId)
    var existingCost = costData.getExistingCost(_line)
    
    costData.NumDaysInRatedTerm = 365
    costData.EffectiveDate = start
    costData.ExpirationDate = end
    costData.Basis = limit.setScale(0, RoundingMode.HALF_UP)
    if (deductible == 5) {
      deductibleFactor = 0.9
    }
    costData.StandardBaseRate = 0.85
    costData.StandardAdjRate = 
        costData.StandardBaseRate
        * deductibleFactor
        * sign.Branch.getUWCompanyRateFactor(baseRatingDate(), state)
        * _line.Branch.getProductModifierFactor()
    costData.StandardTermAmount = computeTermAmount(costData, costData.StandardAdjRate, true)
    logDebugRatedCostData(costData)
    costData.Overridable = sign.SignType <> "fluorescent"
    applyOverrides(existingCost, costData, true)
    return costData
  }
}
