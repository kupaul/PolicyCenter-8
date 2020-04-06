package gw.webservice.pc.pc800.job

uses gw.api.assignment.AutoAssignAssignee
uses gw.api.assignment.UserAssignee
uses gw.api.web.job.JobAPIImpl
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.EntityStateException
uses gw.api.webservice.exception.PermissionException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.transaction.Transaction
uses gw.webservice.SOAPUtil
uses gw.webservice.pc.pc800.gxmodel.SimpleValuePopulator
uses gw.xml.ws.annotation.WsiWebService
uses gw.api.database.Relop
uses gw.api.database.Query
uses gw.api.database.PCBeanFinder
uses gw.xml.ws.annotation.WsiPermissions

@WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc800/job/JobAPI" )
@Export
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
   * @param jobId The public ID of the job with which the activity should be associated.
   * @param activityPatternId The public ID of the activity pattern that is to be used for the activity.
   * @param userId The public ID of the user to assign the activity to
   * @param groupId The public ID of a group the user belongs to for assignment.
   * @param activityFields GX model to populate fields for Activity
   * @returns The public ID of the newly created activity.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(PermissionException, "if the caller does not have all of the following permissions: VIEW_JOB, CREATE_ACTIVITY.")
  @Throws(EntityStateException, "if there is an attempt to add an activity using an activity pattern that isn't available to the particular type of the given job.")
  @Param("jobId", "The public ID of the job with which the activity should be associated.")
  @Param("activityPatternId", "The public ID of the activity pattern that is to be used for the activity.")
  @Param("userId", "The public ID of the user to assign the activity to")
  @Param("groupId", "The public ID of a group the user belongs to for assignment.")
  @Param("activityFields", "GX model to populate fields for Activity")
  @WsiPermissions({SystemPermissionType.TC_ACTCREATE, SystemPermissionType.TC_ACTRAUNOWN})
  @Returns("The public ID of the newly created Activity.")
  function addActivityFromPatternAndAssignToUser(jobId : String,
            activityPatternId : String,
            userId : String, 
            groupId : String, 
            activityFields : gw.webservice.pc.pc800.gxmodel.activitymodel.types.complex.Activity) : String {
    SOAPUtil.require(jobId, "jobId");
    SOAPUtil.require(activityPatternId, "activityPatternId");
    SOAPUtil.require(userId, "userId");
    SOAPUtil.require(groupId, "groupId");
    var activity : Activity
    Transaction.runWithNewBundle(\ bundle -> {
      var user = bundle.add(new Query<User>(User).compare("PublicId", Relop.Equals, userId).withDistinct(true).select().AtMostOneRow)
      var group = bundle.add(new Query<Group>(Group).compare("PublicId", Relop.Equals, groupId).withDistinct(true).select().AtMostOneRow)
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
   * @param jobId The public ID of the job with which the activity should be associated.
   * @param activityPatternId The public ID of the activity pattern that is to be used for the activity.
   * @param queueId the public ID of the queue to assign the activity to
   * @param activityFields GX model to populate fields for Activity
   * @returns The public ID of the newly created activity.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(BadIdentifierException, "if jobId, queueId, or activityPatternId do not exist.")
  @Throws(PermissionException, "if the caller does not have all of the following permissions: VIEW_JOB, CREATE_ACTIVITY.")
  @Throws(EntityStateException, "if there is an attempt to add an activity using an activity pattern that isn't available to the particular type of the given job.")
  @Param("jobId", "The public ID of the job with which the activity should be associated.")
  @Param("activityPatternId", "The public ID of the activity pattern that is to be used for the activity.")
  @Param("queueId", "The public ID of the queue to assign the activity to")
  @Param("activityFields", "GX model to populate fields for Activity")
  @WsiPermissions({SystemPermissionType.TC_ACTCREATE, SystemPermissionType.TC_ACTRAUNOWN})
  @Returns("The public ID of the newly created Activity.")
  function addActivityFromPatternAndAssignToQueue(jobId : String, 
            activityPatternId : String, 
            queueId : String, 
            activityFields : gw.webservice.pc.pc800.gxmodel.activitymodel.types.complex.Activity) : String {
    SOAPUtil.require(jobId, "jobId");
    SOAPUtil.require(activityPatternId, "activityPatternId");
    SOAPUtil.require(queueId, "queueId");
    var activity : Activity
    Transaction.runWithNewBundle(\ bundle -> {
      var queue = PCBeanFinder.loadBeanByPublicID<AssignableQueue>(queueId, AssignableQueue)
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
   * @param jobId The public ID of the job with which the activity should be associated.
   * @param activityPatternId The public ID of the activity pattern that is to be used for the activity.
   * @param activityFields GX model to populate fields for Activity
   * @returns The public ID of the newly created activity.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(PermissionException, "if the caller does not have all of the following permissions: VIEW_JOB, CREATE_ACTIVITY.")
  @Param("jobId", "The public ID of the job with which the activity should be associated.")
  @Param("activityPatternId", "The public ID of the activity pattern that is to be used for the activity.")
  @Param("activityFields", "GX model to populate fields for Activity")
  @WsiPermissions({SystemPermissionType.TC_ACTCREATE, SystemPermissionType.TC_ACTRAUNOWN})
  @Returns("The public ID of the newly created Activity.")
  function addActivityFromPatternAndAutoAssign(jobId : String, 
            activityPatternId : String, 
            activityFields : gw.webservice.pc.pc800.gxmodel.activitymodel.types.complex.Activity) : String {
    SOAPUtil.require(jobId, "jobId");
    SOAPUtil.require(activityPatternId, "activityPatternId");
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
   * Returns the public ID of the job with <code>jobNumber</code> number,
   * or <code>null</code> if there is no job with that number.
   * 
   * @param jobNumber Job number of the job to find.
   * @returns public ID of the job, or null if the job was not found.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("jobNumber", "Job number of the job to find")
  @WsiPermissions({SystemPermissionType.TC_SEARCHPOLS})
  @Returns("public ID of the found job, or null if the job was not found")
  function findJobPublicIdByJobNumber(jobNumber : String) : String {
    SOAPUtil.require(jobNumber, "jobNumber");
    return JobAPIImpl.findJobPublicIdByJobNumber(jobNumber)
  }

  /**
   * Withdraws the given job if it exists and can be withdrawn. 
   * 
   * @param jobId The public ID of the job to withdraw
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("jobId", "The public ID of the job to withdraw")
  @WsiPermissions({SystemPermissionType.TC_WITHDRAW})
  function withdrawJob(jobId : String) {
    SOAPUtil.require(jobId, "jobId");
    Transaction.runWithNewBundle(\ bundle -> {
      var job = PCBeanFinder.loadBeanByPublicID<Job>(jobId, Job)
      if (job == null) {
        throw new BadIdentifierException(displaykey.JobAPI.Error.InvalidJob(jobId))
      }    
      job = bundle.add(job)
      job.withdraw()
    })
  }
}