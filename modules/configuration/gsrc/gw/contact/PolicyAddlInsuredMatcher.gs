package gw.contact

uses gw.entity.ILinkPropertyInfo

uses java.lang.Iterable

/**
 * Concrete implementation of {@link AbstractPolicyContactRoleMatcher} for matching {@link PolicyAddlInsured}s.
 * PolicyAddlInsureds match on the {@link PolicyLine} FK in addition to any columns from 
 * AbstractPolicyContactRoleMatcher.
 */
@Export
class PolicyAddlInsuredMatcher extends AbstractPolicyContactRoleMatcher<PolicyAddlInsured> {

  construct(addlInsured : PolicyAddlInsured) {
    super(addlInsured)
  }
  
  override property get ParentColumns() : Iterable<ILinkPropertyInfo> {
    var columns = super.ParentColumns.toList()
    columns.add(PolicyAddlInsured.Type.TypeInfo.getProperty("PolicyLine") as ILinkPropertyInfo)
    return columns
  }

}
