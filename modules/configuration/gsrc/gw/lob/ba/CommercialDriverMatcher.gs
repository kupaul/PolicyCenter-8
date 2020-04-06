package gw.lob.ba

uses gw.entity.ILinkPropertyInfo
uses gw.entity.IEntityPropertyInfo

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher

uses java.lang.Iterable

@Export
class CommercialDriverMatcher extends AbstractEffDatedPropertiesMatcher<CommercialDriver> {

  construct(owner : CommercialDriver) {
    super(owner)
  }
  
  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {CommercialDriver.Type.TypeInfo.getProperty("FirstName") as IEntityPropertyInfo,
            CommercialDriver.Type.TypeInfo.getProperty("LastName") as IEntityPropertyInfo,
            CommercialDriver.Type.TypeInfo.getProperty("DateOfBirth") as IEntityPropertyInfo}
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {CommercialDriver.Type.TypeInfo.getProperty("BusinessAutoLine") as ILinkPropertyInfo}
  }
}
