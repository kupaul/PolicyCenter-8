package gw.lob.bop
uses gw.lob.common.AbstractRateFactorMatcher
uses gw.entity.ILinkPropertyInfo
uses java.lang.Iterable

/**
 * Matches {@link BOPRateFactor} based on the BOPModifier as well as the properties defined in
 * {@link AbstractRateFactorMatcher}
 */
@Export
class BOPRateFactorMatcher extends AbstractRateFactorMatcher<BOPRateFactor> {
  construct(owner : BOPRateFactor) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {BOPRateFactor.Type.TypeInfo.getProperty("BOPModifier") as ILinkPropertyInfo};
  }
}
