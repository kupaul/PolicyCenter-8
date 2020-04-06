package gw.lob.gl
uses gw.lob.common.AbstractRateFactorMatcher
uses gw.entity.ILinkPropertyInfo
uses java.lang.Iterable

/**
 * Matches {@link GLRateFactor}s based on the FK to the {@link GLModifier} as well as the
 * properties defined in {@link AbstractRateFactorMatcher}.
 */
@Export
class GLRateFactorMatcher extends AbstractRateFactorMatcher<GLRateFactor> {
  construct(owner : GLRateFactor) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {GLRateFactor.Type.TypeInfo.getProperty("GLModifier") as ILinkPropertyInfo};
  }
}
