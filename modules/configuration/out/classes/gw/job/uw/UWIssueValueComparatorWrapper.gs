package gw.job.uw

uses gw.job.uw.comparators.AnyValueComparatorWrapper
uses gw.job.uw.comparators.MonetaryGEValueComparatorWrapper
uses gw.job.uw.comparators.MonetaryLEValueComparatorWrapper
uses gw.job.uw.comparators.NumericGEValueComparatorWrapper
uses gw.job.uw.comparators.NumericLEValueComparatorWrapper
uses gw.job.uw.comparators.NoneValueComparatorWrapper
uses gw.job.uw.comparators.StateSetValueComparatorWrapper

uses java.math.BigDecimal
uses java.util.LinkedHashMap

@Export
abstract class UWIssueValueComparatorWrapper {

  // Map from ValueComparator typekeys to wrappers.
  // N.B. The instantiation of this map must textually precede the instantiation of
  // the wrappers below.
  static var _wrappedTypes = new LinkedHashMap<ValueComparator, UWIssueValueComparatorWrapper>()

  // The wrappers for the various OOTB ValueComparators

  static final var _ge : UWIssueValueComparatorWrapper as readonly NumericGEWrapper
      = new NumericGEValueComparatorWrapper("Numeric_GE")
  static final var _le : UWIssueValueComparatorWrapper as readonly NumericLEWrapper
      = new NumericLEValueComparatorWrapper("Numeric_LE")
  static final var _mge : UWIssueValueComparatorWrapper as readonly MonetaryGEWrapper
      = new MonetaryGEValueComparatorWrapper("Monetary_GE")
  static final var _mle : UWIssueValueComparatorWrapper as readonly MonetaryLEWrapper
      = new MonetaryLEValueComparatorWrapper("Monetary_LE")
  static final var _any : UWIssueValueComparatorWrapper as readonly AnyWrapper
      = new AnyValueComparatorWrapper("Any")
  static final var _none : UWIssueValueComparatorWrapper as readonly NoneWrapper
      = new NoneValueComparatorWrapper("None")
  static final var _stateSet : UWIssueValueComparatorWrapper as readonly StateSetWrapper
      = new StateSetValueComparatorWrapper("State_Set")

  /**
   * Finds the UWIssueValueComparatorWrapper associated with the given ValueComparator typekey.
   */
  static function wrap(comparisonType : ValueComparator) : UWIssueValueComparatorWrapper {
    var wrappedType = _wrappedTypes.get(comparisonType)
    if (wrappedType == null) {
      throw "No wrapper type was specified for comparison type ${comparisonType}"
    }
    return wrappedType
  }

  // Instance-specific function and members.

  var _comparisonType : ValueComparator as readonly ComparisonType
  var _valueType : UWIssueValueType as readonly ValueType

  construct(comparisonTypeArg : ValueComparator, valueTypeArg : UWIssueValueType) {
    _comparisonType = comparisonTypeArg
    _valueType = valueTypeArg
    _wrappedTypes.put(comparisonTypeArg, this)
  }

  /**
   * Compares the two values, using the value type to deserialize them if necessary, and return true
   * if the value is within the bounds of the referenceValue, according to the rules of the specific wrapper.
   *
   * <p>Typically, we compare either
   * (a) an issue value against an approval value (to see if an approval is currently effective), or
   * (b) an approval value against a grant value (to see if the user can grant this approval)
   *
   * @param value the value from the UWIssue (or UWAIssueApproval)
   * @param referenceValue the value from the UWAIssueApproval (or UWAuthorityGrant)
   * @return true if value is within the bounds of the referenceValue, as defined by this comparator wrapper.
   */
  abstract function compare(value : String, referenceValue : String) : boolean

  /**
   * Returns a UI friendly string for the value provided
   */
  function getNonCurrencyDisplayString(value : String) : String {
    return value
  }

  /**
   * Returns a DB friendly string based on the primary value provided and the previous string
   * Generally, the string provided will suffice, however, some need to derive the Currency from the
   * previous value and incorporate into the result
   */
  function getValueString(value : String, previousValueString : String) : String {
    return value
  }

  /**
   * Returns the currency, if any, associated with the Approval Value
   */
  function getValueCurrency(value : String) : Currency {
    return null
  }

  /**
   * Formats the already-formatted value for display as a limit.
   * <p> For example, the NumericLE might format "$13.50" as "At most $13.50".
   */
  abstract function formatAsCondition(formattedValue : String) : String

  /**
   * @Return a default approval value
   */
  function calculateDefaultApprovalValue(issueType : UWIssueType, issueValue : String) : String {
    return issueValue  //default implementation. Wrapper subclasses can override.
  }
}
