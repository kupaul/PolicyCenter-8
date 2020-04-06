package gw.lob.im

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/***
 * NOTE: No test as building's do not have logical matches OOTB - 
 *       i.e. IMBuilding's will never match
 ***/ 

/**
 * Matches {@link IMBuilding}s based on the FKs to the {@link Building} and {@link IMLocation}.  Note
 * that as Buildings will not match in the out of the box config, IMBuildings by default will not as either.
 */    
@Export
class IMBuildingMatcher extends AbstractEffDatedPropertiesMatcher<IMBuilding> {

  construct(owner : IMBuilding) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {} // Currently no ID columns, just a link to the associated building and location
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return { IMBuilding.Type.TypeInfo.getProperty("Building") as ILinkPropertyInfo,
             IMBuilding.Type.TypeInfo.getProperty("IMLocation") as ILinkPropertyInfo }
  }
  
}
