package gw.api.effdate
uses java.lang.Iterable
uses gw.entity.IEntityPropertyInfo

/**
 * This class generates {@link EffDatedUniqueKey}s for PolicyContactRoles
 */
@Export
class PolicyContactRoleUniqueKeyGen<T extends PolicyContactRole> extends AbstractEffDatedUniqueKeyGen<T> {

  construct(pcr : T) {
    super(pcr)
  }

  override function getErrorMessageStronglyTyped(pcrs : T[] ) : String {
    return displaykey.Web.Policy.PolicyPeriod.Validation.PolicyContactRole.DuplicateRole((typeof _effDatedBean).TypeInfo.DisplayName, _effDatedBean)
  }

  /**
   * For most PolicyContactRoles, the link to the AccountContactRole uniquely identifies a PolicyContactRole within a Period
   * (meaning that there should be no two PolicyContactRoles of the same Type pointing to the same AccountContactRole).  If
   * there are exceptions to this rule, the subtype can implement it's own {@link UniqueOnPolicyPeriod}
   */
  override property get IdentityProperties() : Iterable<IEntityPropertyInfo> {
    return {PolicyContactRole.Type.TypeInfo.getProperty("AccountContactRole") as IEntityPropertyInfo}
  }

}
