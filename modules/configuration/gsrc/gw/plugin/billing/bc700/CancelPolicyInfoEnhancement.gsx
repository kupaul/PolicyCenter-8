package gw.plugin.billing.bc700
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.CancelPolicyInfo

@Export
enhancement CancelPolicyInfoEnhancement : CancelPolicyInfo
{
  function sync(period : PolicyPeriod){
    this.syncBasicPolicyInfo(period)
    this.CancellationType = period.RefundCalcMethod.Code
    this.CancellationReason = period.Cancellation.CancelReasonCode.Description
    this.WrittenDate = period.WrittenDate.XmlDateTime
  }
}
