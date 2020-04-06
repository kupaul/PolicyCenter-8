package gw.plugin.job.impl
uses gw.plugin.job.IAuditSchedulePatternSelectorPlugin
uses gw.api.productmodel.AuditSchedulePattern
uses gw.api.productmodel.AuditSchedulePatternLookup

@Export
class AuditSchedulePatternSelectorPlugin implements IAuditSchedulePatternSelectorPlugin {

  construct() {
  }

  @Deprecated("Deprecated in PolicyCenter 8.0.1. Instead, use gw.plugin.job.IAuditSchedulePatternSelectorPlugin.selectFinalAuditSchedulePatternForCancellation.")
  override function selectFinalAuditCancellationSchedulePattern(period : PolicyPeriod ) : AuditSchedulePattern {
    return selectFinalAuditSchedulePatternForCancellation(period)
  }

  override function selectFinalAuditSchedulePatternForCancellation(period : PolicyPeriod) : AuditSchedulePattern {
    return AuditSchedulePatternLookup.getAll().firstWhere(\ f -> f.Code == "CancellationPhone")
  }

  @Deprecated("Deprecated in PolicyCenter 8.0.1. Instead, use gw.plugin.job.IAuditSchedulePatternSelectorPlugin.selectFinalAuditSchedulePatternForExpiredPolicy.")
  override function selectFinalAuditExpirationSchedulePattern(period : PolicyPeriod ) : AuditSchedulePattern {
    return selectFinalAuditSchedulePatternForExpiredPolicy(period)
  }

  override function selectFinalAuditSchedulePatternForExpiredPolicy(period : PolicyPeriod) : AuditSchedulePattern {
    return AuditSchedulePatternLookup.getAll().firstWhere(\ f -> f.Code == "ExpirationPhysical")
  }
}
