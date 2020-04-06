package gw.lob.wc

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * {@link InclusionPerson}s are not matchable in the out of the box config as there are not sufficient
 * uniquely identifying fields - as such, this matcher will return false for match comparisons.
 */
@Export
class InclusionPersonMatcher extends AbstractEffDatedPropertiesMatcher<InclusionPerson> {

  construct(owner : InclusionPerson) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {InclusionPerson.Type.TypeInfo.getProperty("ID") as IEntityPropertyInfo }
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {InclusionPerson.Type.TypeInfo.getProperty("WCLine") as ILinkPropertyInfo }
  }
  
  // OOTB, InclusionPerson entities are not matchable.  Customers should delete the overridden
  // isLogicalMatch() method and implement the IdentityColumns property if they would like to match
  // these entities.
  override function isLogicalMatch(other : InclusionPerson) : boolean {
    return false
  }

  override function isLogicalMatchUntyped(bean : KeyableBean) : boolean {
    if (bean typeis InclusionPerson) {
      return isLogicalMatch(bean)
    } else {
      return false
    }
  }
}
