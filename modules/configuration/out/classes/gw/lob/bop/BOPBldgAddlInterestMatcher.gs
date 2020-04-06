package gw.lob.bop

uses gw.contact.AbstractAddlInterestDetailMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches BOPBldgAddlInterests for OOS and Preemption based on the base {@link AbstractAddlInterestDetailMatcher}
 * columns as well as the BOPBuilding
 */
@Export
class BOPBldgAddlInterestMatcher extends AbstractAddlInterestDetailMatcher<BOPBldgAddlInterest> {

  construct(interest : BOPBldgAddlInterest) {
    super(interest)
  }

  override property get CoveredInterestColumns() : List<ILinkPropertyInfo> {
    return {BOPBldgAddlInterest.Type.TypeInfo.getProperty("BOPBuilding") as ILinkPropertyInfo}
  }

}
