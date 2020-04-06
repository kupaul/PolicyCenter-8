package gw.lob.ba
uses gw.lob.common.AbstractRateFactorMatcher
uses java.lang.Iterable
uses gw.entity.ILinkPropertyInfo

/**
 * Matche BAJurisRateFactors based on the BAJurisModifier
 */
@Export
class BAJurisdictionRateFactorMatcher extends AbstractRateFactorMatcher<BAJurisRateFactor> {

  construct(owner : BAJurisRateFactor) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {BAJurisRateFactor.Type.TypeInfo.getProperty("BAJurisModifier") as ILinkPropertyInfo};
  }

}
