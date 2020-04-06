package gw.reinsurance

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

@Export
class LocationRiskMatcher extends AbstractEffDatedPropertiesMatcher<LocationRisk> {

  construct(locRisk : LocationRisk) {
    super(locRisk)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {LocationRisk.Type.TypeInfo.getProperty("CoverageGroup") as IEntityPropertyInfo}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {LocationRisk.Type.TypeInfo.getProperty("Location") as ILinkPropertyInfo}
  }

}
