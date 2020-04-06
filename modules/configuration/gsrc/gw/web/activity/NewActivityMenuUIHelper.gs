package gw.web.activity

uses pcf.NewActivityWorksheet

@Export
class NewActivityMenuUIHelper {

  public static function createMenuItems(acc : Account, pol : Policy, period : PolicyPeriod) : gw.api.activity.ActivityPatternMenuCategory[] {
    if (acc != null) {
      return gw.api.activity.NewActivityMenuUtil.createMenuItems(Activity.finder.findAccountActivityPatterns())
    } else if (pol != null) {
      return gw.api.activity.NewActivityMenuUtil.createMenuItems(Activity.finder.findPolicyActivityPatterns())
    } else if (period != null) {
      return gw.api.activity.NewActivityMenuUtil.createMenuItems(Activity.finder.findJobActivityPatterns())
    }
    return null
  }

  public static function goInWorkspace(acc : Account, pol : Policy, period : PolicyPeriod, pattern : ActivityPattern) {
    if (acc != null) {
      NewActivityWorksheet.goInWorkspace(acc, pattern)
    } else if (pol != null) {
      NewActivityWorksheet.goInWorkspace(period, pol, pattern)
    } else if (period != null) {
      NewActivityWorksheet.goInWorkspace(period, pattern)
    }
  }

}
