package gw.lob.wc

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link WCExcludedWorkplace}s based on the FK to the {@link WCLine} as well as the
 * Excluded and State properties.
 */
@Export
class WCExcludedWorkplaceMatcher extends AbstractEffDatedPropertiesMatcher<WCExcludedWorkplace> {

  construct(owner : WCExcludedWorkplace) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {WCExcludedWorkplace.Type.TypeInfo.getProperty("ExcludedItem") as IEntityPropertyInfo,
            WCExcludedWorkplace.Type.TypeInfo.getProperty("State") as IEntityPropertyInfo}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {WCExcludedWorkplace.Type.TypeInfo.getProperty("WCLine") as ILinkPropertyInfo}
  }

}
