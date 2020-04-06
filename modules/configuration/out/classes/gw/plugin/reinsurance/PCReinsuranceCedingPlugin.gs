package gw.plugin.reinsurance

uses gw.api.util.Logger
uses gw.assignment.AssignmentUtil
uses gw.reinsurance.agreement.RIProgramValidation
uses gw.reinsurance.risk.RIRiskValidation
uses gw.validation.PCValidationContext
uses gw.pl.currency.MonetaryAmount
uses gw.api.system.PCLoggerCategory

@Export
class PCReinsuranceCedingPlugin extends PCReinsuranceCedingPluginBase {

  var _logger = PCLoggerCategory.REINSURANCE_CEDING_PLUGIN

  construct() { }

  /**
   * Add a PolicyPeriod to the work queue in order to get its cedings calculated.
   * This is currently only used for initial ceding, <em>not a full recalculation</em>.
   *
   * All ceding calculation is done via a work queue.  In order to trigger the calculation,
   * the entity which needs calculations (e.g. a whole PolicyPeriod in the case of a
   * branch promotion) must be added to the queue.
   *
   * @param period The PolicyPeriod for which ceding calculations are needed
   */
  override function enqueueForCeding(period : PolicyPeriod, reason : RIRecalcReason, comment : String) {
    if (period.AllReinsurables.Count > 0) {
      createWorkItem(period, reason, comment, false, period.Bundle)

      _logger.info("Added policy ${period.PolicyNumber}, branch ${period.BranchName}, reason ${reason}, comment ${comment} to queue for ceding")
    }
  }

  /**
   * Calculate the cedings for the given PolicyPeriod.
   *
   * This method is called by the work queue.
   *
   * @param period The PolicyPeriod for which ceding calculations are needed
   * @param recalculateAll true if all cedings on this period should be recalculated
   * @param reason Reason this ceding calculation is being done
   * @param comment If this is a recalculation, an optional comment explaining the recalc
   */
  override function calculateCedingForPeriod(period : PolicyPeriod, recalculateAll : boolean, reason : RIRecalcReason, comment : String, updateUser : User) {
    if (reason == null) {
      // Catch this now rather than waiting for DBNullConstraintException
      throw  "Reason for ceding calcuation may not be null"
    }

    _logger.info("Ceding calculation requested for policy ${period.PolicyNumber}, branch ${period.BranchName}, reason ${reason}")

    if (recalculateAll) {
      var periodInBundle = period.regenerateRisks()
      // continue to cede even if there are invalid attachments
      // better to cede invalid amounts than nothing at all
      validateAttachments(periodInBundle, updateUser)
      periodInBundle.Bundle.commit()
    }

    var newCedings = processCedings(period, reason, comment)

    // Print out Cedings
    newCedings.each( \ c -> {
      _logger.debug("Cedings against ${c.Cost.ActualAmount} for coverage ${c.Cost}")
      c.Cedings.each(\ t -> _logger.debug(" -> ceding ${t.CedingRate}% (${t.CededPremium}) - ${t.Agreement.Commission}% commisson (${t.Commission}) to agreement ${t.Agreement.Name} for dates ${t.EffectiveDate} - ${t.ExpirationDate}"))
    })
  }

  protected function validateAttachments(period : PolicyPeriod, activityUser : User) {
    var context = new PCValidationContext(ValidationLevel.TC_DEFAULT)
    period.AllReinsurables.each(\ r -> {
      for (ririsk in r.RIVersionList.AllVersions) {
        ririsk.updateCedingOnAllAttachments()

        //validate net retention
        if (ririsk.FacRINeeded.IsPositive) {
          //check for UW approval
          var uwIssue =  period.UWIssuesActiveOnly.firstWhere(\ u -> u.IssueKey == r.UWIssueKey and u.IssueType.Code == "RINetRetention")
          if (uwIssue == null or (uwIssue.ApprovalValue != null and ririsk.FacRINeeded > new MonetaryAmount(uwIssue.ApprovalValue))) {
            createActivity(period, activityUser, displaykey.Web.Reinsurance.RIRisk.Validation.InvalidAttachmentForRisk(r), displaykey.UWIssue.Reinsurance.NetRetentionGreaterThanTarget.ShortDesc)
            break;
          }
        }

        //validate attachments
        var validator = new RIRiskValidation(context, ririsk)
        validator.validate()
        if (validator.Result.Errors.HasElements) {
          var desc = ""
          validator.Result.ErrorMessages.each(\ o -> {desc += (o + "\n")})
          createActivity(period, activityUser, displaykey.Web.Reinsurance.RIRisk.Validation.InvalidAttachmentForRisk(r), desc)
          break;
        }
      }
    })
  }

  private function createActivity(period : PolicyPeriod, activityUser : User, subject :String, description : String) {
    var activity = ActivityPattern.finder.getActivityPatternByCode("notification").createJobActivity(period.Bundle, period.Job,
           subject, description, null, null, null, null, null)
    if (not activity.assignUserAndDefaultGroup(activityUser)) {
      activity.assign( AssignmentUtil.DefaultUser.DefaultAssignmentGroup, AssignmentUtil.DefaultUser )
    }
  }

  protected function processCedings(period : PolicyPeriod, reason : RIRecalcReason, comment : String) : List<RICededPremium> {
   return new PCCedingCalculator().processCedings(period, reason, comment)
  }

  // old signature...some tests still rely on this.
  protected function processCedings(period : PolicyPeriod, fullRecalc : boolean, reason : RIRecalcReason, comment : String) : List<RICededPremium> {
    return new PCCedingCalculator().processCedings(period, reason, comment)
  }

  /**
   * Sample optimization - if dirty programs only have policy attachments and the Policy does not start within any program, we can skip recalculation
   */
  override function shouldRecalculateCeding(workItem : RICedingWorkItem) : boolean {
    if (workItem typeis RIProgramChangeCedingWorkItem) {
      if(workItem.ChangedPrograms.hasMatch(\ r -> r.Program.LossDateAttachmentTreaties.HasElements)) {
        return true
      } else {
        var periodStart = workItem.PolicyPeriod.PeriodStart
        return (workItem.ChangedPrograms.hasMatch(\ r -> r.Program.EffectiveDate.beforeOrEqual(periodStart) and r.Program.CedingRecalcExpirationDate.after(periodStart)))
      }
    }
    return true
  }

  override function userResponsibleForProgramChange(period : PolicyPeriod, dirtyPrograms : RIProgram[]) : User {
    var program = period.RIRiskVersionLists*.AllVersions*.PolicyAttachmentProgram.firstWhere(\ r -> dirtyPrograms.contains(r))
    if (program == null) {
      program = period.RIRiskVersionLists*.AllVersions*.LossDateAttachmentProgram.firstWhere(\ r -> dirtyPrograms.contains(r))
    }
    return program == null ? period.UpdateUser : program.ResponsibleUser
  }

  override function logErrorForInvalidPrograms(programs : List<RIProgram>) {
    var context = new PCValidationContext(ValidationLevel.TC_DEFAULT)
    programs.each(\ r -> {
      var validator = new RIProgramValidation(context, r)
      validator.validate()
      if (validator.Result.Errors.HasElements) {
        //create warning in log
        _logger.warn(displaykey.Web.Reinsurance.Program.Validation.InvalidProgram(r.DisplayName))
      }
    })
  }
}
