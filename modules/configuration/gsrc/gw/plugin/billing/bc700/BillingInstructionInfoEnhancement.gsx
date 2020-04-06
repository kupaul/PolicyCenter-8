package gw.plugin.billing.bc700
uses java.math.BigDecimal
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.BillingInstructionInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.anonymous.elements.BillingInstructionInfo_ChargeInfos

@Export
enhancement BillingInstructionInfoEnhancement : BillingInstructionInfo
{
  function syncBasicPolicyInfo(period : PolicyPeriod){
    startSyncBasicPolicyInfo(period)
    ChargeInfoUtil.getChargeInfos( period ).each(\ c -> {
      var element = new BillingInstructionInfo_ChargeInfos()
      element.$TypeInstance = c
      this.ChargeInfos.add(element)
    })
  }
  
  private function startSyncBasicPolicyInfo(period : PolicyPeriod){
    this.TermNumber = period.TermNumber
    this.PolicyNumber = period.PolicyNumber
    this.EffectiveDate = period.EditEffectiveDate.XmlDateTime
    this.Description = period.Job.Description
    this.DepositRequirement = calculateDeposit(period)
    this.HasScheduledFinalAudit = period.hasScheduledFinalAudit() or period.hasOpenFinalAudit()
    this.WrittenDate = period.AllTransactions.first().WrittenDate.XmlDateTime 
    this.TermConfirmed = period.PolicyTerm.Bound
  }
  
  private function calculateDeposit(period : PolicyPeriod) : BigDecimal{
    var job = period.Job
    if(job typeis Audit and job.AuditInformation.AuditScheduleType == TC_PREMIUMREPORT){
      return null
    }
    return period.PolicyTerm.DepositReleased ? BigDecimal.ZERO : period.PolicyTerm.DepositAmount.Amount
  }
}
