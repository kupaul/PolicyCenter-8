package gw.job.uw

@Export
class UWIssueApprovalUtil {

  static function throughValue(bp : UWIssueBlockingPoint) : String {
    switch (bp) {
      case "BlocksQuoteRelease" : return displaykey.Web.UWIssue.ThroughValue.Quote
      case "BlocksBind" : return displaykey.Web.UWIssue.ThroughValue.QuoteRelease
      case "BlocksIssuance" : return displaykey.Web.UWIssue.ThroughValue.Bind
      case "NonBlocking" : return displaykey.Web.UWIssue.ThroughValue.Issuance
      default : return null
    }
  }

  //
  // PRIVATE CONSTRUCTOR
  //
  private construct() {}
}
