package gw.lob.im

uses gw.contact.AbstractAddlInterestDetailMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches IMSchEquipAddlInterests for OOS and Preemption based on the base {@link AbstractAddlInterestDetailMatcher}
 * columns as well as the ContractorsEquipment
 */
@Export
class IMSchEquipAddlInterestMatcher extends AbstractAddlInterestDetailMatcher<IMSchEquipAddlInterest> {

  construct(interest : IMSchEquipAddlInterest) {
    super(interest)
  }

  override property get CoveredInterestColumns() : List<ILinkPropertyInfo> {
    return {IMSchEquipAddlInterest.Type.TypeInfo.getProperty("ContractorsEquipment") as ILinkPropertyInfo}
  }

}
