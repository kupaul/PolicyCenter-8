package gw.api.job

@Export
class ReinstatementJobMethods extends JobMethodsDefaultImpl {
  
  construct(reinstatement : Reinstatement) {
    super(reinstatement)
  }
  
  override property get AccountSyncingEnabled() : boolean {
    return true
  }

  override property get AccountSyncingIsDateAware() : boolean {
    return true
  }

  override property get Viewable() : boolean {
    return perm.Reinstatement.view(_job)
  }

  override protected function isOpenForEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return policyPeriod.Status == "Draft" and perm.Reinstatement.edit(_job)
  }

  override protected function isAvailableForSideBySideEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return false
  }
  
  override property get CanUpdatePeriodDates() : boolean {
    return true
  }

  override property get CanCopyCoverages()  : boolean {
    return false
  }

  override function canViewModifiers(policyPeriod : PolicyPeriod) : boolean {
    return false
  }

}
