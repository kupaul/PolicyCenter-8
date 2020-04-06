package gw.job.uw

enhancement UWIssueTypeEnhancement : entity.UWIssueType {

  /**
   * Compute a default approval value based on an issue value
   */
  function calculateDefaultValue(issueValue : String) : String {
    return ComparatorWrapper.calculateDefaultApprovalValue(this, issueValue)
  }

  property get ComparatorWrapper() : UWIssueValueComparatorWrapper {
    return UWIssueValueComparatorWrapper.wrap(this.Comparator)
  }

  function formatValue(value : String) : String {
    var formatter = ValueFormatter.forType(this.ValueFormatterType)
    return formatter.format(value)
  }
  
  function formatValueAsCondition(value : String) : String {
    var formatter = ValueFormatter.forType(this.ValueFormatterType)
    var comparator = UWIssueValueComparatorWrapper.wrap(this.Comparator)
    return comparator.formatAsCondition(formatter.format(value))
  }
}
