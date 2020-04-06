package gw.account

uses gw.lang.reflect.IType
uses gw.api.domain.account.AbstractDateAwareAccountSyncedFieldImpl

/**
 * Handles a field synced between an account entity and a PolicyContactRole.  It has
 * has the added functionality that setting the policy entity field will set the same
 * field on all other PolicyContactRoles that share the same contact and have that field.
 */
@Export
abstract class AbstractPolicyContactRoleSyncedField<S extends PolicyContactRole, T> extends AbstractDateAwareAccountSyncedFieldImpl<S, T> {

  construct(accountEntityFieldNameArg : String, policyEntityFieldNameArg : String, updateEntityFieldName : String, updateEntityIsNullFieldName : String, updateType : IType) {
    super(accountEntityFieldNameArg, policyEntityFieldNameArg, updateEntityFieldName, updateEntityIsNullFieldName, updateType)
  }

  construct(baseFieldName : String, updateType : IType) {
    super(baseFieldName, updateType)
  }

  override public function setPolicyEntityFieldValue(accountSyncable : S, value : T) {
    // Setting the PolicyContactRole's field should set it for all PolicyContactRoles that share the same contact
    accountSyncable.Branch.PolicyContactRoles
      .where(\ pcr -> pcr.hasSameContactAs(accountSyncable) and (typeof pcr).TypeInfo.getProperty(getPolicyEntityFieldName()) != null)
      .each(\ pcr -> pcr.setFieldValue(getPolicyEntityFieldName(), value))
  }
  
}
