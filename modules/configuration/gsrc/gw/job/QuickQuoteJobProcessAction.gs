package gw.job

uses gw.api.web.job.JobWizardHelper

@Export
class QuickQuoteJobProcessAction extends FullAppJobProcessAction {

  construct(aHelper : JobWizardHelper, aPolicyPeriod : PolicyPeriod, theNextStep : String,
            vLevel : ValidationLevel, rStyle : RatingStyle) {
    super(aHelper, aPolicyPeriod, theNextStep, vLevel, rStyle)
  }

  /*
   * This is PA specific for now.
   */
  override function preProcess() {
//    policyPeriod.PersonalAutoLine.adjustQuickQuoteNumbers()
    // sync coverages
    gw.web.productmodel.ProductModelSyncIssuesHandler.syncCoverages(policyPeriod.PersonalAutoLine.AllCoverables, helper)    
  }

}
