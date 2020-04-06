package gw.lob.ba

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches BAJurisdictions based on the State and Line
 */
@Export
class BAJurisdictionMatcher extends AbstractEffDatedPropertiesMatcher<BAJurisdiction> {

 construct(jurisdiction : BAJurisdiction) {
   super(jurisdiction)
 }

 override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
   return {BAJurisdiction.Type.TypeInfo.getProperty("State") as IEntityPropertyInfo}
 }

 override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
   return {BAJurisdiction.Type.TypeInfo.getProperty("BALine") as ILinkPropertyInfo}
 }

}
