package gw.lob.wc.rating

uses entity.WCRetrospectiveRatingPlan

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link WCRetrospectiveRatingPlan}s based on the FK to the {@link WCLine}.
 */
@Export
class WCRetrospectiveRatingPlanMatcher extends AbstractEffDatedPropertiesMatcher<WCRetrospectiveRatingPlan> {

  construct(owner : WCRetrospectiveRatingPlan) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {WCRetrospectiveRatingPlan.Type.TypeInfo.getProperty("WorkersCompLine") as ILinkPropertyInfo}
  }

}
