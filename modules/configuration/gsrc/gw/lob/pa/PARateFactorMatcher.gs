package gw.lob.pa
uses gw.lob.common.AbstractRateFactorMatcher
uses gw.entity.ILinkPropertyInfo
uses java.lang.Iterable

/**
 * Matches {@link PARateFactor}s based on the FK to the {@link PAModifier} as well as the
 * properties defined in {@link AbstractRateFactorMatcher}.
 */
@Export
class PARateFactorMatcher extends AbstractRateFactorMatcher<PARateFactor> {
  construct(owner : PARateFactor) {
    super(owner)
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {PARateFactor.Type.TypeInfo.getProperty("PAModifier") as ILinkPropertyInfo}
  }
}
