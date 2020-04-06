package gw.lob.wc.rating

enhancement WCRetrospectiveRatingPlanEnhancement : entity.WCRetrospectiveRatingPlan {
  property get Currency() : Currency {
    return this.Branch.PreferredSettlementCurrency
  }
}
