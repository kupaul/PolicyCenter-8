package gw.plugin.reinsurance

uses gw.pl.currency.MonetaryAmount
uses gw.api.reinsurance.CedingRecipient
uses gw.api.reinsurance.RICededPremiumAmount

@Export
class FacPropCedingRecipientAdapter extends ProportionalCedingRecipientAdapter {
  construct(owner : CedingRecipient) {
    super(owner)
  }

  /**
   * If this has a flat cost, the prorated amount is already stored in the RICededPremiumContainer.
   * Otherwise, we treat this like a proportional agreement.
   */
  override function calculateCeding(transaction : RICededPremiumAmount) : MonetaryAmount {
    var facAmt = transaction.RICededPremiumContainer.getAmountForFac(this._owner as Facultative)
    if (facAmt == null) {
      return super.calculateCeding(transaction)
    }
    return facAmt.CededAmount.rescale()
  }

  /**
   * If this has a flat cost, the prorated amount is already stored in the RICededPremiumContainer.
   * Otherwise, we treat this like a proportional agreement.
   */
  override function calculateCedingMarkup(transaction : RICededPremiumAmount) : MonetaryAmount {
    var facAmt = transaction.RICededPremiumContainer.getAmountForFac(this._owner as Facultative)
    if (facAmt == null) {
      return super.calculateCedingMarkup(transaction)
    }
    return facAmt.MarkupAmount.rescale()
  }

  /**
   * If this has a flat cost, the prorated amount is already stored in the RICededPremiumContainer.
   * Otherwise, we treat this like a proportional agreement.
   */
  override function calculateCommission(transaction : RICededPremiumAmount) : MonetaryAmount {
    var facAmt =  transaction.RICededPremiumContainer.getAmountForFac(this._owner as Facultative)
    if (facAmt == null) {
      return super.calculateCommission(transaction)
    }
    return facAmt.CommissionAmount.rescale()
  }
}
