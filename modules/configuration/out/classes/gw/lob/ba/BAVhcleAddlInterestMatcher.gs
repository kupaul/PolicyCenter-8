package gw.lob.ba

uses gw.contact.AbstractAddlInterestDetailMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches BAVhcleAddlInterests for OOS and Preemption based on the base {@link AbstractAddlInterestDetailMatcher}
 * columns as well as the BAVehicle
 */
@Export
class BAVhcleAddlInterestMatcher extends AbstractAddlInterestDetailMatcher<BAVhcleAddlInterest> {

  construct(addlInterstDetail : BAVhcleAddlInterest) {
    super(addlInterstDetail)
  }
  
  override property get CoveredInterestColumns() : List<ILinkPropertyInfo> {
    return {BAVhcleAddlInterest.Type.TypeInfo.getProperty("BAVehicle") as ILinkPropertyInfo}
  }

}
