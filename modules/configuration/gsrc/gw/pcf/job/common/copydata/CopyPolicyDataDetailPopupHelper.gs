package gw.pcf.job.common.copydata

uses gw.policy.PolicyPeriodCopier
uses gw.web.policy.PolicyPeriodDatePickerHelper
uses java.util.Date

/**
 * Helper to job/common/copydata/CopyPolicyDataDetailPopup.pcf
 */
@Export
class CopyPolicyDataDetailPopupHelper {
  var targetPeriod: PolicyPeriod
  var sourcePeriod: PolicyPeriod as SourcePeriod
  var sourceSliceDate: Date as SourceSliceDate
  var isJob: boolean

  var copier: PolicyPeriodCopier as Copier
  var matchItems: KeyableBean[]

  construct(aTargetPeriod: PolicyPeriod, initialSourcePeriod: PolicyPeriod, initialSourceSliceDate: Date, sourceIsJob: boolean) {
    targetPeriod = aTargetPeriod
    SourcePeriod = initialSourcePeriod
    SourceSliceDate = initialSourceSliceDate
    isJob = sourceIsJob
    Copier = new gw.policy.PolicyPeriodCopier(SourcePeriod)
    matchItems = null
  }

  /**
   * Validation before data copy
   */
  function checkForMatches() {
    var newMatches = Copier.findMatchItems(targetPeriod)
    var validateResult = new gw.api.validation.ValidationResult()
    var validationContext = gw.validation.ValidationUtil.createContext(ValidationLevel.TC_DEFAULT)
    if (newMatches.Count > 0 and (matchItems == null or!sameItems(newMatches))) {
      newMatches.each(\k -> validationContext.Result.addWarning(k, ValidationLevel.TC_DEFAULT, displaykey.Web.CopyPolicyData.CopyDataSelect.MatchItemsFound(k.DisplayName)))
      matchItems = newMatches
    }
    if (!validationContext.Result.Empty) {
      validationContext.Result.addWarning(targetPeriod, ValidationLevel.TC_DEFAULT, displaykey.Web.CopyPolicyData.CopyDataSelect.MatchItemsFoundWarning)
      validationContext.raiseExceptionIfProblemsFound()
    }
  }

  /**
   * Recomputes the source period and copier when slice date has changed
   */
  function reslicePolicyPeriodAndCopier() {
    SourcePeriod = PolicyPeriodDatePickerHelper.findPolicyPeriodAsOfDate(SourceSliceDate, SourcePeriod)
    Copier = new PolicyPeriodCopier(SourcePeriod)
  }

  /**
   * The actual data copy
   */
  public function copyPolicyDataIntoTargetPeriod() {
    Copier.copyIntoWithHistory(targetPeriod)
  }

  /**
   * No-items warning widget visibility flag
   */
  public property get IsNoItemsVisible(): boolean {
    return Copier.AllCopiers.Count == 0
  }

  /**
   * No-items label text
   */
  public property get NoItemsMessage(): String {
    return isJob ? displaykey.Web.CopyPolicyData.NoItems.Job(SourcePeriod.Job.JobNumber) : displaykey.Web.CopyPolicyData.NoItems.Policy(SourcePeriod.PolicyNumber)
  }

  private function sameItems(items: KeyableBean[]): boolean {
    return (items.Count != matchItems.Count) ? false : items.allMatch(\k -> matchItems.contains(k))
  }
}