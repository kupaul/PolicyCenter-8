package gw.lob.bop

uses entity.BOPBuilding

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/***
 * NOTE: No test as building's do not have logical matches OOTB - 
 *       i.e. IMBuilding's will never match
 ***/

/**
 * Matches {@link BOPBuilding}s based on the FKs to {@link Building} and {@link BOPLocation}.
 */
@Export
class BOPBuildingMatcher extends AbstractEffDatedPropertiesMatcher<BOPBuilding> {

  construct(owner : BOPBuilding) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {} // Currently no ID columns, just a link to the associated building and location
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return { BOPBuilding.Type.TypeInfo.getProperty("Building") as ILinkPropertyInfo,
             BOPBuilding.Type.TypeInfo.getProperty("BOPLocation") as ILinkPropertyInfo }
  }
  
}
