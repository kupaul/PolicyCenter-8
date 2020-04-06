package gw.lob.pa

uses gw.api.web.job.JobWizardHelper
uses gw.web.productmodel.ProductModelSyncIssuesHandler

@Export
class PAWizardStepHelper {

  static function syncVehicleModifiers(vehicle : PersonalVehicle, jobWizardHelper : JobWizardHelper) {
    ProductModelSyncIssuesHandler.syncModifiers({vehicle}, jobWizardHelper)  
  }
  
  static function onGarageLocationChange(modifiables : Modifiable[], period : PolicyPeriod, jobWizardHelper : JobWizardHelper) {
    period.PersonalAutoLine.setBaseStateToGarageLocation()
    period.PersonalAutoLine.setPrimaryLocation()
    ProductModelSyncIssuesHandler.syncModifiers(modifiables, jobWizardHelper)  
  }

  private static final var ALLOWED_JOB_TYPES = {
    typekey.Job.TC_SUBMISSION.Code,
    typekey.Job.TC_REWRITE.Code,
    typekey.Job.TC_REWRITENEWACCOUNT.Code,
    typekey.Job.TC_RENEWAL.Code
  }

  static function onVehicleStepExit(period : PolicyPeriod, jobWizardHelper : JobWizardHelper) {
    var context = PALineStepsValidator.validateAllVehiclesGaragedInSameState(period.PersonalAutoLine)
    if (context.Result.Empty) {
      if (ALLOWED_JOB_TYPES.contains(period.Job.Subtype.Code)) {
        period.PersonalAutoLine.setBaseStateToGarageLocation()
      }
      ProductModelSyncIssuesHandler.syncModifiers({period.PersonalAutoLine}, jobWizardHelper)                
    }
    PALineStepsValidator.validateVehiclesStep(period.PersonalAutoLine)  
  }

  static function onViewQuoteStepEnter(period : PolicyPeriod, jobWizardHelper : JobWizardHelper) {
    // set offering and sync coverages for quick quote
    if (period.Submission.QuoteType == QuoteType.TC_QUICK and period.Offering == null) {
      period.Offering = "PABasic"
      gw.web.productmodel.ProductModelSyncIssuesHandler.syncCoverages(period.PersonalAutoLine.AllCoverables, jobWizardHelper)
    }
  }
}
