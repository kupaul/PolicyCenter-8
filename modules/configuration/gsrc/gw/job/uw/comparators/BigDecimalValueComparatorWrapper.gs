package gw.job.uw.comparators
uses gw.job.uw.UWIssueValueComparatorWrapper
uses gw.job.uw.UWIssueValueType
uses java.math.BigDecimal
uses gw.job.uw.types.UWIssueBigDecimalType

/**
 * An abstract comparator wrapper for concrete wrappers using BigDecimal values.
 */
@Export
abstract class BigDecimalValueComparatorWrapper extends UWIssueValueComparatorWrapper {

  private static var VALUE_100 = "100.0" as BigDecimal
  
  construct(comparatorArg : ValueComparator) {
    super(comparatorArg, UWIssueValueType.BIG_DECIMAL)
  }

  override property get ValueType() : UWIssueBigDecimalType {
    return super.ValueType as UWIssueBigDecimalType
  }

  override function calculateDefaultApprovalValue(issueType : UWIssueType,
      issueValue : String) : String {
    if (issueValue == null) {
      return null
    }
    var value = ValueType.deserialize(issueValue)
    var scale = value.scale()
    var offsetAmount = issueType.DefaultValueOffsetAmount
    switch (issueType.DefaultValueAssignmentType) {
      case "OffsetAmount":
        value = doOffset(value, offsetAmount)
        break
      case "OffsetPercent":
        var coefficient = doOffset(VALUE_100, offsetAmount) / VALUE_100
        value = value * coefficient
        break
    }
    value = value.setScale(scale, BigDecimal.ROUND_HALF_EVEN)
    return ValueType.serialize(value)
  }
  
  abstract protected function doOffset(a : BigDecimal, b : BigDecimal) : BigDecimal

}
