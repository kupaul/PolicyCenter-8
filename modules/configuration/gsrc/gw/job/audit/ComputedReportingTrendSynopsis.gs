package gw.job.audit

uses gw.api.util.DateUtil
uses java.math.BigDecimal
uses java.math.RoundingMode
uses gw.api.util.MonetaryAmounts

@Export
class ComputedReportingTrendSynopsis extends ReportingTrendSynopsis {

  construct(reportingPeriod : PolicyPeriod) {
    super(reportingPeriod)
  }

  override function initializeDaysReported(reportingPeriod : PolicyPeriod) {
    var infos = activePremiumReportAuditInfos(reportingPeriod)
    _daysReported = 0
    for (ai in infos) {
      _daysReported += DateUtil.daysBetween(ai.AuditPeriodStartDate, ai.AuditPeriodEndDate)
    }
  }

  override function initializeTotalReportedPremium(reportingPeriod : PolicyPeriod) {
    var completedReports = reportingPeriod.CompletedNotReversedPremiumReports
    var currency = reportingPeriod.PreferredSettlementCurrency

    _totalReportedPremium = completedReports.sum(currency, \ cr ->
      cr.Audit.PolicyPeriod.AllTransactions.sum(currency, \ t -> t.Charged and t.Cost.SubjectToReporting ? t.Amount : MonetaryAmounts.zeroOf(currency))
    )

    // If this is a premium report that's quoted but not complete, then add in its transactions as well
    if (reportingPeriod.Job typeis Audit
        and reportingPeriod.Audit.AuditInformation.IsPremiumReport
        and reportingPeriod.Status != "AuditComplete") {
      _totalReportedPremium += reportingPeriod.AllTransactions.where(\ t -> t.Charged and t.Cost.SubjectToReporting).AmountSum(reportingPeriod.PreferredSettlementCurrency)
    }
    _totalReportedPremium = _totalReportedPremium.setScale(0, RoundingMode.HALF_UP)
  }

  override function initializeTotalEstimatedPremium(reportingPeriod : PolicyPeriod) {
    var period = reportingPeriod.Job typeis Audit ? reportingPeriod.LatestPeriod : reportingPeriod
    var costs = period.AllCosts.where(\ c -> c.SubjectToReporting)
    var infos = activePremiumReportAuditInfos(reportingPeriod)
    _totalEstimatedPremium = BigDecimal.ZERO.ofCurrency(reportingPeriod.PreferredSettlementCurrency)
    for (c in costs) {
      for(ai in infos) {
        if (not ((ai.AuditPeriodStartDate <= c.EffectiveDate and ai.AuditPeriodEndDate <= c.EffectiveDate) or
                (ai.AuditPeriodStartDate >= c.ExpirationDate and ai.AuditPeriodEndDate >= c.ExpirationDate))) {
          var startDate = ai.AuditPeriodStartDate < c.EffectiveDate ? c.EffectiveDate : ai.AuditPeriodStartDate
          var endDate = ai.AuditPeriodEndDate > c.ExpirationDate ? c.ExpirationDate : ai.AuditPeriodEndDate
          _totalEstimatedPremium += c.getAmountBetween(startDate, endDate, RoundingMode.CEILING)
        }
      }
    }
    _totalEstimatedPremium = _totalEstimatedPremium.setScale(0, RoundingMode.HALF_UP)
  }

  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private function activePremiumReportAuditInfos(reportingPeriod : PolicyPeriod) : List<AuditInformation> {
    var infos = reportingPeriod.CompletedNotReversedPremiumReports.toList()
    if (reportingPeriod.Job typeis Audit) {
      var info = reportingPeriod.Audit.AuditInformation
      if (!infos.contains(info) && info.IsPremiumReport && not info.IsReversal) {
        infos.add(info)
      }
    }
    return infos
  }
}
