package gw.job.uw.comparators
uses java.math.BigDecimal

/**
 * A comparator wrapper with BigDecimal values, and where to be "in bounds", values must be smaller
 * than or equal to the reference value. In PC, this is used when greater numeric values imply
 * greater risk, such as for total premiums or number of employees.
 */
@Export
class NumericLEValueComparatorWrapper extends BigDecimalValueComparatorWrapper {

  construct(comparatorArg : ValueComparator) {
    super(comparatorArg)
  }

  override protected function doOffset(a : BigDecimal, b : BigDecimal) : BigDecimal {
    return a + b
  }

  override function compare(value : String, referenceValue : String) : boolean {
    return ValueType.deserialize(value) <= ValueType.deserialize(referenceValue)  
  }

  override function formatAsCondition(formattedValue : String) : String {
    return displaykey.UWIssue.ValueFormat.AtMost(formattedValue)
  }
}
