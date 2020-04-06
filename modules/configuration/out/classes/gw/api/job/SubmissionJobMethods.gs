package gw.api.job

@Export
class SubmissionJobMethods extends JobMethodsDefaultImpl {
  
  construct(submission : Submission) {
    super(submission)
  }
  
  override property get AccountSyncingEnabled() : boolean {
    return true
  }

  override property get AccountSyncingIsDateAware() : boolean {
    return false
  }

  override property get Viewable() : boolean {
    return perm.Submission.view(_job)
  }

  override protected function isOpenForEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return (policyPeriod.Status == "New" or policyPeriod.Status == "Draft") and perm.Submission.edit(_job)
  }

  override protected function isAvailableForSideBySideEditImpl(policyPeriod : PolicyPeriod) : boolean {
    return (policyPeriod.Status == "New" or policyPeriod.Status == "Draft" or policyPeriod.Status == "Quoted" or policyPeriod.Status == "Quoting") and perm.Submission.edit(_job)
  }
  
  override function getValidationLevelImpl(policyPeriod : PolicyPeriod) : ValidationLevel {
    return policyPeriod.Lines.first().getQuoteValidationLevel((_job as Submission).QuoteType)
  }

  override function getRatingStyleImpl(policyPeriod : PolicyPeriod) : RatingStyle {
    return policyPeriod.Lines.first().getQuoteRatingStyle((_job as Submission).QuoteType)
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
