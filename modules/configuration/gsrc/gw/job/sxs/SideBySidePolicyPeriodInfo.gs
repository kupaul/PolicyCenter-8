package gw.job.sxs

uses gw.api.web.job.JobWizardHelper
uses gw.lob.common.SideBySideUtil
uses gw.validation.PCValidationContext

uses java.lang.Exception

@Export
class SideBySidePolicyPeriodInfo {
  var _colIndex : int as ColumnIndex
  var _policyPeriod : PolicyPeriod as Period
  var _sxsException : Exception as SxSException
  var _jobWizardHelper : JobWizardHelper as JobWizardHelper

  // The validation context and whether or not the period is editable are cached because they can
  // be expensive to compute.
  var _validationContext : PCValidationContext as readonly Validation
  var _sxsEditable : boolean as readonly SxSEditable

  construct(policyPeriod : PolicyPeriod, colIndex : int, vLevel : ValidationLevel, jobWizHelper : JobWizardHelper) {
    _policyPeriod = policyPeriod
    _colIndex = colIndex
    _jobWizardHelper = jobWizHelper

    _validationContext = new PCValidationContext(vLevel)
    _validationContext.Result = policyPeriod.JobProcess.JobProcessValidator.LastResult

    _sxsEditable = policyPeriod.AvailableForSideBySideEdit
    _sxsException = null
  }

  property get ErrorText() : String {
    return SideBySideUtil.getPeriodWarningsMessage(Period, Validation, SxSException)
  }

  property get AssociatedPeriodQuoted() : boolean {
    return _policyPeriod.Status == PolicyPeriodStatus.TC_QUOTED
  }

  property get PremiumsVisible() : boolean {
    return Period.ValidQuote and Period.JobProcess.canViewQuote()
  }
  
  property set SxSException(e : Exception) {
    _sxsException = e
  }
  
  property get SxSException() : Exception {
    return _sxsException
  }
  
  property get JobWizardHelper() : JobWizardHelper {
    return _jobWizardHelper
  }
  
  function validateWithoutQuote() {
    _validationContext = SideBySideUtil.validatePeriodForSideBySide(_policyPeriod, _validationContext.Level)
    _policyPeriod.JobProcess.JobProcessValidator.LastResult = _validationContext.Result
  }
  
  function refreshSideBySideStep() {
    _jobWizardHelper.Wizard.refreshCurrentStep()
  }
}
