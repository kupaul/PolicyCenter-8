package gw.reinsurance.ceding

enhancement RICededPremiumContainerEnhancement : gw.api.reinsurance.RICededPremiumContainer {
  property get Currency() : Currency {
    return this.Cost.SettlementCurrency
  }
}
