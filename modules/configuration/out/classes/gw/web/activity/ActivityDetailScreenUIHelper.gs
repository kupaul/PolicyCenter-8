package gw.web.activity

uses pcf.AccountFile_Notes
uses pcf.PolicyFileForward
uses pcf.ActivityNotesPopup
uses java.util.Map

@Export
class ActivityDetailScreenUIHelper {

  /**
   * Show all notes that are related to this activity. This method will handle viewing notes
   * from the account, policy, and job
   */
  public static function viewActivityNotes(activity : entity.Activity, policyPeriod : entity.PolicyPeriod) {
    if (activity.PolicyPeriod != null and activity.Job != null) {
      ActivityNotesPopup.push(activity, activity.PolicyPeriod)
    } else if (activity.Policy != null) {
      PolicyFileForward.goInMain(policyPeriod, null, "PolicyNotes for Activity", {activity})
    } else if (activity.Account != null) {
      AccountFile_Notes.goInMain(activity.Account, activity)
    }
  }

  public static function getDocContainer(actv : Activity) : gw.api.domain.document.DocumentContainer {
    if (actv.PolicyPeriod != null) {
      return actv.PolicyPeriod
    }
    else if (actv.Job != null) {
      return actv.Job
    }
    else if (actv.Account != null) {
        return actv.Account
      }
    return null
  }

  public static function createSearchCriteria(symbolTable : Map<String, Object>) : NoteTemplateSearchCriteria {
    var rtn = new NoteTemplateSearchCriteria()
    // rtn.Language = Account.AccountHolder.Language
    rtn.AvailableSymbols = symbolTable.Keys.join( "," )
    if ((symbolTable.get("policy") as Policy).Product != null) {
      rtn.LOB = (symbolTable.get("policy") as Policy).Product.Code
    }
    return rtn
  }
}