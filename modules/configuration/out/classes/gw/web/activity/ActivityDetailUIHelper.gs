package gw.web.activity

uses pcf.NewActivityWorksheet
uses java.util.Map

@Export
class ActivityDetailUIHelper {

  public static function completeActivity(activity : Activity, note : Note, policyPeriod : PolicyPeriod, CurrentLocation : pcf.api.Location) {
    gw.api.web.activity.ActivityUtil.completeActivity(activity, note)
    gw.api.web.workspace.WorkspaceUtil.closeWorksheetIfActiveAndRefreshTop(CurrentLocation)
    if(activity.PolicyPeriod == null and policyPeriod == null) {
      NewActivityWorksheet.goInWorkspace(activity.Account, activity.ActivityPattern)
    } else if (activity.PolicyPeriod != null) {
      NewActivityWorksheet.goInWorkspace(activity.PolicyPeriod, activity.ActivityPattern)
    } else if (policyPeriod != null) {
      NewActivityWorksheet.goInWorkspace(policyPeriod, activity.ActivityPattern)
    }
  }
}