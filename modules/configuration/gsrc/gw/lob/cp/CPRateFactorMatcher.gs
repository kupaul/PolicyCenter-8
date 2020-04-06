package gw.lob.cp
uses gw.lob.common.AbstractRateFactorMatcher
uses gw.entity.ILinkPropertyInfo
uses java.lang.Iterable

/**
 * Matches {@link CPRateFactor}s based on the CPModifier link as well as the properties defined in
 * {@link AbstractRateFactorMatcher}.
 */
@Export
class CPRateFactorMatcher extends AbstractRateFactorMatcher<CPRateFactor> {
  construct(owner : CPRateFactor) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {CPRateFactor.Type.TypeInfo.getProperty("CPModifier") as ILinkPropertyInfo};
  }
}
