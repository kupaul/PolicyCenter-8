package gw.lob.wc

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link WCCoveredEmployeeBase}s based on the FK to the {@link PolicyLocation} as well as the
 * ClassCode property.
 */
@Export
class WCCoveredEmployeeBaseMatcher extends AbstractEffDatedPropertiesMatcher<WCCoveredEmployeeBase> {

  construct(delegateInstance : WCCoveredEmployeeBase) {
    super(delegateInstance)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return { WCCoveredEmployeeBase.Type.TypeInfo.getProperty("ClassCode") as IEntityPropertyInfo }
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {WCCoveredEmployeeBase.Type.TypeInfo.getProperty("Location") as ILinkPropertyInfo}
  }

}
