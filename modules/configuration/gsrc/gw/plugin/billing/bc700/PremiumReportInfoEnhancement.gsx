package gw.plugin.billing.bc700
uses java.math.BigDecimal
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.PremiumReportInfo

@Export
enhancement PremiumReportInfoEnhancement : PremiumReportInfo
{
  function sync(period : PolicyPeriod){
    this.syncBasicPolicyInfo(period)
    var auditInfo = period.Audit.AuditInformation
    this.AuditPeriodEndDate = auditInfo.AuditPeriodEndDate.XmlDateTime
    this.AuditPeriodStartDate = auditInfo.AuditPeriodStartDate.XmlDateTime
    var paymentReceived = period.Audit.PaymentReceived
    this.PaymentReceived = paymentReceived != null 
      and paymentReceived.Amount.compareTo( BigDecimal.ZERO ) > 0
  }
}
