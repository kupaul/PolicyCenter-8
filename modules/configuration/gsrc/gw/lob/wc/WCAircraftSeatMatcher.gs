package gw.lob.wc

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * {@link WCAircraftSeat}s do not have enough sufficiently unique colums to define matches in
 * the out of the box config, thus this matcher will return false when asked for matches.
 */
@Export
class WCAircraftSeatMatcher extends AbstractEffDatedPropertiesMatcher<WCAircraftSeat> {

  construct(owner : WCAircraftSeat) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {Building.Type.TypeInfo.getProperty("ID") as IEntityPropertyInfo }
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {Building.Type.TypeInfo.getProperty("WCLine") as ILinkPropertyInfo }
  }

  // OOTB, WCAircraftSeat entities are not matchable.  Customers should delete the overridden
  // isLogicalMatch() method and implement the IdentityColumns property if they would like to match
  // these entities (e.g. if a unique WC aircraft seat identifier was created and used).

  override function isLogicalMatch(other : WCAircraftSeat) : boolean {
    return false
  }

  override function isLogicalMatchUntyped(bean : KeyableBean) : boolean {
    if (bean typeis WCAircraftSeat) {
      return isLogicalMatch(bean)
    } else {
      return false
    }
  }
  
}
