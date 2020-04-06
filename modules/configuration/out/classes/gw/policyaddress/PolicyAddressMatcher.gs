package gw.policyaddress

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo
uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link PolicyAddress}s based on the FK to the {@link Address}.
 */
@Export
class PolicyAddressMatcher extends AbstractEffDatedPropertiesMatcher<PolicyAddress> {

  construct(owner : PolicyAddress) {
    super(owner)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {}
  }

  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    return {PolicyAddress.Type.TypeInfo.getProperty("Address") as ILinkPropertyInfo}
  }

}
