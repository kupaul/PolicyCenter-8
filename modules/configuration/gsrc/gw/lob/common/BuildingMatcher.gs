package gw.lob.common

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * {@link Building}s are currently unmatchable, and thus this matcher will return false.  If a customer adds
 * sufficient fields to buildings so they can be uniquely identified (something equivalent to a Vehicle Identification
 * Number), they can re-implement this class to match based on those fields.
 */
@Export
class BuildingMatcher extends AbstractEffDatedPropertiesMatcher<Building> {

  construct(owner : Building) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {Building.Type.TypeInfo.getProperty("ID") as IEntityPropertyInfo }
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {Building.Type.TypeInfo.getProperty("PolicyLocation") as ILinkPropertyInfo }
  }
  
  // OOTB, Building entities are not matchable.  Customers should delete the overridden
  // isLogicalMatch() method and implement the IdentityColumns property if they would like to match
  // these entities (e.g. if a unique building identifier was created and used).

  override function isLogicalMatch(other : Building) : boolean {
    return false
  }

  override function isLogicalMatchUntyped(bean : KeyableBean) : boolean {
    if (bean typeis Building) {
      return isLogicalMatch(bean)
    } else {
      return false
    }
  }
  
}
