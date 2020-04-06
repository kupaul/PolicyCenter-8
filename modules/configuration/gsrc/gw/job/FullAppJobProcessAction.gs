package gw.job
uses gw.validation.PCValidationContext
uses gw.api.web.job.JobWizardHelper

@Export
class FullAppJobProcessAction implements JobProcessAction {

  protected var policyPeriod : PolicyPeriod
  protected var helper : JobWizardHelper
  protected var nextStep : String
  protected var validationLevel : ValidationLevel
  protected var ratingStyle : RatingStyle
  
  construct(aHelper : JobWizardHelper, aPolicyPeriod : PolicyPeriod, theNextStep : String,
            vLevel : ValidationLevel, rStyle : RatingStyle) {
    this.helper = aHelper
    this.policyPeriod = aPolicyPeriod
    this.nextStep = theNextStep
    this.validationLevel = vLevel
    this.ratingStyle = rStyle
  }

  override function preProcess() {}

  override function process() {
    try {
      saveDraftAndIgnoreValidation()
      // "IgnoreValidation" in the above really means "do not throw validation exceptions to the user" 
      // but if there are validation errors, the messages will exist in the helper.   Rather than try
      // to quote--which should be guaranteed to fail--we'll just let these messages stay, and expect
      // them to be displayed to the user by the caller.
      if (!helper.hasWebMessageToRender()) {
        policyPeriod.JobProcess.requestQuote(helper, validationLevel, ratingStyle)
        if (policyPeriod.Job.Complete) {
          // Wizard.finish() re-validates the Pebbles page. 
          // NOTE: An EvaluationException might be thrown
          // while re-evaluating the visibility expressions of the menu items associated with
          // the ListView within the context of an OOS merge because the ListView may have a handle
          // to an entity with a null bundle. OOTB it seems impossible to reach this path, but if 
          // a customer were to create some kind of job that is completed by quote, it 
          // could happen. If so, they may want to disable page validation here, as is done in
          // helper.goDirectlyToStepWithoutWidgetValidation
          helper.Wizard.finish()
        } else {
          saveDraftAndIgnoreValidation()
        }

        // Go to the appropriate place based on whether we have a valid quote, or if the policy is quoted at all.
        if (policyPeriod.Status == "Quoted") {
          // Don't save the Pebbles page; it can blow up if requestQuote merged duplicates. (see the NOTE 
          // above regarding EvaluationException while rendering within the context of OOS merges)
          if (policyPeriod.JobProcess.canViewQuote()) {
            helper.goDirectlyToStepWithoutWidgetValidation(nextStep)
            helper.goToVisibleStep(policyPeriod)
          } else {
            // If the user cannot view the quote (because quote is hidden and user lacks hidden quote override permission)
            // then remain on the Policy Review page and display a warning.
            helper.addInfoWebMessage(displaykey.Web.SubmissionWizard.PolicyReview.QuoteNotVisible)
            helper.goToStep("PolicyReview")
          }
        } else if (policyPeriod.Status == "Draft") {
          // Presumably we're back in Draft because the quote was invalid, so display that to the user and move on
          helper.addInfoWebMessage(displaykey.Web.SubmissionWizard.QuoteReviewMessage.InvalidQuote)

          if (policyPeriod.Lines.hasMatch(\pl -> pl.DiagnosticRatingWorksheets.length > 0)) {
            helper.addInfoWebMessage(displaykey.Web.SubmissionWizard.QuoteReviewMessage.InvalidQuote.ReferToPartialWorksheet)
          }

          helper.goToVisibleStep(policyPeriod)
        } else {
          pcf.PleaseBePatientPopup.push(policyPeriod, helper, nextStep, new gw.job.patience.BranchStatus(helper, "Quoting"))
        }
      }
    } catch (e : QuoteHaltedException) {
      // Just a marker exception to stop the quote, so do nothing.  The errors will already have been added to the
      // web message context at this point
    }  
  }

  function saveDraftAndIgnoreValidation() {
    PCValidationContext.doWhileIgnoringPageLevelValidation( \ -> helper.Wizard.saveDraft())
  }
}