package gw.lob.cp

uses gw.contact.AbstractAddlInterestDetailMatcher
uses gw.entity.ILinkPropertyInfo

/**
 * Matches CPBldgAddlInterests for OOS and Preemption based on the base {@link AbstractAddlInterestDetailMatcher}
 * columns as well as the CPBuilding
 */
@Export
class CPBldgAddlInterestMatcher extends AbstractAddlInterestDetailMatcher<CPBldgAddlInterest> {

  construct(interest : CPBldgAddlInterest) {
    super(interest)
  }

  override property get CoveredInterestColumns() : List<ILinkPropertyInfo> {
    return {CPBldgAddlInterest.Type.TypeInfo.getProperty("CPBuilding") as ILinkPropertyInfo}
  }

}
