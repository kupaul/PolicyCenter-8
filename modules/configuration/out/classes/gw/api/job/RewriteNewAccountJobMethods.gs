package gw.api.job

@Export
class RewriteNewAccountJobMethods extends JobMethodsDefaultImpl {
  
  construct(rewriteNewAccount : RewriteNewAccount) {
    super(rewriteNewAccount)
  }
  
  override property get AccountSyncingEnabled() : boolean {
    return true
  }

  override property get AccountSyncingIsDateAware() : boolean {
    return true
  }

  override property get Viewable() : boolean {
    return perm.RewriteNewAccount.view(_job)
  }

  override protected function isOpenForEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return policyPeriod.Status == "Draft" and perm.RewriteNewAccount.edit(_job)
  }

  override protected function isAvailableForSideBySideEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return false
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
