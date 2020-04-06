package gw.product

/**
 * A customer modifiable utility class for divide policy actions.
 */
@Export
class DividePolicyUtil {

  public static var MAYBE_CANCEL_CODE : String = "maybe_cancel_split_policy"
  
  /**
   * Create an activity suggesting that a split policy should be cancelled.
   */
  static function createSplitPolicyActivity(sourcePolicy : PolicyPeriod) : Activity {
    var periodNumber = sourcePolicy.PolicyNumber
    var splitActivityTitle = displaykey.Job.DividePolicy.Split.Activity.Subject(periodNumber)
    var splitActivityDescription = displaykey.Job.DividePolicy.Split.Activity.Description(periodNumber)
          
    var activityPattern = ActivityPattern.finder.getActivityPatternByCode(MAYBE_CANCEL_CODE)
    var activity : Activity = null
    activity = activityPattern.createPolicyActivity(sourcePolicy.Bundle, sourcePolicy.Policy, splitActivityTitle, splitActivityDescription, null, null, null, null, null)
    activity.assignUserAndDefaultGroup(User.util.CurrentUser)
    return activity
  }

}
