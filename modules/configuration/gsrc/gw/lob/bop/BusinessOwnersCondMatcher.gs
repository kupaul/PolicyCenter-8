package gw.lob.bop

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractConditionMatcher

/**
 * Matches {@link BusinessOwnersCond} based on the FK to Business Owners Line as well as the properties
 * defined in {@link AbstractConditionMatcher}
 */
@Export
class BusinessOwnersCondMatcher extends AbstractConditionMatcher<BusinessOwnersCond>{

  construct(owner : BusinessOwnersCond) {
    super(owner)
  }
  
  override property get Parent() : ILinkPropertyInfo {
    return BusinessOwnersCond.Type.TypeInfo.getProperty("BOPLine") as ILinkPropertyInfo
  }
  
}
