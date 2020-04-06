package gw.api.job

@Export
class PolicyChangeJobMethods extends JobMethodsDefaultImpl {
  
  construct(policyChange : PolicyChange) {
    super(policyChange)
  }
  
  override property get AccountSyncingEnabled() : boolean {
    return true
  }

  override property get AccountSyncingIsDateAware() : boolean {
    return true
  }

  override property get Viewable() : boolean {
    return perm.PolicyChange.view(_job)
  }

  override protected function isOpenForEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return policyPeriod.Status == "Draft" and perm.PolicyChange.edit(_job)
  }

  override protected function isAvailableForSideBySideEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return (policyPeriod.Status == "Draft" or policyPeriod.Status == "Quoted" or policyPeriod.Status == "Quoting") and perm.PolicyChange.edit(_job)
  }
  
  override property get CanUpdatePeriodDates() : boolean {
    return true
  }

  override property get CanCopyCoverages()  : boolean {
    return true
  }

  override function canViewModifiers(policyPeriod : PolicyPeriod) : boolean {
    return perm.System.viewmodifiers
  }

}
