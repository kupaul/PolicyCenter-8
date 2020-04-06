package gw.job.audit

@Export
class PersistedReportingTrendSynopsis extends ReportingTrendSynopsis {

  construct(reportingPeriod : PolicyPeriod) {
    super(reportingPeriod)
  }

  override function initializeTotalReportedPremium(reportingPeriod : PolicyPeriod) {
    _totalReportedPremium = reportingPeriod.PolicyTerm.TotalReportedPremium
  }

  override function initializeTotalEstimatedPremium(reportingPeriod : PolicyPeriod) {
    _totalEstimatedPremium = reportingPeriod.PolicyTerm.TotalEstimatedPremium
  }

  override function initializeDaysReported(reportingPeriod : PolicyPeriod) {
    _daysReported = reportingPeriod.PolicyTerm.DaysReported
  }
}
