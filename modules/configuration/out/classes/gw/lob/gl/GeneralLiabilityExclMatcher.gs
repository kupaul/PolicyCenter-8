package gw.lob.gl

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractExclusionMatcher

/**
 * Matches {@link GeneralLiabilityExcl}s based on the FK to the General Liability Line as well as the
 * properties defined in {@link AbstractExclusionMatcher}.
 */
@Export
class GeneralLiabilityExclMatcher extends AbstractExclusionMatcher<GeneralLiabilityExcl>{

  construct(owner : GeneralLiabilityExcl) {
    super(owner)
  }

  override property get Parent() : ILinkPropertyInfo {
    return GeneralLiabilityExcl.Type.TypeInfo.getProperty("GLLine") as ILinkPropertyInfo
  }
  
}
