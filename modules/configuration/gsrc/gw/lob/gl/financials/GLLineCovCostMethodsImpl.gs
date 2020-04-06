package gw.lob.gl.financials

@Export
class GLLineCovCostMethodsImpl extends GenericGLCostMethodsImpl<GLLineCovCost>
{
  construct( owner : GLLineCovCost)
  {
    super( owner )
  }

  override property get OwningCoverable() : Coverable
  {
    return Cost.GeneralLiabilityLine
  }

  override property get Coverage() : Coverage
  {
    return Cost.GeneralLiabilityCov
  }

  override property get State() : Jurisdiction
  {
    return Cost.GeneralLiabilityLine.BaseState
  }

}
