package gw.lob.gl

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractConditionMatcher

/**
 * Matches {@link GeneralLiabilityCond}s based on the FK to the General Liability Line as well as the
 * properties defined in {@link AbstractConditionMatcher}.
 */
@Export
class GeneralLiabilityCondMatcher extends AbstractConditionMatcher<GeneralLiabilityCond>{

  construct(owner : GeneralLiabilityCond) {
    super(owner)
  }

  override property get Parent() : ILinkPropertyInfo {
    return GeneralLiabilityCond.Type.TypeInfo.getProperty("GLLine") as ILinkPropertyInfo
  }
  
}
