package gw.plugin.billing

enhancement ReportingPlanDataArrayEnhancement: gw.plugin.billing.ReportingPlanData[] {
  function getByReportingPatternCode(code: String): ReportingPlanData {
    return this.firstWhere(\p -> p.ReportingPatternCode == code)
  }
}