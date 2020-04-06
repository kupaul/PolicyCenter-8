package gw.activity

uses gw.api.util.DisplayableException

enhancement ActivityEnhancement : Activity {

  /* When assigning an activity based on a role on the associated Job, this function checks that the
   * role has been assigned.  If not, it first attempts to assign the role.  If the activity cannot be
   * assigned (either because the role cannot be assigned or because the AssignToRole method returns false)
   * this function will also return false.  Otherwise, it will return true, indicating that the assignment
   * suceeded.
   */
  function assignByJobRole(role: String): boolean {
    // First, check to see if the needed role has already been assigned.  If not, attempt to assign it.
    if (this.Job.getUserRoleAssignmentByRole(role) == null) {  // I.e. the role has not yet been assigned
      this.Job.autoAssignRole(role)
      if (this.Job.getUserRoleAssignmentByRole(role) == null) { // Unable to assign the role
        return false
      }
    }
    // Second, attempt to assign the activity to the role
    return this.assignToRole(role)
  }

  /* When assigning an activity based on a role on the assoicated Account, this function checkes that
   * the role has been assigned.  If not, it first attempts to assign the role.  If the activity cannot
   * be assigned (either because the role cannot be assigned to because the AssignToRole method returns
   * false) this function will also return false.  Otherwise, it will return true, indicating that the
   * assignment suceeded.
   */
  function assignByContainerRole(role: String): boolean {
    if(this.Account.getUserRoleAssignmentByRole(role) == null) {
      // the role has not yet been assigned
      this.Account.autoAssignRole(role)
      if(this.Account.getUserRoleAssignmentByRole(role) == null) {
        return false
      }
    }
    return this.assignToRole(role)
  }
  
  /**
   * Method to determine if the user has sufficient permissions to view the notes on this activity.
   * 
   * @param PolicyPeriod  OPTIONAL. Used to specify the policy period of interest for activities associated with a policy.
   * @return true if the user can view the notes associated with this activity.
   *         false if the user can not view the notes associated with this activity.
   */
  function canViewNotes(policyPeriod : PolicyPeriod) : boolean {
    if (!perm.System.noteview) {
      return false
    }
    
    if (this.Job != null) {
      return perm.Job.view(this.Job)
    } else if (this.Policy != null) {
      return perm.PolicyPeriod.view(policyPeriod)
    } else if (this.Account != null) {
      return perm.Account.view(this.Account)
    } 
    return false
  }
  
  property get SearchResultID() : String {
    if (null == this.Job) {
      if (this.Account == null) {
        throw new DisplayableException(displaykey.Activity.Search.NullAccount)
      }
      var acctNum = this.Account.AccountNumber
      return (acctNum != null and acctNum.length > 0) ? acctNum : "Account" // should be impossible but better than blank
    } else {
      return this.Job.LatestPeriod.PolicyNumberAssigned ? this.Job.LatestPeriod.PolicyNumber : this.Job.JobNumber
    }
  }

  property get UIDisplayName() : String {
    var displayName = this.Job.Policy.Account.AccountHolderContact.Name
    return displayName == null
          ? this.Account.AccountHolderContact.DisplayName
          : displayName
  }
  
  property get UIDisplayState() : typekey.State {
    var displayState = this.Job.Policy.Account.AccountHolderContact.PrimaryAddress.State
    return displayState == null
          ? this.Account.AccountHolderContact.PrimaryAddress.State
          : displayState
  }

}