package gw.web.policy
uses java.util.LinkedHashMap
uses java.util.Map

@Export
class UWReferralReasonsModalRowOrganizer extends ModalRowOrganizer<UWReferralReasonStatus, UWReferralReasonModalRow> {

  static function organize(reasons : UWReferralReason[]) : UWReferralReasonModalRow[] {
    var authProfiles = User.util.CurrentUser.UWAuthorityProfiles
    var modalRows = reasons.map(\ reason -> 
        new UWReferralReasonModalRow() { 
            :Item = reason,
            :UserCanApproveIssue = reason.canBeApprovedBy(authProfiles),
            :UserCanApproveAllIssues = perm.System.uwapproveall
        })
    return new UWReferralReasonsModalRowOrganizer(modalRows).createWrappers()
  }
  
  var _sectionTitles : Map<UWReferralReasonStatus, String>

  construct(reasons : UWReferralReasonModalRow[]) {
    this(reasons, createSectionTitleMap())
  }
  
  construct(reasons : UWReferralReasonModalRow[], sectionTitlesArg : Map<UWReferralReasonStatus, String>) {
    super(sectionTitlesArg.Keys, reasons)
    _sectionTitles = sectionTitlesArg
  }
  
  override function categoryForItem(row : UWReferralReasonModalRow) : UWReferralReasonStatus {
    return row.Item.Status
  }

  override function createTitleRow(category : UWReferralReasonStatus) : UWReferralReasonModalRow {
    return new UWReferralReasonModalRow() {:Title = _sectionTitles[category]}
  }
  
  override function sortRowsWithinCategory(list : List<UWReferralReasonModalRow>) : List<UWReferralReasonModalRow> {
    return list.orderBy(\ x -> x.Item.IssueType.Code).thenBy(\ x -> x.Item.IssueKey)
  }

  private static function createSectionTitleMap() : Map<UWReferralReasonStatus, String> {
    return new LinkedHashMap<UWReferralReasonStatus, String>() {
            UWReferralReasonStatus.TC_OPEN -> displaykey.Web.UWReferralReasonLV.OpenReferralReasonsCategoryTitle,
            UWReferralReasonStatus.TC_CLOSED -> displaykey.Web.UWReferralReasonLV.ClosedReferralReasonsCategoryTitle
        }
  }
}
