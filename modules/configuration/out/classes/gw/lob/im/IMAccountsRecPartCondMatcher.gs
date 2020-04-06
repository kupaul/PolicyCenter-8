package gw.lob.im
uses gw.lob.common.AbstractConditionMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link IMAccountsRecPartCond}s based on the FK to the {@link IMAccountsRecPart} as well as the
 * properties defined in {@link AbstractConditionMatcher}.
 */
@Export
class IMAccountsRecPartCondMatcher extends AbstractConditionMatcher<IMAccountsRecPartCond>{

  construct(owner : IMAccountsRecPartCond) {
    super(owner)
  }
  
  override property get Parent() : ILinkPropertyInfo {
    return IMAccountsRecPartCond.Type.TypeInfo.getProperty("IMAccountsRecPart") as ILinkPropertyInfo
  }

}
