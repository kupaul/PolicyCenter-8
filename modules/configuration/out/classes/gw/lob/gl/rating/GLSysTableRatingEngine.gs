package gw.lob.gl.rating

uses entity.windowed.GLExposureVersionList
uses gw.api.domain.covterm.OptionCovTerm
uses gw.api.domain.financials.PCFinancialsLogger
uses gw.api.productmodel.CoveragePattern
uses gw.api.util.JurisdictionMappingUtil
uses gw.financials.Prorater
uses gw.plugin.policyperiod.impl.SysTableRatingPlugin
uses gw.rating.AbstractRatingEngine
uses gw.rating.CostData
uses gw.rating.RateAdjFactorSearchCriteria

uses java.lang.Iterable
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.util.ArrayList
uses java.util.Date
uses gw.api.util.MonetaryAmounts
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern

@Export
class GLSysTableRatingEngine extends AbstractRatingEngine<GLLine> {
  var _baseRatingDate : DateTime

  construct(line : GLLine) {
    super(line)
    // set the base Rating using the first policyperiod in the term.
    // this will be used for U/W lookup and other basic items
    // rating date by object will be set separately
    _baseRatingDate = line.Branch.FirstPeriodInTerm.getReferenceDateForCurrentJob( line.BaseState )
  }

  override protected function existingSliceModeCosts() : Iterable<Cost> {
    return PolicyLine.Costs.where(\c -> c typeis GLCovExposureCost)
  }

  // Used by the extractCostDatasFromExistingCosts method.  Must be implemented if that method is going to be called
  override protected function createCostDataForCost(c : Cost) : CostData {
    switch(typeof c) {
      case GLCovExposureCost:  return new GLCovExposureCostData(c, RateCache)
      default: throw "Unepxected cost type ${c.DisplayName}"
    }
  }

  protected override function shouldRateThisSliceForward() : boolean {
    return false
  }

  protected override function rateSlice(lineVersion : GLLine) {
    var logMsg = "Rating " + lineVersion + " " + lineVersion.SliceDate + " version..."
    PCFinancialsLogger.logInfo( logMsg  )
    rateCoverages(lineVersion)
    PCFinancialsLogger.logInfo( logMsg + "done" )
  }

  protected override function rateWindow(lineVersion : GLLine) {
    rateBasisScalableExposures()
    rateAddlInsured(lineVersion)
    rateTaxes(lineVersion)
  }

  private function rateAddlInsured(lineVersion : GeneralLiabilityLine) {
    var start = lineVersion.EffectiveDate
    var end = lineVersion.ExpirationDate

    for (addlInsured in getRepresentativeAdditionalInsureds(PolicyLine)) {
      var cost = new GLAddlInsuredCostData(start, end, lineVersion.Branch.PreferredCoverageCurrency, RateCache,
          PolicyLine.BaseState, addlInsured.FixedId, null, null)
      cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm
      cost.Basis = 1
      cost.ActualBaseRate = 17
      cost.ActualAdjRate = cost.ActualBaseRate * Branch.getProductModifierFactor()
      cost.ActualTermAmount = (cost.Basis * cost.ActualAdjRate).setScale( this.RoundingLevel, RoundingMode)
      cost.ActualAmount = cost.ActualTermAmount
      addCost(cost)
    }
  }

  private function rateTaxes(lineVersion : GeneralLiabilityLine) {
    var taxBases = CostDatas
      .partition( \ cost -> (cost as GLCostData).State )
      .mapValues( \ costs -> costs.sum(\c -> c.ActualAmountBilling.Amount)) // want this in settlement currency
    taxBases.eachKeyAndValue( \ state, basis -> rateTax( lineVersion, state, basis ) )
  }

  private function rateTax(lineVersion : GeneralLiabilityLine, glState : Jurisdiction, basis : BigDecimal) {
    var cost = new GLStateCostData(Branch.PeriodStart,
                                   Branch.PeriodEnd,
                                   TaxRatingCurrency, RateCache,
                                   glState, "Tax", null, null)
    cost.NumDaysInRatedTerm = lineVersion.Branch.NumDaysInPeriod
    cost.Basis              = basis
    cost.ActualBaseRate     = getStateTaxRate(cost.State)
    cost.ActualAdjRate      = cost.ActualBaseRate
    cost.ActualTermAmount   = (cost.Basis * cost.ActualAdjRate).setScale( this.RoundingLevel, RoundingMode)
    cost.ActualAmount       = cost.ActualTermAmount
    addCost(cost)
  }

  private function getRepresentativeAdditionalInsureds(lineVersion : GeneralLiabilityLine) : Iterable<PolicyAddlInsured> {
    return lineVersion.Branch.VersionList.PolicyContactRoles.map( \ contactVL -> contactVL.AllVersions.first() )
      .whereTypeIs( PolicyAddlInsured ).where( \ addIns -> addIns.PolicyLine == lineVersion )
  }

  private static var RATING_LINE_COVERAGES = "Rating line coverages..."

  private function rateCoverages(lineVersion : GeneralLiabilityLine) {  //hacking copy from GeneralLiabilityLineRatingEnhancement
    var start = lineVersion.SliceDate
    var end = getNextSliceDateAfter(lineVersion.SliceDate)
    if (lineVersion.Branch.isCanceledSlice()) {
      PCFinancialsLogger.logInfo(RATING_LINE_COVERAGES + "not rating canceled slice.")
      return
    }
    PCFinancialsLogger.logInfo(RATING_LINE_COVERAGES)
    var covs = lineVersion.GLLineCoverages
    for (cov in covs) {
      switch (typeof cov) {
        case GLCGLCov:
          rateCoverage(new GLCGLCovWrapper(cov), start, end)
          break
        default:
          PCFinancialsLogger.logInfo( "No rating defined yet for GL Coverage " + cov.Pattern )
      }
    }
    PCFinancialsLogger.logInfo(RATING_LINE_COVERAGES + "done")
  }

  private function rateBasisScalableExposures() {
    for (exp in PolicyLine.VersionList.Exposures) {
      if (exp.AllVersions.first().ClassCode.Basis.Auditable) {
        rateExposureAcrossSlices(exp)
      }
    }
  }

  // For basis-scalable exposures, we rate them by finding all versions and rating across them.  At each point in
  // time, we check to see if the cost has changed to what we've been accumulating.  If so, we emit the old cost
  // and store the new one.  If not, we merge it in and keep going.
  private function rateExposureAcrossSlices(expVL : GLExposureVersionList) {
    var previousCosts : List<GLCostData> = {}

    for (startDate in AllEffectiveDates index i) {
      var exp = expVL.AsOf(startDate)
      if (exp != null and not Branch.getSlice(startDate).isCanceledSlice()) {
        var endDate = i < (AllEffectiveDates.size() - 1) ? AllEffectiveDates[i + 1] : Branch.PeriodEnd
        exp = exp.getSlice(startDate)

        for (cov in exp.GLLine.GLLineCoverages) {
          var tempCosts : List<GLCostData> = {}
          rateCoverageForBasisScalableExposure(exp, cov, startDate, endDate, tempCosts)
          accumulateAndEmitCosts(exp, previousCosts, tempCosts)
        }
      } else {
        // Emit any costs we've accumulated; if there was a gap and the exposure becomes effective again
        // at a later date, we'll start over accumulating costs
        addCosts(previousCosts)
        previousCosts.clear()
      }
    }

    // Emit anything left that hasn't yet been emitted
    addCosts(previousCosts)
    previousCosts.clear()
  }

  // Given the set of pre-existing costs and newly-calculated costs, either merge them in with the existing list of
  // costs or just add them in, and if necessary emit any previous costs
  private function accumulateAndEmitCosts(exp : GLExposure, previousCosts : List<GLCostData>, tempCosts : List<GLCostData>) {
    for (tempCost in tempCosts) {
      var previousCost = previousCosts.firstWhere(\previousCost -> previousCost.Key == tempCost.Key)
      if (previousCost == null) {
        // Just add it to the buffer
        previousCosts.add(tempCost)
      } else if (previousCost.mergeAsBasisScalableIfCostEqual(tempCost)) {
        // Merge successful, so recalculate the term and actual amounts
        previousCost.ActualTermAmount =  (previousCost.Basis * exp.ClassCode.Basis.RateFactor * previousCost.ActualAdjRate)
            .setScale( RoundingLevel, RoundingMode )
        previousCost.ActualAmount = previousCost.ActualTermAmount
      } else {
         // Merge failed, so emit the previous cost, then add in the new one to our buffer in its place
         addCost(previousCost)
         previousCosts.remove(previousCost)
         previousCosts.add(tempCost)
      }
    }
  }

  private function rateCoverageForBasisScalableExposure(exp : GLExposure, cov : GeneralLiabilityCov, startDate : Date, endDate : Date, tempCosts : List<GLCostData>) {
    switch (typeof cov) {
      case GLCGLCov:
        rateGLCoverageAndExposure(new GLCGLCovWrapper(cov), exp, startDate, endDate, tempCosts)
        break
      default:
        PCFinancialsLogger.logInfo( "No rating defined yet for GL Coverage " + cov.Pattern )
    }
  }

  private function rateCoverage(cov : GLCovWrapper, start : Date, end : Date) {
    var costs : List<CostData> = {}
    for (exp in cov.Cov.GLLine.Exposures) {
      if (not exp.ClassCode.Basis.Auditable) {
        rateGLCoverageAndExposure(cov, exp, start, end, costs)
      }
    }
    addCosts(costs)
  }

  private function rateGLCoverageAndExposure(cov : GLCovWrapper, exp: GLExposure, start : Date, end : Date, costs : List<CostData>) {
    rateGLCoverageAndExposureForSubline(cov, exp, start, end, "Premises", costs)
    rateGLCoverageAndExposureForSubline(cov, exp, start, end, "Products", costs)
  }

  private function rateGLCoverageAndExposureForSubline(cov : GLCovWrapper, exp: GLExposure, start : Date, end : Date, subline : GLCostSubline, costs : List<CostData>) {
    if (cov.Cov.GLLine.SplitLimits) {
      rateGLCoverageAndExposureForSublineAndSplitType(cov, exp, start, end, subline, GLRatingSplitTypeHandler.BI_SPLIT_TYPE_HANDLER, costs)
      rateGLCoverageAndExposureForSublineAndSplitType(cov, exp, start, end, subline, GLRatingSplitTypeHandler.PD_SPLIT_TYPE_HANDLER, costs)
    } else {
      rateGLCoverageAndExposureForSublineAndSplitType(cov, exp, start, end, subline, GLRatingSplitTypeHandler.CSL_SPLIT_TYPE_HANDLER, costs)
    }
  }

  private function rateGLCoverageAndExposureForSublineAndSplitType(cov : GLCovWrapper, exp: GLExposure,
        start : Date, end : Date, subline : GLCostSubline, splitTypeHandler : GLRatingSplitTypeHandler, costs : List<CostData>) {
    var cost = new GLCovExposureCostData(start, end, cov.Cov.Currency, RateCache, JurisdictionMappingUtil.getJurisdiction(exp.Location),
        cov.Cov.FixedId, exp.FixedId, exp.ClassCode.Basis.Auditable, subline, splitTypeHandler.SplitType)
    cost.NumDaysInRatedTerm = this.NumDaysInCoverageRatedTerm

    if (exp.ClassCode.Basis.Auditable) {
      cost.Basis   = prorateBasis( start, end, exp )
    } else {
      cost.Basis   = exp.BasisForRating
    }

    cost.ActualBaseRate = splitTypeHandler.getRateFor(exp.ClassCode.Code, JurisdictionMappingUtil.getJurisdiction(exp.Location), subline, start)
    cost.ActualAdjRate = cost.ActualBaseRate
                    * splitTypeHandler.calcIncreasedLimitsFactor( cov )
                    * getClaimsMadeFactor(PolicyLine)
                    * getUWCompanyRateFactor()
                    * Branch.getProductModifierFactor()
                    * getModifierFactor(PolicyLine)
    cost.ActualTermAmount =  (cost.Basis * exp.ClassCode.Basis.RateFactor * cost.ActualAdjRate)
        .setScale( RoundingLevel, RoundingMode )
    // Jira PC-14448:
    // If the classcode is basis-scalable, we DON'T want the amount prorated, so
    // we need to set the ActualAmount field to the ActualTermAmount
    if (exp.ClassCode.Basis.Auditable) {
      cost.ActualAmount = cost.ActualTermAmount
    }

    costs.add(cost)
  }

  private function getUWCompanyRateFactor() : BigDecimal {
    return Branch.getUWCompanyRateFactor( _baseRatingDate, PolicyLine.BaseState )
  }

  private property get RoundingLevel() : int {
    return Branch.Policy.Product.QuoteRoundingLevel
  }

  private property get RoundingMode() : RoundingMode {
    return Branch.Policy.Product.QuoteRoundingMode
  }

  private static function getIncreaseLimitFactor(
      coverage : GeneralLiabilityCov, occ : OptionCovTerm, agg : OptionCovTerm, ratingDate : Date ) : BigDecimal {
    var occVal = occ.Value
    var aggVal = agg.Value
    // TEMPORARY CODE BECAUSE OF THE LIMITED RATE VALUES THAT ARE IN TABLE
    if (occVal > 200000) {
      occVal = 200000
    }
    if (occVal == 100000 and aggVal > 1000000) {
      aggVal = 1000000
    } else if (occVal == 200000 and aggVal > 2000000) {
      aggVal = 2000000
    }
    //END OF TEMP CODE

    //  Lookup Increased limit factor
    var incLimitFactor = new RateAdjFactorSearchCriteria( "glIncrLimit", ratingDate )
                         .match( (occVal/1000) as String, (aggVal/1000) as String, coverage.GLLine.BaseState)
    if (incLimitFactor == null or incLimitFactor == 0) {
      incLimitFactor = 1.05
    }

    return incLimitFactor
  }

  static abstract class GLCovWrapper<W extends GeneralLiabilityCov> {
    private var _cov : W as Cov
    construct (myCov : W) {
      _cov = myCov
    }
    abstract property get CSLIncreasedLimitFactor() : BigDecimal
    abstract property get BIIncreasedLimitFactor() : BigDecimal
    abstract property get PDIncreasedLimitFactor() : BigDecimal
  }

  class GLCGLCovWrapper extends GLCovWrapper<GLCGLCov> {
    construct (myCov : GLCGLCov) {
      super(myCov)
    }
    override property get CSLIncreasedLimitFactor() : BigDecimal {
      var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(Cov.Pattern as CoveragePattern, Cov.GLLine)
      return getIncreaseLimitFactor(Cov, Cov.GLCGLOccLimitTerm, Cov.GLCGLAggLimitTerm, ratingDate)
    }

    override property get BIIncreasedLimitFactor() : BigDecimal {
      var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(Cov.Pattern as CoveragePattern, Cov.GLLine)
      return getIncreaseLimitFactor(Cov, Cov.GLCGLBILimitTerm, Cov.GLCGLBIAggLimitTerm, ratingDate)
    }
    override property get PDIncreasedLimitFactor() : BigDecimal {
      var ratingDate = ReferenceDatePlugin.getCoverageReferenceDate(Cov.Pattern as CoveragePattern, Cov.GLLine)
      return getIncreaseLimitFactor(Cov, Cov.GLCGLPDLimitTerm, Cov.GLCGLPDAggLimitTerm, ratingDate)
    }
  }

  private function prorateBasis(startDate : Date, endDate : Date, exposure : GLExposure) : int {
    return Prorater.forRounding(0, RoundingMode, TC_PRORATABYDAYS)
        .prorate( exposure.EffectiveDate, exposure.ExpirationDate, startDate, endDate, exposure.BasisForRating).intValue()
  }

  private function getClaimsMadeFactor(line : GeneralLiabilityLine) : BigDecimal {
    return line.GLCoverageForm == "ClaimsMade" ? 0.91 : 1.0
  }

  private function getModifierFactor(line : GeneralLiabilityLine) : BigDecimal {
    var factor : BigDecimal = 1
    if ( line.Modifiers.Count < 1 ) {
      return factor
    }
    //  If there are multiple modifiers they combine multiplicatively, not additively
    line.Modifiers
      .where(\ m -> m.DataType == typekey.ModifierDataType.TC_RATE and m.RateModifier != null)
      .each( \ mod -> { factor = factor * (1 + mod.RateModifier ) } )
    return factor
  }
}
