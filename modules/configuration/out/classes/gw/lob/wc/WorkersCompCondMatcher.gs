package gw.lob.wc

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractConditionMatcher

/**
 * Matches {@link WorkersCompCond}s based on the FK to the {@link WCLine} as well as the
 * properties defined in {@link AbstractConditionMatcher}.
 */
@Export
class WorkersCompCondMatcher extends AbstractConditionMatcher<WorkersCompCond>{

  construct(owner : WorkersCompCond) {
    super(owner)
  }
  override property get Parent() : ILinkPropertyInfo {
    return WorkersCompCond.Type.TypeInfo.getProperty("WCLine") as ILinkPropertyInfo
  }

}
