package gw.lob.bop.rating
uses java.util.Date
uses gw.financials.PolicyPeriodFXRateCache

@Export
class BOPMinPremiumCostData extends BOPCostData<BOPMinPremiumCost> {
  
  construct(effDate : Date, expDate : Date, stateArg : Jurisdiction) {
    super(effDate, expDate, stateArg)
  }

  construct(effDate : Date, expDate : Date, c : Currency, rateCache : PolicyPeriodFXRateCache, stateArg : Jurisdiction) {
    super(effDate, expDate, c, rateCache, stateArg)
  }

  override function getVersionedCosts(line : BOPLine) : List<gw.pl.persistence.core.effdate.EffDatedVersionList> {
    return line.VersionList.BOPCosts.where( \ vl -> vl.AllVersions.first() typeis BOPMinPremiumCost).toList()
  }
  
  protected override property get KeyValues() : List<Object> {
    return {}
  }

  override function setSpecificFieldsOnCost( line: BOPLine, cost: BOPMinPremiumCost ) {
    super.setSpecificFieldsOnCost( line, cost )
  }

}
