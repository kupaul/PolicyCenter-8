package gw.financials

uses java.math.BigDecimal
uses java.util.Date
uses gw.pl.currency.MonetaryAmount

/**
 * Provides earned premium information on transactions.
 */
enhancement TransactionEPEnhancement: entity.Transaction {
  /**
   * Returns the amount earned from the transaction as of today.
   * @param lastReportedDate the last reported date
   * @param includeEBUR whether or not to include earned but unreported amount
   * @return amount earned as of today
   */
  function earned(lastReportedDate: Date, includeEBUR: boolean): BigDecimal {
    return earnedAsOf(Date.Today, lastReportedDate, includeEBUR)
  }

  /**
   * Returns the amount earned from the transaction as of a specific date.
   *
   * @param asof the "as of" date for determining the earned amount
   * @param lastReportedDate the last reported date
   * @param includeEBUR whether or not to include earned but unreported amount
   * @return amount earned as of the specified date
   */
  function earnedAsOf(asof: Date, lastReportedDate: Date, includeEBUR: boolean): MonetaryAmount {
    var p = Prorater.forRounding(3, HALF_UP, TC_PRORATABYDAYS)
    var earnedAmount: MonetaryAmount
    var currency = this.SettlementCurrency
    var maxAsOf = asof
    if (asof > this.ExpDate) {
      maxAsOf = this.ExpDate
    }

    var reportDate = lastReportedDate
    if (lastReportedDate == null) {
      reportDate = ((this as EffDated).BranchUntyped as PolicyPeriod).PeriodStart
    }

    // do not include if not posted or posted after asof
    if ((this.PostedDate == null or asof.compareIgnoreTime(this.PostedDate) < 0)
        // do not include if written date is null or written after asof
        or (this.WrittenDate == null or asof.compareIgnoreTime(this.WrittenDate) < 0)
        // do not include if not a premium - that is, it is a tax or something
        or (this.Cost.RateAmountType != typekey.RateAmountType.TC_NONSTDPREMIUM
            and this.Cost.RateAmountType != typekey.RateAmountType.TC_STDPREMIUM)) {
      earnedAmount = 0bd.ofCurrency(currency)

      // handle tobeAccrued
    } else if (this.ToBeAccrued) {
      // past the expdate, then include 100%
      if (asof.compareIgnoreTime(this.ExpDate) >= 0) {
        earnedAmount = this.AmountBilling

        // if on or before the effdate, then do not include
      } else if (asof.compareIgnoreTime(this.EffDate) <= 0) {
        earnedAmount = 0bd.ofCurrency(currency)

      } else {
        // asof must be between the eff and exp date, so prorate
        // factor = days from eff to as of / days from eff to exp
        earnedAmount = p.prorate(this.EffDate, this.ExpDate, this.EffDate, maxAsOf, this.AmountBilling).rescale()
      }

      // this leaves amounts not to be accrued.  This includes 2 types:
      //    amounts fully earned on day one - include 100%
    } else if (not ((this as EffDated).BranchUntyped as PolicyPeriod).IsReportingPolicy
        and not this.Cost.SubjectToReporting) {
      earnedAmount = this.AmountBilling

      //    amounts that are subject to reporting - do not include unless including EBUR
    } else if (((this as EffDated).BranchUntyped as PolicyPeriod).IsReportingPolicy
        and this.Cost.SubjectToReporting
        and includeEBUR
        and (maxAsOf >= reportDate)) {
      earnedAmount = p.prorate(this.EffDate, this.ExpDate, reportDate, maxAsOf, this.AmountBilling).rescale()
    } else {
      earnedAmount = 0bd.ofCurrency(currency)
    }
    return earnedAmount
  }
}
