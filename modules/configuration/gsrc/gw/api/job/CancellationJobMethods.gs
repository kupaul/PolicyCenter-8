package gw.api.job

@Export
class CancellationJobMethods extends JobMethodsDefaultImpl {
  
  construct(cancellation : Cancellation) {
    super(cancellation)
  }
  
  override property get AccountSyncingEnabled() : boolean {
    return false
  }

  override property get AccountSyncingIsDateAware() : boolean {
    return false
  }

  override property get Viewable() : boolean {
    return perm.Cancellation.view(_job)
  }

  override protected function isOpenForEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return policyPeriod.Status == "Draft" and perm.Cancellation.edit(_job)
  }

  override protected function isAvailableForSideBySideEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return false
  }
  
  override property get CanUpdatePeriodDates() : boolean {
    return false
  }

  override property get CanCopyCoverages()  : boolean {
    return false
  }

  override function canViewModifiers(policyPeriod : PolicyPeriod) : boolean {
    return false
  }

}
