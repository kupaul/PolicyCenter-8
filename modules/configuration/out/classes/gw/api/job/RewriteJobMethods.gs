package gw.api.job

@Export
class RewriteJobMethods extends JobMethodsDefaultImpl {
  
  construct(rewrite : Rewrite) {
    super(rewrite)
  }
  
  override property get AccountSyncingEnabled() : boolean {
    return true
  }

  override property get AccountSyncingIsDateAware() : boolean {
    return true
  }

  override property get DisplayType() : String {
    return (_job as Rewrite).RewriteType.Description
  }

  override property get Viewable() : boolean {
    return perm.Rewrite.view(_job)
  }

  override protected function isOpenForEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return policyPeriod.Status == "Draft" and perm.Rewrite.edit(_job)
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
