package gw.job

uses gw.plugin.messaging.BillingMessageTransport

enhancement AuditInformationEnhancement : AuditInformation {

  /**
    Returns the Audit job that revises this current Audit
  */
  property get RevisingAudit() : Audit {
    var policyPeriod = this.Audit.PolicyPeriod
    return this.Audit.Policy.Jobs.whereTypeIs(Audit)
        .firstWhere(\ audit ->
            audit.PolicyPeriod.BasedOn == policyPeriod
            and not audit.AuditInformation.IsWaived
            and not audit.AuditInformation.IsWithdrawn
            and not audit.AuditInformation.IsReversal)
  }

  property get DisplayStatus() : String{
    if (this.Audit == null){
      return (IsWaived
          ? displaykey.Audit.DisplayStatus.Waived
          : displaykey.Audit.DisplayStatus.Scheduled)
    }
    else {
      if (IsOpen) {
        return displaykey.Audit.DisplayStatus.InProgress
      }
      else if(this.RevisingAudit != null) {
        return displaykey.Audit.DisplayStatus.Revised
      }
      else {
        return this.Audit.PolicyPeriod.Status.DisplayName
      }
    } 
  }

  property get BasedOnFinalAuditInfo() : AuditInformation {
    var info = this
    if (HasBeenStarted) {
      var auditPeriod = this.Audit.PolicyPeriod
      while (auditPeriod.Audit.AuditInformation.RevisionType != null) {
        auditPeriod = auditPeriod.BasedOn  
      }
      info = auditPeriod.Audit.AuditInformation
    }
    return info
  }

  property get UserCanWaive() : boolean {
    return AuditProcess.canWaive().Okay and not IsRevision
  }

  property get UserCanWithdraw() : boolean {
    return AuditProcess.canWithdraw().Okay and IsRevision
  }

  private property get AuditProcess() : AuditProcess {
    return this.Audit.PolicyPeriod.AuditProcess
  }

  property get BasedOnIfReversal() : AuditInformation {
    return (IsReversal
        ? this.Audit.PolicyPeriod.BasedOn.Audit.AuditInformation
        : this)
  }

  property get HasBeenReversed() : boolean {
    return this.ReversalDate != null
  }

  property get HasBeenStarted() : boolean {
    return this.Audit != null
  }

  property get IsScheduled() : boolean {
    return not (HasBeenStarted or IsWaived)
  }

  property get IsFinalAudit() : boolean {
    return this.AuditScheduleType == "FinalAudit"
  }

  property get IsPremiumReport() : boolean {
    return this.AuditScheduleType == "PremiumReport"
  }

  property get IsCheckingAudit() : boolean {
    return this.AuditScheduleType == "CheckingAudit"
  }

  property get IsRevision() : boolean {
    return this.RevisionType == "Revision"
  }

  property get IsReversal() : boolean {
    return this.RevisionType == "Reversal"
  }

  property get IsComplete() : boolean {
    return this.Audit.PolicyPeriod.Status == PolicyPeriodStatus.TC_AUDITCOMPLETE
  }

  property get IsWithdrawn() : boolean {
    return this.Audit.PolicyPeriod.Status == PolicyPeriodStatus.TC_WITHDRAWN
  }

  property get IsWaived() : boolean {
    return this.Waive
  }

  property get IsOpen() : boolean {
    return HasBeenStarted and not (IsComplete or IsWithdrawn or IsWaived)
  }

  property get IsSeries() : boolean {
    return this.Series
  }

  /**
   * Audit is revisable if it has been completed and was not waived, reversed or already revised 
   */
  property get IsRevisable() : boolean {
    return HasBeenStarted 
        and IsComplete
        and not IsWithdrawn
        and not IsWaived
        and not IsReversal
        and not HasBeenReversed
        and RevisingAudit == null
  }

  property get UIDisplayName() : String {
    return (IsRevision
        ? revisionDisplayName()
        : (IsReversal
            ? reversalDisplayName() :
            this.AuditScheduleType.DisplayName))
  }

  function markWaived(branch : PolicyPeriod){
    this.Waive = true
    branch.addEvent( BillingMessageTransport.WAIVEFINALAUDIT_MSG )
  }

  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private function revisionDisplayName() : String {
    return BasedOnFinalAuditInfo.UIDisplayName + " " + RevisionType.TC_REVISION
  }

  private function reversalDisplayName() : String {
    return this.Audit.PolicyPeriod.BasedOn.Audit.AuditInformation.UIDisplayName + " " + RevisionType.TC_REVERSAL
  }
}