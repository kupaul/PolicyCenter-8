package gw.contact

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Concrete implemenation of {@link AbstractEffDatedPropertiesMatcher} for matching {@link PolicyAddlInsuredDetail}s.
 * PolicyAddlInsuredDetails match on the AdditionalInsuredType as well as the FK to the {@link PolicyAddlInsured}
 * PolicyContactRole.
 */
@Export
class PolicyAddlInsuredDetailMatcher extends AbstractEffDatedPropertiesMatcher<PolicyAddlInsuredDetail> {

  construct(insuredDetail : PolicyAddlInsuredDetail) {
    super(insuredDetail)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {PolicyAddlInsuredDetail.Type.TypeInfo.getProperty("AdditionalInsuredType") as IEntityPropertyInfo}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {PolicyAddlInsuredDetail.Type.TypeInfo.getProperty("PolicyAddlInsured") as ILinkPropertyInfo}
  }

}
