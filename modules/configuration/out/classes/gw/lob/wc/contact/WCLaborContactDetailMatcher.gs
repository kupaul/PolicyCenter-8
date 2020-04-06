package gw.lob.wc.contact

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link WCLaborContactDetail}s based on the FK to the {@link WCLaborContact} as well as the
 * Inclusion and ContractEffectiveDate columns.
 */
@Export
class WCLaborContactDetailMatcher extends AbstractEffDatedPropertiesMatcher<WCLaborContactDetail> {

  construct(contactDetail : WCLaborContactDetail) {
    super(contactDetail)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return { WCLaborContactDetail.Type.TypeInfo.getProperty("Inclusion") as IEntityPropertyInfo,
             WCLaborContactDetail.Type.TypeInfo.getProperty("ContractEffectiveDate") as IEntityPropertyInfo }
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return { WCLaborContactDetail.Type.TypeInfo.getProperty("WCLaborContact") as ILinkPropertyInfo }
  }
  
}
