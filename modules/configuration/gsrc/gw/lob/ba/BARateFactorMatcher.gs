package gw.lob.ba
uses gw.lob.common.AbstractRateFactorMatcher
uses gw.entity.ILinkPropertyInfo
uses java.lang.Iterable

@Export
class BARateFactorMatcher extends AbstractRateFactorMatcher<BARateFactor> {
  construct(owner : BARateFactor) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {BARateFactor.Type.TypeInfo.getProperty("BAModifier") as ILinkPropertyInfo};
  }
}
