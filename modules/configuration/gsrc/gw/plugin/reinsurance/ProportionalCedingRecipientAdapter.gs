package gw.plugin.reinsurance

uses gw.pl.currency.MonetaryAmount
uses gw.api.reinsurance.CedingRecipient
uses gw.api.reinsurance.RICededPremiumAmount
uses gw.api.reinsurance.RICededPremiumContainer
uses gw.api.reinsurance.RIAttachment

uses java.math.BigDecimal

@Export
class ProportionalCedingRecipientAdapter extends CedingRecipientAdapter {

  construct(owner : CedingRecipient) {
    super(owner)
  }

  /**
   * Get the correct Gross Net Premium (GNP) for calculating ceding on the _owner agreement.
   *
   * Proportional agreements always cede after XOL
   */
  override function getGNPforCeding(premium : RICededPremiumContainer, cedingAmounts : List<RICededPremiumAmount>, sequenceNumber : int) : MonetaryAmount {
    return getPremiumNetOfXOL(premium, cedingAmounts)
  }

  /**
   * Get the correct ceding rate for calculating ceding on the _owner agreement.
   * This implementation uses the proportional percentage from the attachment,
   * which should be properly set up for proportional agreements.
   */
  override function getCedingRate(attachment : RIAttachment) : BigDecimal {
    var pct = attachment.ProportionalPercentage
    // in certain cases, the ProportionalPercentage can be null.  Return zero instead.
    return (pct == null) ? 0bd : pct
  }
}
