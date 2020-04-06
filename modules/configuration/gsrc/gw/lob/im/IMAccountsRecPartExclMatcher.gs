package gw.lob.im
uses gw.lob.common.AbstractExclusionMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link IMAccountsRecPartExcl}s based on the FK to the {@link IMAccountsRecPart} as well as the
 * properties defined in {@link AbstractExclusionMatcher}.
 */
@Export
class IMAccountsRecPartExclMatcher extends AbstractExclusionMatcher<IMAccountsRecPartExcl>{

  construct(owner : IMAccountsRecPartExcl) {
    super(owner)
  }
  
  override property get Parent() : ILinkPropertyInfo {
    return IMAccountsRecPartExcl.Type.TypeInfo.getProperty("IMAccountsRecPart") as ILinkPropertyInfo
  }

}
