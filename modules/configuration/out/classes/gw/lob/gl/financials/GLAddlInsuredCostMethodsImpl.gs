package gw.lob.gl.financials

@Export
class GLAddlInsuredCostMethodsImpl extends GenericGLCostMethodsImpl<GLAddlInsuredCost> {

  construct( owner : GLAddlInsuredCost) {
    super( owner )
  }

  override property get State() : Jurisdiction {
    return Cost.GeneralLiabilityLine.BaseState
  }

  override property get DisplayOrder() : int {
    return 102
  }

}
