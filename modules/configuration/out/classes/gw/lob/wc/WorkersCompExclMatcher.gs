package gw.lob.wc

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractExclusionMatcher

/**
 * Matches {@link WorkersCompExcl}s based on the FK to the {@link WCLine} as well as the
 * properties defined in {@link AbstractExclusionMatcher}.
 */
@Export
class WorkersCompExclMatcher extends AbstractExclusionMatcher<WorkersCompExcl>{

  construct(owner : WorkersCompExcl) {
    super(owner)
  }
  
  override property get Parent() : ILinkPropertyInfo {
    return WorkersCompExcl.Type.TypeInfo.getProperty("WCLine") as ILinkPropertyInfo
  }

}
