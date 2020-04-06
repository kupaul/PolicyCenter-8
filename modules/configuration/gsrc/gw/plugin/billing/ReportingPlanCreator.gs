package gw.plugin.billing

uses gw.api.productmodel.AuditSchedulePatternLookup
uses gw.api.system.PCLoggerCategory

@Export
class ReportingPlanCreator {
  static function createReportingPlansForPlanId(planId: String): List< ReportingPlanData > {
    var pcReportingPlans : List< ReportingPlanData > = {}
    var auditSchedulePatterns = AuditSchedulePatternLookup.getAll().where(\elt -> elt.PaymentPlanCode == planId)
    if (auditSchedulePatterns.size() == 0) {
      PCLoggerCategory.BILLING_SYSTEM_PLUGIN.warn(displaykey.BillingSystemPlugin.Error.NoAuditSchedulePatternsFound(planId))
    }

    // Add one PC PaymentPlanSummary for each AuditSchedulePattern we found matching the billing system's payment plan Public ID
    for (reportingPattern in auditSchedulePatterns) {
      var newReportingPlan = new ReportingPlanDataImpl ()
      newReportingPlan.BillingId = planId
      newReportingPlan.ReportingPatternCode = reportingPattern.Code
      pcReportingPlans.add(newReportingPlan)
    }

    return pcReportingPlans
  }
}