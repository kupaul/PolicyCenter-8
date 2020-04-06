package gw.lob.ba
uses gw.lob.common.AbstractConditionMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches BAStateConds for OOS and Preemption jobs based on the BAJurisdiction
 */
@Export
class BAStateCondMatcher  extends AbstractConditionMatcher<BAStateCond>{

  construct(owner : BAStateCond) {
    super(owner)
  }
  
  override property get Parent() : ILinkPropertyInfo {
    return BAStateCond.Type.TypeInfo.getProperty("BAJurisdiction") as ILinkPropertyInfo
  }

}
