package gw.job.sxs

uses gw.api.productmodel.CoveragePattern
uses gw.api.domain.covterm.CovTerm
uses java.math.BigDecimal
uses gw.pl.currency.MonetaryAmount
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.CoveragePattern

@Export
class SideBySideCoverageInfo {
  var _periodInfo : SideBySidePolicyPeriodInfo as readonly PeriodInfo
  var _coverable : Coverable as readonly Coverable
  var _covPattern : CoveragePattern as readonly CoveragePattern
  var _covTerms : List<CovTerm> as CoverageTerms
  var _coverage : Coverage
  var _coverageInitiallySelectedOrAvailable : boolean as IsCoverageInitiallySelectedOrAvailable = false
  
  construct(policyPeriodInfo : SideBySidePolicyPeriodInfo, covered : Coverable, covPattern : CoveragePattern) {
    _periodInfo = policyPeriodInfo
    _coverable = covered
    _covPattern = covPattern
    _covTerms = null
    if (_coverable != null and _covPattern != null) {
      _coverage = _coverable.getCoverage(_covPattern)
      _coverageInitiallySelectedOrAvailable = _coverable.isCoverageSelectedOrAvailable(_covPattern)
      if (_coverage != null and _coverage.Bundle != null) {
        _covTerms = _coverage.CovTerms as List<CovTerm>
      }
    }
  }

  property get Selected() : boolean {
    return (Coverage != null)
  }

  property set Selected(sel : boolean) {
    Coverable.setCoverageExists(CoveragePattern, sel)
    if (sel) {
      _coverage = _coverable.getCoverage(_covPattern)
    } else {
      _coverage = null
    }
  }

  property get Coverage() : Coverage {
    if (_coverage.Bundle == null) {
      if (_coverable !=null and _covPattern != null) {
        _coverage = _coverable.getCoverage(_covPattern)
      }
    }
    return _coverage
  }

  property get AllowToggle() : boolean {
    return Coverable != null and IsCoverageInitiallySelectedOrAvailable and CoveragePattern.allowToggle(Coverable)
  }

  property get Cost() : Cost {
    if (Coverage.PolicyLine == null) {
      return null
    } else {
      var costs = Coverage.PolicyLine.getAllCostsForCoverage(Coverable, CoveragePattern)
      if (costs.size() == 0) {
        return null
      } else {
        return costs.first()
      }
    }
  }

  property get TotalCost() : MonetaryAmount {
    if (Coverage.PolicyLine == null) {
      return null
    } else {
      var costs = Coverage.PolicyLine.getAllCostsForCoverage(Coverable, CoveragePattern)
      if (costs.size() > 0) {
        return costs.sum(\c -> c.ActualAmountBilling)
      }
      return new MonetaryAmount(0, (Coverage.BranchUntyped as PolicyPeriod).PreferredSettlementCurrency)
    }
  }

  property get IsCostVisible() : boolean {
    if (Coverage.PolicyLine == null) {
      return null
    } else {
      return Coverage.PolicyLine.isCostVisible(Coverable, CoveragePattern)
    }
  }

  property get AssociatedPeriodQuoted() : boolean {
    return _periodInfo.AssociatedPeriodQuoted
  }

  property get CoverageTerms() : List<CovTerm> {
    return _covTerms
  }

  /**
   * Does the necessary refresh when a coverage is selected/unselected.
   */
  public function coverageSelectionRefresh() {
    PeriodInfo.Period.editIfQuoted()
    gw.web.productmodel.ProductModelSyncIssuesHandler.syncCoverages(PeriodInfo.Period.Lines*.AllCoverables, null)
    PeriodInfo.refreshSideBySideStep()
  }
}
