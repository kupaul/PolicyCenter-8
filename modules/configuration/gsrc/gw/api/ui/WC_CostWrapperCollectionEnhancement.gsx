package gw.api.ui
uses java.util.Collection

enhancement WC_CostWrapperCollectionEnhancement : Collection<WC_CostWrapper>
{
  function addCosts(costs : Collection<WCCost>){
    this.addAll( costs.map( \ c -> new WC_CostWrapper(c)).toCollection() )
  }
}
