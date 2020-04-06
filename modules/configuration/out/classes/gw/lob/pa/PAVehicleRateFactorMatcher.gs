package gw.lob.pa
uses gw.lob.common.AbstractRateFactorMatcher
uses gw.entity.ILinkPropertyInfo
uses java.lang.Iterable

/**
 * Matches {@link PAVehicleRateFactor}s based on the FK to the {@link PAVehicleModifier} as well as the
 * properties defined in {@link AbstractRateFactorMatcher}.
 */
@Export
class PAVehicleRateFactorMatcher extends AbstractRateFactorMatcher<PAVehicleRateFactor> {
  construct(owner : PAVehicleRateFactor) {
    super(owner)
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {PAVehicleRateFactor.Type.TypeInfo.getProperty("PAVehicleModifier") as ILinkPropertyInfo}
  }
}
