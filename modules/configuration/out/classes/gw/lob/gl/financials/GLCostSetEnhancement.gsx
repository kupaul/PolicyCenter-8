package gw.lob.gl.financials
uses java.util.Set
uses java.util.Map
uses java.util.Collections
uses java.util.ArrayList
uses gw.api.ui.AuditCostWrapper
uses gw.api.ui.GL_CostWrapper
uses gw.api.util.MonetaryAmounts

enhancement GLCostSetEnhancement<T extends GLCost> : Set<T> {
  
  /**
   * Returns an AutoMap of GL exposures' locations to their costs.  If the costs refer to different versions of
   * the same location, then the latest persisted one is used as the key.  Any costs that are not associated to
   * a GL exposure location have a key value of null.  Lastly the AutoMap returns an empty set of costs for
   * any key that is not in the map.
   */
   function byFixedLocation() : Map<PolicyLocation, Set<T>> {
    var locModelByFixedId = this.map(\ cost -> cost.Location)
                               .partition(\ loc -> loc.FixedId)
                               .mapValues(\ locs -> locs.maxBy(\ loc -> loc.ID))
    var ret = this.partition(\ cost -> locModelByFixedId.get(cost.Location.FixedId)).mapValues(\v -> v.toSet())
    return ret.toAutoMap(\ l -> Collections.emptySet<T>())
  }

  function getOtherPremiumAndSurcharges(currency : Currency) : GL_CostWrapper[] {
    var ordered = new ArrayList<GL_CostWrapper>()
    ordered.addCosts(this.where(\ t -> not (t typeis GLCovExposureCost)))
    var state = this.first().State
    var header1 = displaykey.Web.SubmissionWizard.Quote.GL.Subtotal.TotalPremium(state)
    var totalPremium = this.where(\ t -> t.DisplayOrder < 200).AmountSum(currency)
    ordered.add(new GL_CostWrapper(199.5, header1, totalPremium, true))
    var header2 = displaykey.Web.SubmissionWizard.Quote.GL.Subtotal.TotalCost(state)
    ordered.add(new GL_CostWrapper(10000000, header2, this.AmountSum(currency), true))
    return ordered.toTypedArray()
  }

  function getOtherPremiumAndSurchargesForAudit(currency : Currency) : AuditCostWrapper[] {
    var ordered = new ArrayList<AuditCostWrapper>()
    for (cost in this.where(\ t -> not (t typeis GLCovExposureCost))) {
      ordered.add(new AuditCostWrapper(cost))
    }
    ordered.add(getAuditCostWrapperForTotalPremium(currency))
    ordered.add(getAuditCostWrapperForTotalCost(currency))
    return ordered.toTypedArray()
  }
  
  private function getAuditCostWrapperForTotalPremium(currency : Currency) : AuditCostWrapper {
    var description = displaykey.Web.SubmissionWizard.Quote.GL.Subtotal.TotalPremium(this.first().State)
    var estimatedTotal = this.sum(currency, \ t -> (t.DisplayOrder < 200 ? t.BasedOn.ActualAmountBilling : MonetaryAmounts.zeroOf(currency)))
    var auditedTotal = this.sum(currency, \ t -> (t.DisplayOrder < 200 ? t.ActualAmountBilling : MonetaryAmounts.zeroOf(currency)))
    return new AuditCostWrapper(199.5, description, estimatedTotal, auditedTotal, true)
  }
  
  private function getAuditCostWrapperForTotalCost(currency : Currency) : AuditCostWrapper  {
    var description = displaykey.Web.SubmissionWizard.Quote.GL.Subtotal.TotalCost(this.first().State)
    var estimatedTotal = this.sum(currency, \ c -> c.BasedOn.ActualAmountBilling)
    var auditedTotal = this.sum(currency, \c -> c.ActualAmountBilling)
    return new AuditCostWrapper(10000000, description, estimatedTotal, auditedTotal, true)
  }
}
