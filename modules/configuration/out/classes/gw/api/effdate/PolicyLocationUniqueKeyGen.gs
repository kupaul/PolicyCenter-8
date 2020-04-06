package gw.api.effdate
uses java.lang.Iterable
uses gw.entity.IEntityPropertyInfo

/**
 * This class generates {@link EffDatedUniqueKey}s for PolicyLocations
 */
@Export
class PolicyLocationUniqueKeyGen extends AbstractEffDatedUniqueKeyGen<PolicyLocation> {

  construct(location : PolicyLocation) {
    super(location)
  }
  
  override function getErrorMessageStronglyTyped(duplicateLocations : PolicyLocation[]) : String {
    return displaykey.Java.Invariant.PolicyPeriod.AccountLocationReferencedByOnePolicyLocation(_effDatedBean.AccountLocation)
  }

  /**
   * The link to AccountLocation uniquely identifies a PolicyLocation within a Period
   */
  override property get IdentityProperties() : Iterable<IEntityPropertyInfo> {
    return {PolicyLocation.Type.TypeInfo.getProperty("AccountLocation") as IEntityPropertyInfo}
  }

}
