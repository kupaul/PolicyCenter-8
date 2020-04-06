package gw.lob.wc
uses gw.lob.common.AbstractRateFactorMatcher
uses gw.entity.ILinkPropertyInfo
uses java.lang.Iterable

/**
 * Matches {@link WCRateFactor}s based on the FK to the {@link WCModifier} as well as the
 * properties defined in {@link AbstractRateFactorMatcher}.
 */
@Export
class WCRateFactorMatcher extends AbstractRateFactorMatcher<WCRateFactor> {
  construct(owner : WCRateFactor) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {WCRateFactor.Type.TypeInfo.getProperty("WCModifier") as ILinkPropertyInfo};
  }
}
