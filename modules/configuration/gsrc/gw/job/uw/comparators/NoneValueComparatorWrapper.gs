package gw.job.uw.comparators
uses gw.job.uw.UWIssueValueType
uses gw.job.uw.UWIssueValueComparatorWrapper

/**
 * A comparator wrapper for unvalued issue types.
 */
@Export
class NoneValueComparatorWrapper extends UWIssueValueComparatorWrapper {

  construct(comparatorArg : ValueComparator) {
    super(comparatorArg, UWIssueValueType.NO_VALUE)
  }

  override function compare(value : String, referenceValue : String) : boolean {
    if (value == null and referenceValue == null) {
      return true
    }
    throw "Compare should should only be called for the 'None' comparison type when grant and issue values are null."
  }

  override function formatAsCondition(formattedValue : String) : String {
    return ""
  }
}
