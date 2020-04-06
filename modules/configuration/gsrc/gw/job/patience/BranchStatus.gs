package gw.job.patience
uses gw.api.web.job.JobWizardHelper
uses gw.web.PatienceContext

@Export
class BranchStatus implements PatienceContext {

  var _helper : JobWizardHelper
  var _status : PolicyPeriodStatus

  construct(helper : JobWizardHelper, status : PolicyPeriodStatus) {
    _helper = helper
    _status = status
  }

  override function keepWaiting() : boolean {
    return _helper.refreshAndReturnPolicyPeriod().Status == _status
  }
}
