package gw.lob.wc

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link WCParticipatingPlan}s based on the FK to the {@link WCLine}.
 */
@Export
class WCParticipatingPlanMatcher extends AbstractEffDatedPropertiesMatcher<WCParticipatingPlan> {

  construct(owner : WCParticipatingPlan) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {WCParticipatingPlan.Type.TypeInfo.getProperty("WorkersCompLine") as ILinkPropertyInfo}
  }
}
