package gw.lob.ba
uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.ILinkPropertyInfo
uses java.lang.Iterable
uses gw.entity.IEntityPropertyInfo

/**
 * Matches BANonOwnedBasis for OOS and Preemption jobs.  BANonOwnedBasis 
 *   are matched on the State of the Jurisdiction.
 */
@Export
class BANonOwnedBasisMatcher extends AbstractEffDatedPropertiesMatcher<BANonOwnedBasis>{

  construct(owner : BANonOwnedBasis) {
    super(owner)
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {BANonOwnedBasis.Type.TypeInfo.getProperty("Jurisdiction") as ILinkPropertyInfo}
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }

}
