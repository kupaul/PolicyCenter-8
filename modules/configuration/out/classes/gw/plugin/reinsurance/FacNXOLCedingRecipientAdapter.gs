package gw.plugin.reinsurance

uses gw.pl.currency.MonetaryAmount
uses gw.api.reinsurance.CedingRecipient
uses gw.api.reinsurance.RICededPremiumAmount
uses gw.api.reinsurance.RIAttachment

uses java.math.BigDecimal

@Export
class FacNXOLCedingRecipientAdapter extends CedingRecipientAdapter {

  construct(owner : CedingRecipient) {
    super(owner)
  }

  /**
   * The ceding rate is not used for flat cost agreements.
   */
  override function getCedingRate(attachment : RIAttachment) : BigDecimal {
    return 0
  }

  /**
   * The prorated amount is already stored in the RICededPremiumContainer.
   */
  override function calculateCeding(transaction : RICededPremiumAmount) : MonetaryAmount {
    var value = transaction.RICededPremiumContainer.getAmountForFac(this._owner as Facultative).CededAmount
    return scaleValue(value, transaction.Currency)
  }

  /**
   * The prorated amount is already stored in the RICededPremiumContainer.
   */
  override function calculateCedingMarkup(transaction : RICededPremiumAmount) : MonetaryAmount {
    var value = transaction.RICededPremiumContainer.getAmountForFac(this._owner as Facultative).MarkupAmount
    return scaleValue(value, transaction.Currency)
  }

  /**
   * The prorated amount is already stored in the RICededPremiumContainer.
   */
  override function calculateCommission(transaction : RICededPremiumAmount) : MonetaryAmount {
    var value = transaction.RICededPremiumContainer.getAmountForFac(this._owner as Facultative).CommissionAmount
    return scaleValue(value, transaction.Currency)
  }
}