package gw.job
uses gw.job.SubmissionLetterHelper

enhancement SubmissionGroupLettersEnhancement : SubmissionGroup {
  
  /**
   * Returns an array of all the distinct producers of the submissions
   * in this submission group
   */
  property get AllProducers() : User[] {
    return this.Submissions*.RoleAssignments
                           .where( \ u -> u.Role == "Producer" and u.AssignedUser != null)
                           .map( \ u -> u.AssignedUser )
  }
  
  /**
   * Returns true if any Submission in the batch can have a letter of type type
   * generated for it.
   */  
  function canAnySubmissionsSendLetter(type : LetterType) : boolean {
    var submissionLettertypes = SubmissionLetterHelper.getSubmissionLettertypes(this.Submissions)
    return SubmissionLetterHelper.canSendLetterType(submissionLettertypes, type, this.Submissions)
  }

  /**
   * Sends a confirmation letter with every possible submission in the batch
   */
  function sendConfirmationLetter() {
    //implement confirmation letter integration here  
  }
  
}
