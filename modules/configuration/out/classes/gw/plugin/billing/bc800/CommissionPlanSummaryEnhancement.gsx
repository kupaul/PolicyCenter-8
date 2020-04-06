package gw.plugin.billing.bc800

uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.CommissionPlanInfo

enhancement CommissionPlanSummaryEnhancement : gw.plugin.billing.CommissionPlanSummary {
  function sync(plan : CommissionPlanInfo) {
    this.syncCurrency(plan)
    this.AllowedTiers = new Tier[plan.AllowedTiers.Count]
    for (tier in plan.AllowedTiers index i) {
      this.AllowedTiers[i] = tier
    }
  }
}
