package gw.lob.ba
uses gw.lob.common.AbstractExclusionMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches BAStateExcls for OOS and Preemption based on the BAJurisdiction
 */
@Export
class BAStateExclMatcher extends AbstractExclusionMatcher<BAStateExcl>{

  construct(owner : BAStateExcl) {
    super(owner)
  }
  
  override property get Parent() : ILinkPropertyInfo {
    return BAStateExcl.Type.TypeInfo.getProperty("BAJurisdiction") as ILinkPropertyInfo
  }

}
