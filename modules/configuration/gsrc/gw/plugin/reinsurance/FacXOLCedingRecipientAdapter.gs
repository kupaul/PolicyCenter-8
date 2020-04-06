package gw.plugin.reinsurance

uses gw.pl.currency.MonetaryAmount
uses gw.api.reinsurance.CedingRecipient
uses gw.api.reinsurance.RICededPremiumAmount
uses gw.api.reinsurance.RICededPremiumContainer
uses gw.api.reinsurance.RIAttachment
uses gw.api.util.MonetaryAmounts

uses java.math.BigDecimal

@Export
class FacXOLCedingRecipientAdapter extends CedingRecipientAdapter {
  construct(owner : CedingRecipient) {
    super(owner)
  }

  /**
   * Get the correct Gross Net Premium (GNP) for calculating ceding on the _owner agreement.
   * Intended to be overriden by subclasses.
   */
  override function getGNPforCeding(container : RICededPremiumContainer, cedingAmounts : List<RICededPremiumAmount>, sequenceNumber : int) : MonetaryAmount {
    return getPremiumNetOfXOL(container, cedingAmounts) // subtract out other XOL treaties
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
    return value == null
      ? MonetaryAmounts.zeroOf(transaction.Currency)
      : value.rescale()
  }

  /**
   * The prorated amount is already stored in the RICededPremiumContainer.
   */
  override function calculateCedingMarkup(transaction : RICededPremiumAmount) : MonetaryAmount {
    var value = transaction.RICededPremiumContainer.getAmountForFac(this._owner as Facultative).MarkupAmount
    return value == null
      ? MonetaryAmounts.zeroOf(transaction.Currency)
      : value.rescale()
  }

  /**
   * The prorated amount is already stored in the RICededPremiumContainer.
   */
  override function calculateCommission(transaction : RICededPremiumAmount) : MonetaryAmount {
    var value = transaction.RICededPremiumContainer.getAmountForFac(this._owner as Facultative).CommissionAmount
    return value == null
      ? MonetaryAmounts.zeroOf(transaction.Currency)
      : value.rescale()
  }
}
