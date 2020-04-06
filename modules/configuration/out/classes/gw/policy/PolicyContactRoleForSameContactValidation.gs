package gw.policy
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses java.lang.IllegalArgumentException
uses java.util.ArrayList
uses gw.api.domain.account.AccountSyncedField
uses gw.api.domain.account.AccountSyncable
uses gw.api.domain.DisplayKeyResolver
uses gw.entity.IEntityType
uses gw.entity.IEntityPropertyInfo

/**
 * A validation that runs on all PolicyContactRoles that share the same contact.
 */
@Export
class PolicyContactRoleForSameContactValidation extends PCValidationBase {
  
  var _policyContactRoles : List<entity.PolicyContactRole>

  construct(valContext : PCValidationContext, policyContactRoles : List<PolicyContactRole>) {
    super(valContext)
    _policyContactRoles = policyContactRoles
    var contacts = policyContactRoles*.AccountContactRole*.AccountContact*.Contact.toSet()
    if (contacts.Count != 1) {
      throw new IllegalArgumentException("PolicyContactRoleForSameContactValidation should only be used with PolicyContactRoles associated with the same contact."
        + "\nGot the following contacts: " + contacts.join(", "));
    }
  }

  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")  // Merely mark that we've seen this method.  We end up calling this method for each different slice, so don't return if we've already been here
    var pcrs : List<PolicyContactRole> = new ArrayList<PolicyContactRole>()
    pcrs.addAll(_policyContactRoles)
    pcrs = pcrs.sort()
    while (pcrs.Count > 1) {
      var currentPCR = pcrs.remove(0)
      for (pcr in pcrs) {
        var mismatchedFields = getAccountSyncedFieldsWithDifferentPolicyEntityFieldValues(currentPCR, pcr).map(\ field -> getMismatchedFieldString(currentPCR, pcr, field)).sort()  // sort to ensure the order is deterministic
        if (not mismatchedFields.Empty) {
          Result.addError(pcr, "quotable", displaykey.Web.PolicyContactRole.Validation.MismatchedFields(pcr.AccountContactRole.AccountContact, (typeof currentPCR).TypeInfo.DisplayName, (typeof pcr).TypeInfo.DisplayName,
            mismatchedFields.join(", ")))
        }
      }
    }
  }
  
  private function getMismatchedFieldString(pcr1 : PolicyContactRole, pcr2 : PolicyContactRole, field : AccountSyncedField<? extends AccountSyncable, ?>) : String {
    return "${getPropertyDisplayName(pcr1, field.PolicyEntityFieldName)}: ${field.getPolicyEntityFieldValue(pcr1)}/${field.getPolicyEntityFieldValue(pcr2)}"
  }
  
  private function getPropertyDisplayName(pcr : PolicyContactRole, propertyName : String) : String {
    var pcrType = (typeof pcr)
    var displayName = DisplayKeyResolver.getInstance().getPropertyDisplayName(pcrType as IEntityType, pcrType.TypeInfo.getProperty(propertyName) as IEntityPropertyInfo)
    if (displayName == null) {
      displayName = propertyName
    }
    return displayName
  }
  
  private function getAccountSyncedFieldsWithDifferentPolicyEntityFieldValues(pcr1 : PolicyContactRole, pcr2 : PolicyContactRole) : List<AccountSyncedField<? extends AccountSyncable, ?>> {
    if (pcr1 == pcr2) {
      return {}
    }
    var sharedFields = pcr1.AccountSyncedFields.intersect(pcr2.AccountSyncedFields)
    return sharedFields.where(\ field -> field.getPolicyEntityFieldValue(pcr1) != field.getPolicyEntityFieldValue(pcr2))
  }

}
