package gw.lob.wc

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link WCJurisdiction}s based on the FK to the {@link Jurisdiction}.
 */
@Export
class WCJurisdictionMatcher extends AbstractEffDatedPropertiesMatcher<WCJurisdiction> {

  construct(jurisdiction : WCJurisdiction) {
    super(jurisdiction)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {WCJurisdiction.Type.TypeInfo.getProperty("State") as IEntityPropertyInfo}
  }

}
