package gw.reinsurance.enhancements

uses gw.pl.currency.MonetaryAmount
uses gw.api.reinsurance.RICededPremiumAmount

enhancement ListRICededPremiumAmountEnhancement : List<RICededPremiumAmount> {

   private function filteredSum(currency : Currency, predicate : block(r : RICededPremiumAmount) : boolean) : MonetaryAmount {
     return this.where(\ r -> predicate(r)).sum(currency, \ r -> r.CededPremium + r.CededPremiumMarkup)
   }

  /**
   * Amount of this premium ceded to Proportional agreements
   */
  function CedingsToProportional(currency : Currency) : MonetaryAmount {
    return filteredSum(currency, \ r -> r.Agreement typeis ProportionalRIAgreement)
  }

  /**
   * Amount of this premium ceded to XOL (Fac and/or Treaty) agreements.
   */
  function CedingsToXOL(currency : Currency) : MonetaryAmount {
    return filteredSum(currency, \ r -> r.Agreement typeis ExcessOfLossRITreaty or r.Agreement typeis FacExcessOfLossRIAgreement)
  }

  /**
   * Amount of this premium ceded to NXOL (Fac and/or Treaty) agreements.
   */
  function CedingsToNXOL(currency : Currency) : MonetaryAmount {
    return filteredSum(currency, \ r -> r.Agreement typeis NetExcessOfLossRITreaty or r.Agreement typeis FacNetExcessOfLossRIAgreement)
  }

  /**
   * Amount of this premium ceded to all Per-risk agreements
   */
  function CedingsToPerRisk(currency : Currency) : MonetaryAmount {
    return filteredSum(currency, \ r -> r.Agreement typeis PerRisk)
  }

  /**
   * Amount of this premium ceded specifically to Per-event agreements
   */
  function CedingsToPerEvent(currency : Currency) : MonetaryAmount {
     return filteredSum(currency, \ r -> r.Agreement typeis PerEventRITreaty)
  }
}