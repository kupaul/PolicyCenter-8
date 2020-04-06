package gw.lob.pa.mvr

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

@Export
class PolicyDriverMVRMatcher extends AbstractEffDatedPropertiesMatcher<PolicyDriverMVR> {

  construct(mvr : PolicyDriverMVR) {
    super(mvr)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {PolicyDriverMVR.Type.TypeInfo.getProperty("PolicyDriver") as ILinkPropertyInfo}
  }

}
