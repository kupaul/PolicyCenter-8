package gw.lob.ba
uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses java.lang.Iterable
uses gw.entity.ILinkPropertyInfo
uses gw.entity.IEntityPropertyInfo

/**
 * Matches BAHiredAutoBasis for OOS and Preemption jobs.  BAHiredAutoBasis 
 *   are matched on the State of the Jurisdiction.
 */
@Export
class BAHiredAutoBasisMatcher extends AbstractEffDatedPropertiesMatcher<BAHiredAutoBasis> {

  construct(owner : BAHiredAutoBasis) {
    super(owner)
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {BAHiredAutoBasis.Type.TypeInfo.getProperty("Jurisdiction") as ILinkPropertyInfo}
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }

}
