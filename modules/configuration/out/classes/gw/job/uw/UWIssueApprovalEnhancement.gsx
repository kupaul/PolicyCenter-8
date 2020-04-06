package gw.job.uw

uses java.util.Date

enhancement UWIssueApprovalEnhancement : UWIssueApproval {

  /**
   * Whether the value comparisons (if any) associated with this approval are met
   */
  property get ConditionMet() : boolean {
    return this.Issue.approvalConditionMetBy(this.ReferenceValue)
  }
  
  property get IssueType() : UWIssueType {
    return this.Issue.IssueType
  }

  property get IssueValue() : String {
    return this.Issue.Value
  }
  
  property get Duration() : UWApprovalDurationType {
    return this.DurationType
  }
  
  property set Duration(durType : UWApprovalDurationType) {
    var expDate : Date = null
    switch (durType) {
      case "OneYear":
        expDate = this.Branch.EditEffectiveDate.addYears(1)
        break
      case "ThreeYears":
        expDate = this.Branch.EditEffectiveDate.addYears(3)
        break
      default:
        expDate = null
        break
    }
    this.DurationType = durType
    this.ApprovalInvalidFrom = expDate
  }
  
  function initializeDefaultValues() {
    initializeValues(IssueType.DefaultEditBeforeBind,
                     IssueType.DefaultDurationType,
                     IssueType.calculateDefaultValue(this.IssueValue),
                     defaultApprovalBlockingPoint())
  }

  function initializeValuesBasedOnApproval(prevApproval : UWIssueApproval) {
    initializeValues(prevApproval.EditBeforeBind,
                     prevApproval.Duration,
                     prevApproval.ReferenceValue,
                     prevApproval.BlockingPoint)
  }

  private function initializeValues(editBeforeBind : boolean,
                                    durationType : UWApprovalDurationType, 
                                    value : String, 
                                    bp : UWIssueBlockingPoint) {
    this.ApprovingUser = User.util.CurrentUser
    this.EditBeforeBind = editBeforeBind
    this.Duration = durationType
    this.ReferenceValue = value
    this.BlockingPoint = bp
  }
  
  function userHasAuthorityToGrantThisApproval(user : User) : boolean {
    return this.Issue.valueCanBeApprovedBy(user.UWAuthorityProfiles, this.ReferenceValue)
  }
  
  /**
   * Recalculate the approval expiration date for this approval and generate a history event.
   */
  function recalculateExpirationForChangeEffDate(){
    var oldExpiration = this.ApprovalInvalidFrom
    //Re-assigning the duration will cause the expiration date to get recalculated
    Duration = this.DurationType
    if (oldExpiration != this.ApprovalInvalidFrom){
      this.Issue.addChangeEffectiveDateHistory()
    }
  }

  property get IsManual() : boolean {
    return this.AutomaticApprovalCause == null
  }

  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private function defaultApprovalBlockingPoint() : UWIssueBlockingPoint {
    var defaultBP = IssueType.DefaultApprovalBlockingPoint
    var nextBP = this.Branch.UnderWriterIssueBlockingPoint.Next
    if (nextBP == null) {
      nextBP = "NonBlocking"
    }
    return (defaultBP.Priority < nextBP.Priority ? defaultBP : nextBP)
  } 
}
