package gw.web.account.submgr

uses pcf.JobComplete

@Export
class NotTakenReasonPopupUIHelper {
  // Loads the Submission from the DB into a separate bundle before
  // not taking it, to avoid interference from any validation issues on
  // the current page.
  public static function doNotTakeSubmission(submission : entity.Submission, policyPeriod : entity.PolicyPeriod, wizard:pcf.api.Wizard) {

    if (submission.RejectReason == null) {
      throw new gw.api.util.DisplayableException(displaykey.Web.NotTakenReasonPopup.EmptyReasonError)
    }

    var sub : Submission
    var branch : PolicyPeriod

    // Execute the decline in a separate bundle with the submission reloaded from the DB
    gw.transaction.Transaction.runWithNewBundle( \b -> {
      sub = b.loadBean( submission.ID ) as Submission
      branch = b.loadBean( policyPeriod.ID ) as PolicyPeriod

      // But, make sure to update the decline reason
      sub.RejectReason = submission.RejectReason
      sub.RejectReasonText = submission.RejectReasonText

      // Do NotTaken and commit
      branch.SubmissionProcess.notTakeJob()
    })

    // Go to JobComplete page if we're not taking from a wizard
    if (wizard != null) {
      wizard.cancel()
      JobComplete.go(sub, branch)
    }
  }
}