package gw.webservice.pc.pc700.job

uses gw.api.web.job.JobAPIImpl
uses gw.api.assignment.UserAssignee
uses gw.transaction.Transaction
uses gw.api.webservice.exception.PermissionException
uses gw.api.webservice.exception.EntityStateException
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.SOAPException
uses gw.api.assignment.AutoAssignAssignee
uses gw.api.webservice.exception.RequiredFieldException
uses gw.xml.ws.annotation.WsiWebService
uses gw.webservice.pc.pc700.gxmodel.SimpleValuePopulator
uses gw.api.database.PCBeanFinder

@WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/job/JobAPI" )
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.job.JobAPI instead")
class JobAPI
{
  /**
   * Adds an activity to a job using an activity pattern. First, attempts to generate an activity from the given
   * pattern. The new activity is initialized with the following fields from the activity pattern: Pattern, Type,
   * Subject, Description, Mandatory, Priority, Recurring, Command
   * <p/>
   * The activity's target date is calculated using the pattern's TargetStartPoint, TargetDays, TargetHours, and
   * TargetIncludeDays fields. The activity's escalation date is calculated using the pattern's EscalationStartPt,
   * EscalationDays, EscalationHours, and EscalationInclDays fields. If those fields aren't included in the activity
   * pattern, then the target and/or escalation date won't be set. If the target date is calculated to be after the
   * escalation date, then the target date is set to be the same as the escalation date.
   * <p/>
   * The activity's job ID is set to the given job ID.  The activity's previousUserID is set to the current user.
   * <p/>
   * The newly created activity is then assigned to the specified group and user using the Assignment Engine. Finally,
   * the activity is saved in the database, and the ID of the newly created activity is returned.
   *
   * @param jobId The ID of the job with which the activity should be associated.
   * @param activityPatternId The ID of the activity pattern that is to be used for the activity.
   * @param userId The ID of the user to assign to
   * @param groupId The ID of a group the user belongs to for assignment.
   * @param activityFields GX model to populate fields for Activity
   * @returns The ID of the newly created activity.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(PermissionException, "if the caller does not have all of the following permissions: VIEW_JOB, CREATE_ACTIVITY.")
  @Throws(EntityStateException, "if there is an attempt to add an activity using an activity pattern that isn't available to the particular type of the given job.")
  function addActivityFromPatternAndAssignToUser(jobId : String,
            activityPatternId : String,
            userId : String,
            groupId : String,
            activityFields : gw.webservice.pc.pc700.gxmodel.activitymodel.types.complex.Activity) : String {
    var activity : Activity
    Transaction.runWithNewBundle(\ bundle -> {
      var user = userId != null ? PCBeanFinder.loadBeanByPublicID<User>(userId, User) : null
      var group = groupId != null ? PCBeanFinder.loadBeanByPublicID<Group>(groupId, Group) : null
      activity = JobAPIImpl.createActivityFromPattern(jobId, activityPatternId, bundle)
      if(activityFields <> null){
        SimpleValuePopulator.populate(activityFields, activity)
      }
      activity.setUp(new UserAssignee(group, user))
    })
    return activity.PublicID
  }

  /**
   * Adds an activity to a job using an activity pattern. First, attempts to generate an activity from the given
   * pattern. The new activity is initialized with the following fields from the activity pattern: Pattern, Type,
   * Subject, Description, Mandatory, Priority, Recurring, Command
   * <p/>
   * The activity's target date is calculated using the pattern's TargetStartPoint, TargetDays, TargetHours, and
   * TargetIncludeDays fields. The activity's escalation date is calculated using the pattern's EscalationStartPt,
   * EscalationDays, EscalationHours, and EscalationInclDays fields. If those fields aren't included in the activity
   * pattern, then the target and/or escalation date won't be set. If the target date is calculated to be after the
   * escalation date, then the target date is set to be the same as the escalation date.
   * <p/>
   * The activity's job ID is set to the given job ID.  The activity's previousUserID is set to the current user.
   * <p/>
   * The newly created activity is then assigned to the specified queue using the Assignment Engine.  Finally, the
   * activity is saved in the database, and the ID of the newly created activity is returned.
   *
   * @param jobId The ID of the job with which the activity should be associated.
   * @param activityPatternId The ID of the activity pattern that is to be used for the activity.
   * @param queueId The ID of the queue to assign to
   * @param activityFields GX model to populate fields for Activity
   * @returns The ID of the newly created activity.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(BadIdentifierException, "if jobId, queueId, or activityPatternId do not exist.")
  @Throws(PermissionException, "if the caller does not have all of the following permissions: VIEW_JOB, CREATE_ACTIVITY.")
  @Throws(EntityStateException, "if there is an attempt to add an activity using an activity pattern that isn't available to the particular type of the given job.")
  function addActivityFromPatternAndAssignToQueue(jobId : String,
            activityPatternId : String,
            queueId : String,
            activityFields : gw.webservice.pc.pc700.gxmodel.activitymodel.types.complex.Activity) : String {
    var activity : Activity
    Transaction.runWithNewBundle(\ bundle -> {
      var queue = queueId != null ? PCBeanFinder.loadBeanByPublicID<AssignableQueue>(queueId, AssignableQueue) : null
      if (queue == null) {
        throw new BadIdentifierException(displaykey.JobAPI.Error.InvalidQueue(queueId))
      }
      activity = JobAPIImpl.createActivityFromPattern(jobId, activityPatternId, bundle)
      if(activityFields <> null){
        SimpleValuePopulator.populate(activityFields, activity)
      }
      activity.setUp(queue)
    })
    return activity.PublicID
  }

  /**
   * Adds an activity to a job using an activity pattern. First, attempts to generate an activity from the given
   * pattern. The new activity is initialized with the following fields from the activity pattern: Pattern, Type,
   * Subject, Description, Mandatory, Priority, Recurring, Command
   * <p/>
   * The activity's target date is calculated using the pattern's TargetStartPoint, TargetDays, TargetHours, and
   * TargetIncludeDays fields. The activity's escalation date is calculated using the pattern's EscalationStartPt,
   * EscalationDays, EscalationHours, and EscalationInclDays fields. If those fields aren't included in the activity
   * pattern, then the target and/or escalation date won't be set. If the target date is calculated to be after the
   * escalation date, then the target date is set to be the same as the escalation date.
   * <p/>
   * The activity's job ID is set to the given job ID.  The activity's previousUserID is set to the current user.
   * <p/>
   * The newly created activity is then assigned to a group and/or user using the Assignment Engine.  Finally, the
   * activity is saved in the database, and the ID of the newly created activity is returned.
   *
   * @param jobId The ID of the job with which the activity should be associated.
   * @param activityPatternId The ID of the activity pattern that is to be used for the activity.
   * @param activityFields GX model to populate fields for Activity
   * @returns The ID of the newly created activity.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(PermissionException, "if the caller does not have all of the following permissions: VIEW_JOB, CREATE_ACTIVITY.")
  function addActivityFromPatternAndAutoAssign(jobId : String,
            activityPatternId : String,
            activityFields : gw.webservice.pc.pc700.gxmodel.activitymodel.types.complex.Activity) : String {
    var activity : Activity
    Transaction.runWithNewBundle(\ bundle -> {
      activity = JobAPIImpl.createActivityFromPattern(jobId, activityPatternId, bundle)
      if(activityFields <> null){
        SimpleValuePopulator.populate(activityFields, activity)
      }
      activity.setUp(AutoAssignAssignee.INSTANCE)
    })
    return activity.PublicID
  }

  /**
   * Returns the ID of the job with <code>jobNumber</code> number,
   * or <code>null</code> if there is no job with that number.
   *
   * @param jobNumber Job number of the job to find.
   * @returns ID of the job or null
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function findJobPublicIdByJobNumber(jobNumber : String) : String {
    return JobAPIImpl.findJobPublicIdByJobNumber(jobNumber)
  }

  /**
   * Withdraws the given job if it exists and can be withdrawn.
   *
   * @param jobId The ID of the job to which to withdraw
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function withdrawJob(jobId : String) {
    Transaction.runWithNewBundle(\ bundle -> {
      var job = jobId != null ? PCBeanFinder.loadBeanByPublicID<Job>(jobId, Job) : null
      if (job == null) {
        throw new BadIdentifierException(displaykey.JobAPI.Error.InvalidJob(jobId))
      }
      job = bundle.add(job)
      job.withdraw()
    })
  }
}
