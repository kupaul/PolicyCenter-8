package gw.job.uw

uses java.util.Date

enhancement UWIssueHistoryEnhancement : UWIssueHistory {

  property get CreateDate() : Date {
    return CreateTimeOrNow.trimToMidnight()
  }
  
  property get CreateTimeOrNow() : Date {
    var time = this.CreateTime
    return time == null
        ? Date.CurrentDate
        : time
  }

  function InvalidFrom() : String {
    var date = this.ApprovalInvalidFrom
    return date == null ? this.ApprovalDurationType.DisplayName : date.ShortFormat
  }

  property get FormattedReferenceValue() : String {
    switch (this.Status) {
      case "Created":
        return this.IssueType.formatValue(this.ReferenceValue)
      case "Approved":
        return this.IssueType.formatValueAsCondition(this.ReferenceValue)
      case "ChangeEffDate":
        return this.IssueType.formatValueAsCondition(this.ReferenceValue)
      default:
        return ""
    }
  }
}
