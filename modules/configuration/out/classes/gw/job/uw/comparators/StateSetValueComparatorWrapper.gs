package gw.job.uw.comparators
uses gw.job.uw.UWIssueValueType
uses gw.job.uw.UWIssueValueComparatorWrapper
uses java.lang.IllegalArgumentException

/**
 * A comparator wrapper to determine whether a set is within a set of states, or is *not*
 * within a given set of states (if "not" is specified.
 *
 * <p>Note that this comparator wrapper requires that the value be a StateSet containing a
 * single value, although the referenceValue can be any valid StateSet.
 */
@Export
class StateSetValueComparatorWrapper extends UWIssueValueComparatorWrapper {

  construct(comparatorArg : ValueComparator) {
    super(comparatorArg, UWIssueValueType.STATE_SET)
  }

  override function compare(value : String, referenceValue : String) : boolean {
    var valueStateSet = UWIssueValueType.STATE_SET.deserialize(value)
    if (valueStateSet.Values.Count != 1 or valueStateSet.Exclusive) {
      throw new IllegalArgumentException("Issue values compared via the State_Set comparator must have exactly one State as their value")
    }
    var grantValues = UWIssueValueType.STATE_SET.deserialize(referenceValue)
    return grantValues.contains(valueStateSet.Values.first())
  }

  override function formatAsCondition(formattedValue : String) : String {
    return formattedValue
  }
}
