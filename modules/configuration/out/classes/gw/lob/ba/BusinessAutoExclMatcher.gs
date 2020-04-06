package gw.lob.ba

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractExclusionMatcher

/**
 * Matches {@BusinessAutoExcl} based on the BALine, as well as the properties defined in
 * {@link AbstractExclusionMatcher}.
 */
@Export
class BusinessAutoExclMatcher extends AbstractExclusionMatcher<BusinessAutoExcl>{

  construct(owner : BusinessAutoExcl) {
    super(owner)
  }
  override property get Parent() : ILinkPropertyInfo {
    return BusinessAutoExcl.Type.TypeInfo.getProperty("BALine") as ILinkPropertyInfo
  }

}
