package gw.plugin.policy.impl

uses gw.plugin.billing.PaymentPlanData
uses gw.plugin.billing.ReportingPlanData
uses gw.plugin.policy.IPolicyPaymentPlugin

@Export
class PolicyPaymentPlugin implements IPolicyPaymentPlugin {
  override function filterReportingPlans(period: PolicyPeriod, plans: PaymentPlanData[]): PaymentPlanData[] {
    // Customer may want to filter this according to things like policy size, type of business...

    // By default, we filter out reporting plans if the policy does not contain an "auditable" line
    // Customers may want to extend this to filter reporting plans by additional characteristics.
    var plansToReturn : List<PaymentPlanData> = {}
    for (plan in plans) {
      if (period.AllowsPremiumAudit or !(plan typeis ReportingPlanData )) {
        plansToReturn.add(plan)
      }
    }

    return plansToReturn as PaymentPlanData[]
  }
}