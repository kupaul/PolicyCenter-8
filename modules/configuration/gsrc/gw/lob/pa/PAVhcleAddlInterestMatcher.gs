package gw.lob.pa

uses gw.contact.AbstractAddlInterestDetailMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches PAVhcleAddlInterests for OOS and Preemption based on the base {@link AbstractAddlInterestDetailMatcher}
 * columns as well as the PAVehicle
 */
@Export
class PAVhcleAddlInterestMatcher extends AbstractAddlInterestDetailMatcher<PAVhcleAddlInterest>   {

  construct(vehAddlInterest : PAVhcleAddlInterest) {
    super(vehAddlInterest)
  }

  override property get CoveredInterestColumns() : List<ILinkPropertyInfo> {
    return {PAVhcleAddlInterest.Type.TypeInfo.getProperty("PAVehicle") as ILinkPropertyInfo}
  }

}
