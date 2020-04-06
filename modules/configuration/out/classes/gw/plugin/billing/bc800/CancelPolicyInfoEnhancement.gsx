package gw.plugin.billing.bc800

uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.CancelPolicyInfo

@Export
enhancement CancelPolicyInfoEnhancement : CancelPolicyInfo {
  function sync(period : PolicyPeriod) {
    this.syncBasicPolicyInfo(period)
    this.CancellationType = period.RefundCalcMethod.Code
    this.CancellationReason = period.Cancellation.CancelReasonCode.Description
  }
}