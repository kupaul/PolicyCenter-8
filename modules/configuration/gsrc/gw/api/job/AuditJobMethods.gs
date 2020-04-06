package gw.api.job

@Export
class AuditJobMethods extends JobMethodsDefaultImpl {
  
  construct(audit : Audit) {
    super(audit)
  }
  
  override property get AccountSyncingEnabled() : boolean {
    return false
  }

  override property get AccountSyncingIsDateAware() : boolean {
    return false
  }

  override property get DisplayType() : String {
    return (_job as Audit).AuditInformation.UIDisplayName
  }

  override property get Viewable() : boolean {
    return perm.Audit.view and not (_job as Audit).AuditInformation.IsReversal
  }

  override protected function isOpenForEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return (policyPeriod.Status == "Draft" or policyPeriod.Status == "Quoted") and perm.Audit.edit
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
