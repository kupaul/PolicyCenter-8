package gw.financials
uses java.lang.IllegalStateException
uses gw.pl.currency.MonetaryAmount
uses gw.currency.fxrate.FXRate
uses gw.api.util.MonetaryAmounts
uses gw.api.util.CurrencyUtil
uses gw.rating.worksheet.domain.Worksheet
uses gw.rating.worksheet.WorksheetUtil
uses gw.rating.worksheet.domain.WorksheetEntry

/**
 * Provides additional properties and functionality to the {@link entity.Cost} entity. It provides information about
 * the cost value, currency, etc.
 */
enhancement CostEnhancement : Cost {

  /**
   * Returns the currency of the coverage amount.
   *
   * @return the Currency object of the coverage
   * @throws IllegalStateException if the coverage amount is not defined
   */
  property get CoverageCurrency() : Currency {
    if (this.ActualAmount == null) {
      throw new IllegalStateException("ActualAmount on a Cost should not be null")
    }
    return this.ActualAmount.Currency
  }

  /**
   * Returns the preferred settlement currency.
   *
   * @return the Currency object of the settlement
   */
  property get SettlementCurrency() : Currency {
    if (this.ActualAmountBilling == null) {
      throw new IllegalStateException("ActualAmountBilling on a Cost should not be null")
    }
    return this.ActualAmountBilling.Currency
  }

  /**
   * Returns whether or not any of the cost properties has been overridden.
   *
   * @return <code>true</code> if any of the cost properties has been overridden; <code>false</code> otherwise.
   */
  property get OverrideSet() : boolean {
    return this.OverrideAdjRate != null
        or this.OverrideBaseRate != null
        or this.OverrideAmount != null
        or this.OverrideTermAmount != null
        or this.OverrideAmountBilling != null
        or this.OverrideTermAmountBilling != null
  }

  /**
   * Return whether or not any of the cost properties has been overridden manually by the user (as opposed to
   * automatically overridden).
   *
   * @return <code>true</code> if the cost has been override; <code>false</code> otherwise.
   */
  property get HasOverride() : boolean {
    // a better name would be nice, but we have to assume customers are using this one,
    // so maintain its semantics: HasOverride means "has MANUAL override."
    return OverrideSet and this.OverrideSource.hasCategory(OverrideSourceCategory.TC_USER)
  }

  /**
   * Clears the reason for the cost being overridden. If the cost is not overridden, it does nothing.
   */
  function possiblyClearOverrideReason() {
    if (!OverrideSet) {
      this.OverrideReason = null
    }
  }

  function storeOverrideAmountsFromBillingOverrideAmounts() {
    this.OverrideAmount = reverseToCoverageAmount(this.OverrideAmountBilling, this.PolicyFXRate)
    this.OverrideTermAmount = reverseToCoverageAmount(this.OverrideTermAmountBilling, this.PolicyFXRate)
  }

  private function reverseToCoverageAmount(billingAmount : MonetaryAmount, rate : FXRate) : MonetaryAmount {
    if (billingAmount == null) {
      return null
    } else if (rate == null) { //coverage and settlement currency match
      return billingAmount
    }

    var reversedAmount = new MonetaryAmount(billingAmount.divide(rate.getRate()).getAmount(), rate.getFromCurrency())
    return MonetaryAmounts.roundToCurrencyScale(reversedAmount, CurrencyUtil.getRoundingMode())
  }

  /**
   * Clears all the overridden cost property values. If the cost is not overriable, it does nothing.
   */
  function resetOverrides() {
    /* We only reset overrides on overridable rows just in case the user is using the override
       for some other purpose in the non-overridable rows */
    if (this.Overridable) {
      this.OverrideAdjRate = null
      this.OverrideAmount = null
      this.OverrideBaseRate = null
      this.OverrideReason = null
      this.OverrideTermAmount = null
      this.OverrideSource = null
      this.OverrideAmountBilling = null
      this.OverrideTermAmountBilling = null
      this.OverrideSource = Cost.Type.EntityProperties.toList()
            .singleWhere(\ i -> i.Name == "OverrideSource").DefaultValue as OverrideSourceType
    }
  }

  /**
   * @return <code>true</code> if the cost is subject to accrual; <code>false</code> otherwise.
   */
  property get SubjectToAccrual() : boolean {
    return this.RateAmountType == "StdPremium" || this.RateAmountType == "NonstdPremium"
  }

  /**
   * @return <code>true</code> if this Cost represents direct premium (receipts that should potentially be ceded);
   * <code>false</code> otherwise.
   */
  property get SubjectToRICeding() : boolean {
    return this.RateAmountType == "StdPremium" || this.RateAmountType == "NonstdPremium"
  }

  property get RatingWorksheet() : Worksheet {
    return (this.BranchUntyped as PolicyPeriod).getWorksheetFor(this)
  }
}
