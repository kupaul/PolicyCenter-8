package gw.api.job

uses java.lang.IllegalArgumentException
uses java.lang.UnsupportedOperationException

@Export
class JobMethodsDefaultImpl implements JobMethods {
  
  protected var _job : Job

  construct(job : Job) {
    _job = job
  }

  override property get AccountSyncingEnabled() : boolean {
    throw new UnsupportedOperationException("Subclass must override the AccountSyncingEnabled property")
  }

  override property get AccountSyncingIsDateAware() : boolean {
    throw new UnsupportedOperationException("Subclass must override the AccountSyncingIsDateAware property")
  }

  override property get DisplayType() : String {
    return _job.Subtype.DisplayName
  }

  override property get Viewable() : boolean {
    throw new UnsupportedOperationException("Subclass must override the Viewable property")
  }

  override function isOpenForEdit(policyPeriod : PolicyPeriod) : boolean {
    checkPolicyPeriodIsOnJob(policyPeriod)
    return isOpenForEditImpl(policyPeriod)
  }

  /**
   * True if the policyPeriod on this job should be open for edit because
   * it's in the correct state and the user has the appropriate job permissions.
   * Called by #isOpenForEdit that additionally checks that the given PolicyPeriod
   * is on the same job.
   */
  protected function isOpenForEditImpl(policyPeriod : PolicyPeriod) : boolean {
    throw new UnsupportedOperationException("Subclass must override the isOpenForEditImpl method")
  }
  
  override function isAvailableForSideBySideEdit(policyPeriod : PolicyPeriod) : boolean {
    checkPolicyPeriodIsOnJob(policyPeriod)
    return isAvailableForSideBySideEditImpl(policyPeriod)
  }

  /**
   * True if the policyPeriod on this job should be available for side-by-side
   * quoting because it's in the correct state and the user has the appropriate
   * job permissions. Called by #isAvailableForSideBySideEdit that additionally checks that the given PolicyPeriod
   * is on the same job.
   */
  protected function isAvailableForSideBySideEditImpl(policyPeriod : PolicyPeriod) : boolean {
    throw new UnsupportedOperationException("Subclass must override the isAvailableForSideBySideEditImpl method")
  }
  
  override function getValidationLevel(policyPeriod : PolicyPeriod) : ValidationLevel {
    checkPolicyPeriodIsOnJob(policyPeriod)
    return getValidationLevelImpl(policyPeriod)
  }

  /**
   * The validation level for the policyPeriod on this job.
   * Called by #getValidationLevel that additionally checks that the given PolicyPeriod
   * is on the same job.
   */
  function getValidationLevelImpl(policyPeriod : PolicyPeriod) : ValidationLevel {
    return typekey.ValidationLevel.TC_QUOTABLE
  }

  override function getRatingStyle(policyPeriod : PolicyPeriod) : RatingStyle {
    checkPolicyPeriodIsOnJob(policyPeriod)
    return getRatingStyleImpl(policyPeriod)
  }

  /**
   * The rating style for the policyPeriod on this job.
   * Called by #getRatingStyle that additionally checks that the given PolicyPeriod
   * is on the same job.
   */
  function getRatingStyleImpl(policyPeriod : PolicyPeriod) : RatingStyle {
    return typekey.RatingStyle.TC_DEFAULT
  }

  override property get CanUpdatePeriodDates() : boolean {
    throw new UnsupportedOperationException("Subclass must override the canUpdatePeriodDates method")
  }

  override property get CanCopyCoverages()  : boolean {
    throw new UnsupportedOperationException("Subclass must override the canCopyCoverages method")
  }

  override function canViewModifiers(policyPeriod : PolicyPeriod) : boolean {
    throw new UnsupportedOperationException("Subclass must override the canViewModifiers method")
  }

  /**
   * Checks that that the given PolicyPeriod is on the this job.
   */
  protected function checkPolicyPeriodIsOnJob(policyPeriod : PolicyPeriod) {
    if (policyPeriod.Job != _job) {
      throw new IllegalArgumentException("The policy period, ${policyPeriod}, must be on this job, ${job}.")
    }
  }

}
