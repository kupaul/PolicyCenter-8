package gw.reinsurance

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo

uses java.lang.Iterable

@Export
class PolicyRiskMatcher extends AbstractEffDatedPropertiesMatcher<PolicyRisk> {

  construct(risk : PolicyRisk) {
    super(risk)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {PolicyRisk.Type.TypeInfo.getProperty("CoverageGroup") as IEntityPropertyInfo}
  }

}
