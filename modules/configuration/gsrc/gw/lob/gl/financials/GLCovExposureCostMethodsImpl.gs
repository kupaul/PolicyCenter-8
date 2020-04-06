package gw.lob.gl.financials
uses gw.api.util.JurisdictionMappingUtil

@Export
class GLCovExposureCostMethodsImpl extends GenericGLCostMethodsImpl<GLCovExposureCost>
{
  construct( owner : GLCovExposureCost )
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
    return JurisdictionMappingUtil.getJurisdiction(Cost.GLExposure.Location)
  }
  
  override property get Location() : PolicyLocation
  {
    return Cost.GLExposure.Location
  }

}
