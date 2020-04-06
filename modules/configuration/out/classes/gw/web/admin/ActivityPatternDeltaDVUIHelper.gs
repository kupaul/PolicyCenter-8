package gw.web.admin

@Export
class ActivityPatternDeltaDVUIHelper {
  public static function getEmailDisplayName(templateFilename : String) : String {
    if (templateFilename == null) {
      return null
    }
    var ets = gw.plugin.Plugins.get(gw.plugin.email.IEmailTemplateSource)
    return ets.getEmailTemplate(templateFilename).getName()
  }

  public static function createEmailTemplateSearchCriteria(activityPattern : entity.ActivityPattern) : gw.api.email.EmailTemplateSearchCriteria {
    var rtn = new gw.api.email.EmailTemplateSearchCriteria()
    switch (activityPattern.PatternLevel) {
      case "Job" : rtn.AvailableSymbols = { "Job", "Policy", "PolicyPeriod", "Account", "Activity" }
          break
      case "Account" : rtn.AvailableSymbols = { "Account", "Activity" }
          break
        default : rtn.AvailableSymbols = { "Activity" }
    }
    return rtn
  }

  public static function createAvailSymbols(activityPattern : entity.ActivityPattern) : java.util.Set<String> {
    switch (activityPattern.PatternLevel) {
      case "Job" :
      case "All" :
          return { "Job", "Policy", "PolicyPeriod", "Account", "Activity" }
      case "Account" : return { "Account", "Activity" }
      case "Policy" : return {"Policy", "PolicyPeriod", "Activity"}
        default : return { "Activity" }
    }
  }
}