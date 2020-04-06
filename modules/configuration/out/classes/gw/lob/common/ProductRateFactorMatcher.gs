package gw.lob.common
uses java.lang.Iterable
uses gw.entity.ILinkPropertyInfo

/**
 * Matches {@link ProductRateFactor}s based on the FK to {@link ProductModifier}, as well as the properties
 * defined in {@link AbstractRateFactorMatcher}
 */
@Export
class ProductRateFactorMatcher extends AbstractRateFactorMatcher<ProductRateFactor> {
  construct(owner : ProductRateFactor) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {ProductRateFactor.Type.TypeInfo.getProperty("ProductModifier") as ILinkPropertyInfo}
  }
}
