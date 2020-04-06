package gw.lob.ba

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractConditionMatcher

/**
 * Concrete implementation of {@link AbstractConditionMatcher} to match {@link BusinessAutoCond}s.
 * BusinessAutoConds are matched on the CommercialAuto Line (BALine due to old naming convention), as well
 * as the columns specified in AbstractConditionMatcher.
 */
@Export
class BusinessAutoCondMatcher extends AbstractConditionMatcher<BusinessAutoCond>{

  construct(owner : BusinessAutoCond) {
    super(owner)
  }
  override property get Parent() : ILinkPropertyInfo {
    return BusinessAutoCond.Type.TypeInfo.getProperty("BALine") as ILinkPropertyInfo
  }
  
}
