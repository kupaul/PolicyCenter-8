package gw.lob.bop

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractExclusionMatcher

/**
 * Matches {@link BusinessOwnersExcl} based on the Business Owners Line as well as the properties
 * defined in {@link AbstractExclusionMatcher}
 */
@Export
class BusinessOwnersExclMatcher extends AbstractExclusionMatcher<BusinessOwnersExcl>{

  construct(owner : BusinessOwnersExcl) {
    super(owner)
  }
 
  override property get Parent() : ILinkPropertyInfo {
    return BusinessOwnersExcl.Type.TypeInfo.getProperty("BOPLine") as ILinkPropertyInfo
  }

}
