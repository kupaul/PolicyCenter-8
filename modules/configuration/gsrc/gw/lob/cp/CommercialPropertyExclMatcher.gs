package gw.lob.cp

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractExclusionMatcher

/**
 * Matches {@link CommercialPropertyExcl}s based on the FK to Commercial Property Line as well as the
 * properties defined by {@link AbstractExclusionMatcher}.
 */
@Export
class CommercialPropertyExclMatcher extends AbstractExclusionMatcher<CommercialPropertyExcl> {

  construct(owner : CommercialPropertyExcl) {
    super(owner)
  }
  
  override property get Parent() : ILinkPropertyInfo {
    return CommercialPropertyExcl.Type.TypeInfo.getProperty("CPLine") as ILinkPropertyInfo
  }
  
}
