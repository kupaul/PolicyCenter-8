package gw.plugin.reinsurance

uses gw.pl.currency.MonetaryAmount
uses gw.api.reinsurance.CedingRecipient
uses gw.api.reinsurance.RICededPremiumAmount
uses gw.api.reinsurance.RICededPremiumContainer
uses gw.api.reinsurance.RIAttachment

uses java.lang.AssertionError
uses java.math.BigDecimal
uses java.util.Date

@Export
class CedingRecipientAdapter implements CedingRecipient {
  protected var _owner : CedingRecipient

  construct(owner : CedingRecipient) {
    _owner = owner
  }

  /**
   * Get the correct Gross Net Premium (GNP) for calculating ceding on the _owner agreement.
   * Intended to be overriden by subclasses.
   */
  function getGNPforCeding(container : RICededPremiumContainer, cedingAmounts : List<RICededPremiumAmount>, sequenceNumber : int) : MonetaryAmount {
    return getPremiumNetOfAllPrior(container, cedingAmounts, sequenceNumber)
  }

  /**
   * Get the correct ceding rate for calculating ceding on the _owner agreement.
   * The default implementation cedes nothing.    This should be overridden for
   * agreements which use a different value.
   */
  function getCedingRate(attachment : RIAttachment) : BigDecimal {
    return attachment == null ? 0 : 0  // prevent warning about unused parameter
  }

  /**
   * This function contains the formula to calculate the ceding amount.
   * For most proportional agreement types this is GNP * CedingRate
   */
  function calculateCeding(transaction : RICededPremiumAmount) : MonetaryAmount {
    return (transaction.BasisGNP * transaction.CedingRate / 100.0).rescale()
  }

  /**
   * This function contains the formula to calculate the ceding amount.
   * For most proportional agreement types this is CededPremium * CommissionRate
   */
  function calculateCommission(transaction : RICededPremiumAmount) : MonetaryAmount {
    return (transaction.CededPremium * getCommissionRate(transaction.Agreement) / 100.0).rescale()
  }

  /**
   * This function contains the formula to calculate the ceding markup.
   * Fac agreements will have markup
   */
  function calculateCedingMarkup(transaction : RICededPremiumAmount) : MonetaryAmount {
    return 0bd.ofCurrency(transaction.Currency)
  }

  /**
   * Get the correct rate for calculating commission on ceding to the _owner agreement.
   * Intended to be overriden by subclasses.
   */
  function getCommissionRate(agreement : RIAgreement) : BigDecimal {
    return (agreement).Commission
  }

  /**
   * Get the correct "written" date for this ceding calculation.
   * Could be overriden by subclasses.
   */
  function getWrittenDateForCeding(premium : RICededPremiumContainer) : Date {
    if (premium.DateWritten == null) throw "DateWritten should not be null"
    return premium.DateWritten
  }

  /**
   * Get the correct "posted" date for this ceding calculation.
   * Could be overriden by subclasses.
   */
  function getPostedDateForCeding(premium : RICededPremiumContainer) : Date {
    if (premium == null) { /* silence warning about unused parameter */ }
    return Date.Today
  }

  /**
   * Calculate the correct ceding and commission to this CedingRecipient, and create a RICededPremiumTransaction
   * that represents these amounts.   Most informaqtion on the Transaction will be set, but the caller is
   * responsible for specifying history information.
   *
   * @param premium an RICededPremium entity which provides access to the RIRisk and financial Transaction.
   * @return a pointer to the newly-created RICededPremiumTransaction
   */
  override function createCeding(premium : RICededPremiumContainer,
                              attachment : RIAttachment,
                          sequenceNumber : int,
                            priorCedings : List<RICededPremiumAmount>) : RICededPremiumAmount {

    // This isn't java...assert keyword not available.  (Is there a substitute?)
    if ((_owner as RIAgreement) != attachment.Agreement) {
      throw new AssertionError("Attachment should match the recipient of ceding")
    }

    var transaction = new RICededPremiumAmount(premium, attachment, sequenceNumber)

    transaction.DatePosted   = getPostedDateForCeding(premium)
    transaction.DateWritten  = getWrittenDateForCeding(premium)
    transaction.BasisGNP     = getGNPforCeding(premium, priorCedings, sequenceNumber)

    // Don't let GNP go negative (for a positive cost) or vice-versa
    var currency = transaction.Currency
    var zeroCurrencyUnit = 0bd.ofCurrency(currency)
    if (transaction.BasisGNP.signum() != premium.Cost.ActualAmount.signum()) {
      transaction.BasisGNP = zeroCurrencyUnit
    }
    if (attachment.InclusionType == TC_EXCLUDED) {
      transaction.CedingRate = 0
      transaction.CededPremium = zeroCurrencyUnit
      transaction.CededPremiumMarkup = zeroCurrencyUnit
      transaction.Commission = zeroCurrencyUnit
    } else {
      transaction.CedingRate   = getCedingRate(attachment)
      transaction.CededPremium = calculateCeding(transaction)
      transaction.CededPremiumMarkup = calculateCedingMarkup(transaction)
      transaction.Commission   = calculateCommission(transaction)
    }

    return transaction
  }

  // handy GNP calculations

  /**
   * Premium remaining after amounts ceded for Fac XOL and XOL treaties are subtracted.
   * This is typically the amount used to cede to proportional agreements.
   */
  final function getPremiumNetOfXOL(container : RICededPremiumContainer, priorCedings : List<RICededPremiumAmount>) : MonetaryAmount {
    return priorCedings.Empty ? container.SliceAmount : container.SliceAmount - priorCedings.CedingsToXOL(container.Currency)
  }

  /**
   * Premium remaining after amounts ceded for Proportional <em>and XOL (Fac,Treaty)</em> are subtracted.
   */
  final function getPremiumNetOfProportional(container : RICededPremiumContainer, priorCedings : List<RICededPremiumAmount>) : MonetaryAmount {
    // Proportional agreements always cede after XOL?
    return getPremiumNetOfXOL(container, priorCedings) - priorCedings.CedingsToProportional(container.Currency)
  }

  /**
   * Premium remaining after all amounts ceded for per-risk reinsurance are subtracted.
   */
  final function getPremiumNetOfAllPerRisk(container : RICededPremiumContainer, priorCedings : List<RICededPremiumAmount>) : MonetaryAmount {
    return priorCedings.Empty ? container.SliceAmount : container.SliceAmount - priorCedings.CedingsToPerRisk(container.Currency)
  }

  /**
   * Premium remaining after all amounts ceded for per-event <em>and per-risk</em> reinsurance are subtracted.
   */
  final function getPremiumNetOfAllPerEvent(container : RICededPremiumContainer, priorCedings : List<RICededPremiumAmount>) : MonetaryAmount {
    return getPremiumNetOfAllPerRisk(container, priorCedings) - priorCedings.CedingsToPerEvent(container.Currency)
  }

  /**
   * Premium remaining after all cedings prior to <sequenceNumber> have been subtracted.
   */
  final function getPremiumNetOfAllPrior(container : RICededPremiumContainer,  priorCedings : List<RICededPremiumAmount>, sequenceNumber : int) : MonetaryAmount {
    var allPrior = priorCedings.where(\ r -> r.CalculationOrder < sequenceNumber).sum(container.SliceAmount.Currency, \ r -> r.CededPremium.add(r.CededPremiumMarkup))

    return container.SliceAmount - allPrior
  }

  /**
   * Return a scaled, non-null <code>MonetaryAmount</code> value.
   */
  static protected function scaleValue(value : MonetaryAmount, currency : Currency) : MonetaryAmount {
    return value == null
      ? 0bd.ofCurrency(currency)
      : value.rescale()
  }
}