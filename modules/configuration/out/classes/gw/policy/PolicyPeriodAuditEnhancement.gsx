package gw.policy

uses gw.job.audit.AuditScheduler
uses gw.job.audit.DisplayableAuditInfoList
uses gw.job.audit.DisplayableAuditInfo
uses gw.plugin.Plugins
uses java.util.ArrayList
uses java.util.Date

enhancement PolicyPeriodAuditEnhancement : PolicyPeriod {

  property get AllowsPremiumAudit() : boolean {
    //CPP policy
    if (this.MultiLine) {
      return false
    }
    return this.Lines.hasMatch( \ l -> l.AllowsPremiumAudit)
  }

  property get IsAuditable() : boolean {
    //CPP policy
    if (this.MultiLine) {
      return false
    }
    return this.Lines.hasMatch(\ p -> p.Auditable)
  }

  property get DisplayableAuditInfoList() : DisplayableAuditInfo[] {
    return new DisplayableAuditInfoList(this.Policy.AllAuditInformations).InfoList
  }

  property get CompletedNotReversedFinalAudits() : AuditInformation[] {
    return this.AuditInformations
        .where(\ info ->
            info.IsFinalAudit
            and info.IsComplete
            and not info.HasBeenReversed)
  }

  property get WaivedFinalAudits() : AuditInformation[] {
     return this.AuditInformations
         .where(\ info ->
             info.IsFinalAudit
             and (info.IsWaived or (info.IsOpen and info.IsWithdrawn)))
  }

  property get IsReportingPolicy() : boolean {
    var selectedPaymentPlan = this.SelectedPaymentPlan
    if (selectedPaymentPlan == null) {
      return this.BasedOn?.ReportingPlanSelected
    }
    return this.ReportingPlanSelected
  }

  property get ActivePremiumReports() : AuditInformation[] {
    return this.AuditInformations.where(\ info ->
              info.IsPremiumReport 
              and not (info.HasBeenReversed or info.IsReversal or info.IsWaived or info.IsWithdrawn))
                  .sortBy(\ info -> info.AuditPeriodStartDate)
  }
  
  property get CompletedNotReversedPremiumReports() : AuditInformation[] {
    return this.AuditInformations.where(\ info ->
              info.IsPremiumReport 
              and (info.IsComplete)
              and not (info.HasBeenReversed or info.IsReversal))
                  .sortBy(\ info -> info.AuditPeriodStartDate)
  }
  
  property get LastReportedDate() : Date {
    var auditInfos = new ArrayList<AuditInformation>()
    auditInfos.addAll(this.CompletedNotReversedPremiumReports as java.util.Collection<entity.AuditInformation>)
    auditInfos.addAll(this.CompletedNotReversedFinalAudits as java.util.Collection<entity.AuditInformation>)
    return auditInfos.maxBy(\ a -> a.AuditPeriodEndDate).AuditPeriodEndDate
  }
  
  property get CanAcceptNewAudit() : boolean {
    return not auditTypesAvailableToAdd().Empty
  }
  
  
  /**
   * @return The open final audit if it exists.  Null where there is none
   */
  property get OpenFinalAudit() : Audit {
    
    var auditInfo = this.AuditInformations
       .firstWhere(\ info ->
           info.IsFinalAudit
           and info.HasBeenStarted
           and info.Audit.PolicyPeriod.Active)
    
    return auditInfo != null ? auditInfo.Audit : null
       
  }

  
  function auditTypesAvailableToAdd() : List<AuditScheduleType> {
    var availableTypes = new ArrayList<AuditScheduleType>()
    if (hasScheduledFinalAudit() or hasOpenFinalAudit()) {
      if (IsReportingPolicy and hasGapsInPremiumReports()) {
        availableTypes.add(AuditScheduleType.TC_PREMIUMREPORT)
      }
    }
    else {
      if (CompletedNotReversedFinalAudits.IsEmpty) {
        availableTypes.add(AuditScheduleType.TC_FINALAUDIT)
      }
    }
    return availableTypes
  }
  
  function suggestedAuditDateRange(type : AuditScheduleType) : List<Date> {
    switch (type) {
      case "FinalAudit" :
        return {this.PeriodStart, this.EndOfCoverageDate}
      case "PremiumReport" :
        return datesFromFirstGap()
      default :
        return {}
    }
  }

  function scheduleCancellationFinalAudit() {
    if (IsAuditable) {
      AuditScheduler.scheduleFinalAudit(this, true)
    }
  }

  function scheduleExpirationFinalAudit() {
    if (IsAuditable) {
      AuditScheduler.scheduleFinalAudit(this, false)
    }
  }

  function scheduleAllAudits() {
    if (IsAuditable) {
      AuditScheduler.scheduleAllAudits(this)
    }
  }

  function removeScheduledFinalAudit() {
    var scheduledFinalAudit = scheduledFinalAudit()
    if (scheduledFinalAudit != null) {
      scheduledFinalAudit.remove()
    }
  }

  function rescheduleAuditSeries() {
    if (IsAuditable) {
      AuditScheduler.rescheduleAuditSeries(this)
    }
  }

  function hasFinalAuditFinished() : boolean {
    return (CompletedNotReversedFinalAudits.Count != 0)
  }

  function hasWaivedFinalAudit() : boolean {
    return (WaivedFinalAudits.Count != 0)
  }
  
  function hasScheduledFinalAudit() : boolean {
    return scheduledFinalAudit() != null
  }

  function hasOpenFinalAudit() : boolean {
    
    return OpenFinalAudit != null
  }
  

  function hasQuotedNotReversedAudit() : boolean{
    return this.AuditInformations
       .hasMatch(\ info ->
           info.IsFinalAudit
           and not info.HasBeenReversed
           and info.Audit.PolicyPeriod.ValidQuote)
  }

  function updateAuditPeriodEndDatesFollowingCancellation() {
    AuditScheduler.updateEndDatesFollowingCancellation(this, openFinalAudit())
  }

  function reverseFinalAudits() {
    CompletedNotReversedFinalAudits.each(\ info -> info.Audit.reverse())
  }

  function isFinalAuditAfterCancellation() : boolean{
    return this.Audit != null and this.BasedOn.Cancellation != null
  }

  function withdrawOpenFinalAudit() {
    withdrawOpenFinalAudit(false)
  }

  function withdrawOpenRevisedFinalAudit() {
    withdrawOpenFinalAudit(true)
  }

  /**
   * Generate the appropriate activities when this audit branch has been preempted by a cancellation
   */
  function createActivitiesTriggeredByCancellation(){
    
      OpenFinalAudit.createRoleActivity(typekey.UserRole.TC_AUDITOR,
          ActivityPattern.finder.getActivityPatternByCode("preemption"),
          displaykey.Audit.Activity.JobPreempted.Subject,
          displaykey.Audit.Activity.JobPreempted.Desc(OpenFinalAudit.JobNumber) )
      
          
  }
  
  /**
   * Can the specified audit be waived (assuming user has permissions)
   */
  function canBeWaived(auditInfo : AuditInformation) : boolean {
    switch (true) {
      case auditInfo.IsWaived:
        return false  //can't re-waive
      case not auditInfo.IsFinalAudit:
        return true   //no extra restrictions on premium/ad hoc/checking audits
      case this.SelectedPaymentPlan.IsReportingPlan:
        return false  //final audits on a reporting policy can't be waived
      default:
        return pluginPermitsAuditToBeWaived(auditInfo)
    }
  }

  function pluginPermitsAuditToBeWaived(auditInfo : AuditInformation) : boolean {
    var plugin = Plugins.get(gw.plugin.policyperiod.IPolicyPeriodPlugin)
    return plugin.canWaiveNonreportingFinalAudit(this, auditInfo)
  }

  function cancelPremiumReports() {
    this.AuditInformations.where(\ info -> info.IsPremiumReport)
      .each(\ info -> {
        if (info.IsComplete) {
          if (!info.HasBeenReversed) {
            info.Audit.reverse()
          }
        }
        else if (info.HasBeenStarted) {
          if (not (info.IsWaived or info.IsWithdrawn)) {
            info.Audit.withdraw()
          }
        }
        else {
          info.remove()
        }
      })
  }

  function getAuditWizardWarningMessages() : List<String> {
    
    var messages = this.getWizardWarningMessages()
    if(!perm.Audit.edit){
      messages.add( displaykey.Web.AuditWizard.NoEditPermission(this.Audit.getUserRoleAssignmentByRole("Auditor").AssignedUser.DisplayName) )
    } 
    return messages
    
  }
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  private function scheduledFinalAudit() : AuditInformation {
    return finalAudit(false)
  }
  
  private function openFinalAudit() : AuditInformation {
    return finalAudit(true)
  }
  
  private function finalAudit(lookForOpen : boolean) : AuditInformation {
    var finalAudits = this.AuditInformations
        .where(\ info ->
            info.IsFinalAudit
            and (lookForOpen ? info.IsOpen : not info.HasBeenStarted)
            and not info.IsWaived)
    if (finalAudits.Count > 1) {
        throw "Should have no more than 1 final audit on a policy period, found " + finalAudits.Count
    }
    return finalAudits.first()
  }
  
  private function withdrawOpenFinalAudit(lookForRevised : boolean) {
    var revisionType = (lookForRevised ? "Revision" : null)
    var infoToWithdraw = this.AuditInformations
        .firstWhere(\ info ->
            info.IsFinalAudit
            and info.IsOpen
            and info.RevisionType == revisionType)
    if (infoToWithdraw != null) {
      infoToWithdraw.Audit.withdraw()
    }
  }
  
  private function datesFromFirstGap() : List<Date> {
    var activeReports = ActivePremiumReports
    var startDates = activeReports.map(\ info -> info.AuditPeriodStartDate)
    var endDates = activeReports.map(\ info -> info.AuditPeriodEndDate)
    if (startDates.first() != this.PeriodStart) {
      return orderedDates(this.PeriodStart, startDates.first())
    }
    if (startDates.Count > 0) {
        for (i in 0..|(startDates.Count - 1)) {
          if (endDates[i] != startDates[i + 1]) {
            return orderedDates(endDates[i], startDates[i + 1])
          }
        }
    }
    if (endDates.last() != this.PeriodEnd) {
      return orderedDates(endDates.last(), this.EndOfCoverageDate)
    }
    return null
  }
  
  private function orderedDates(oneDate : Date, otherDate : Date) : List<Date> {
    var temp = {oneDate, otherDate}
    return {temp.min(), temp.max()}
  }
  
  private function hasGapsInPremiumReports() : boolean {
    var activeReports = ActivePremiumReports
    var startDates = activeReports.map(\ info -> info.AuditPeriodStartDate)
    var endDates = activeReports.map(\ info -> info.AuditPeriodEndDate)
    var hasGaps = startDates.first() > this.PeriodStart or endDates.last() < this.EndOfCoverageDate
    if (startDates.Count > 0) {
        for (i in 0..|(startDates.Count - 1)) {
          hasGaps = hasGaps or (endDates[i] != startDates[i + 1])
        }
    }
    return hasGaps
  }
}
