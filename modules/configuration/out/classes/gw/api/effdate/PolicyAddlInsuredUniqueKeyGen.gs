package gw.api.effdate
uses java.lang.Iterable
uses gw.entity.IEntityPropertyInfo

/**
 * This class generates {@link EffDatedUniqueKey}s for PolicyAddlInsureds
 */
@Export
class PolicyAddlInsuredUniqueKeyGen extends PolicyContactRoleUniqueKeyGen<PolicyAddlInsured> {
  construct(policyAddlInsured : PolicyAddlInsured) {
    super(policyAddlInsured)
  }

  override function getErrorMessageStronglyTyped(duplicateAddInsureds : PolicyAddlInsured[]) : String {
    return displaykey.Web.Policy.PolicyLine.Validation.PolicyContactRole.DuplicateRole((typeof _effDatedBean).TypeInfo.DisplayName, _effDatedBean)
  }

  /**
   * A PolicyAddlInsured can be duplicated across Lines, so the Line and the AccountContactRole are used to uniquely identify
   * PolicyAddlInsureds.
   */
  override property get IdentityProperties() : Iterable<IEntityPropertyInfo> {
    var identifiers = super.IdentityProperties.toList()
    identifiers.addAll({PolicyAddlInsured.Type.TypeInfo.getProperty("PolicyLine") as IEntityPropertyInfo})
    return identifiers
  }

}
