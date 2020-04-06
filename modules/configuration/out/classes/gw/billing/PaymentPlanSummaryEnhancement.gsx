package gw.billing

uses gw.api.productmodel.AuditSchedulePattern
uses gw.api.productmodel.AuditSchedulePatternLookup
uses gw.plugin.billing.BillingUtilityMethods

uses java.lang.IllegalStateException
uses java.math.BigDecimal
uses gw.plugin.billing.PaymentPlanData
uses gw.plugin.billing.InstallmentPlanDataImpl
uses gw.plugin.billing.ReportingPlanDataImpl

enhancement PaymentPlanSummaryEnhancement: entity.PaymentPlanSummary {
  /**
   * @return Number of payments required by this payment plan
   */
  property get NumberOfPayments(): int {
    return BillingUtilityMethods.getNumberOfPayments(this.DownPayment, this.Installment, this.Total)
  }

  /**
   * @deprecated Since PolicyCenter 8.0.2. Please use IsReportingPlan instead.
   */
  @Deprecated("PC8.0.2", "Deprecated, please use IsReportingPlan instead.")
  property get IsReporting(): boolean {
    return IsReportingPlan
  }

  property get IsReportingPlan(): boolean {
    return this.PaymentPlanType == PaymentMethod.TC_REPORTINGPLAN
  }

  property get IsNotReportingPlan(): boolean {
    return not IsReportingPlan
  }

  property get IsInstallmentsPlan(): boolean {
    return this.PaymentPlanType == PaymentMethod.TC_INSTALLMENTS
  }

  /**
   * @return true iff one of the allowed payment methods is "Responsive"
   */
  property get AllowResponsive(): boolean {
    return this.AllowedPaymentMethods.contains(AccountPaymentMethod.TC_RESPONSIVE)
  }

  property get ReportingPattern(): AuditSchedulePattern {
    return getAuditSchedulePattern()
  }

  private function getAuditSchedulePattern(): AuditSchedulePattern {
    // only applicable for Reporting plans
    if (!IsReportingPlan) {
      throw new IllegalStateException("Cannot call getAuditSchedulePattern() on a non-Reporting PaymentPlanSummary")
    }
    return AuditSchedulePatternLookup.selectByCode(this.ReportingPatternCode)
  }

  /**
   * Note: callers should use this property instead of PaymentPlanSummary.Name
   * as it will correctly return the name whether the type is "Installments" or "Reporting".
   */
  property get PaymentPlanName(): String {
    if (IsReportingPlan) {
      // This uses productmodel.display.properties so is a localized string.
      return getAuditSchedulePattern().Name
    } else {
      // default case -- true for Installments Plans, at least.
      return this.Name
    }
  }

  property get DefaultDepositPercent(): BigDecimal {
    if (IsReportingPlan) {
      return getAuditSchedulePattern().ReportingDefaultDepositPct
    } else {
      return null
    }
  }

  function asPaymentPlanData() : PaymentPlanData {
    var paymentPlanData = IsInstallmentsPlan ? new InstallmentPlanDataImpl() : new ReportingPlanDataImpl()
    paymentPlanData.populateFromPaymentPlanSummary(this)
    return paymentPlanData
  }
}