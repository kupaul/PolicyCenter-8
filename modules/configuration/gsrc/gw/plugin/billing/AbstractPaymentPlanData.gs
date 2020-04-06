package gw.plugin.billing

uses gw.pl.persistence.core.Bundle

@Export
abstract class AbstractPaymentPlanData implements PaymentPlanData {
  var _billingId: String as BillingId
  var _notes: String as Notes
  var _allowedPaymentMethods: AccountPaymentMethod[] as AllowedPaymentMethods = {}

  property get AllowResponsive(): boolean {
    return _allowedPaymentMethods.contains(AccountPaymentMethod.TC_RESPONSIVE)
  }

  /**
   * Converts this PaymentPlanData object to a PaymentPlanSummary entity.
   */
  override function createPaymentPlanSummary(bundle: Bundle): PaymentPlanSummary {
    var paymentPlanSummary = new PaymentPlanSummary(bundle)

    paymentPlanSummary.BillingId = _billingId
    paymentPlanSummary.Notes = _notes
    paymentPlanSummary.addAllowedPaymentMethods(_allowedPaymentMethods as List<AccountPaymentMethod>)

    doCreatePaymentPlanSummary(paymentPlanSummary)
    return paymentPlanSummary
  }

  override function populateFromPaymentPlanSummary(summary : PaymentPlanSummary) {
    _billingId = summary.BillingId
    _notes = summary.Notes
    _allowedPaymentMethods = summary.AllowedPaymentMethods.toTypedArray()
    doPopulateFromPaymentPlanSummary(summary)
  }

  protected abstract function doCreatePaymentPlanSummary(paymentPlanSummary: PaymentPlanSummary)

  protected abstract function doPopulateFromPaymentPlanSummary(paymentPlanSummary: PaymentPlanSummary)
}