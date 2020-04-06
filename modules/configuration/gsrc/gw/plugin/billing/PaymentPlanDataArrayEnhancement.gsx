package gw.plugin.billing

enhancement PaymentPlanDataArrayEnhancement<T extends PaymentPlanData>
    : T[] {
  property get InstallmentPlans(): InstallmentPlanData[] {
    return this.whereTypeIs(InstallmentPlanData)
  }

  property get ReportingPlans(): ReportingPlanData[] {
    return this.whereTypeIs(ReportingPlanData)
  }

  public function getByBillingId(id: String): T {
    return this.firstWhere(\p -> p.BillingId == id)
  }
}
