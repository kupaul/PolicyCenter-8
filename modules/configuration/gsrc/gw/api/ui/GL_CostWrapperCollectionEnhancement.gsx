package gw.api.ui
uses java.util.Collection

enhancement GL_CostWrapperCollectionEnhancement : Collection<GL_CostWrapper>
{
  function addCosts(costs : Collection<GLCost>){
    this.addAll( costs.map( \ c -> new GL_CostWrapper(c)).toCollection() )
  }
}
