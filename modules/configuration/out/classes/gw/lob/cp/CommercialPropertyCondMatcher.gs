package gw.lob.cp

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractConditionMatcher

/**
 * Matches {@link CommercialPropertyCond}s based on the FK to Commercial Property Line as well as the
 * properties defined in {@link AbstractConditionMatcher}
 */
@Export
class CommercialPropertyCondMatcher extends AbstractConditionMatcher<CommercialPropertyCond>{

  construct(owner : CommercialPropertyCond) {
    super(owner)
  }

  override property get Parent() : ILinkPropertyInfo {
    return CommercialPropertyCond.Type.TypeInfo.getProperty("CPLine") as ILinkPropertyInfo
  }
  
}
