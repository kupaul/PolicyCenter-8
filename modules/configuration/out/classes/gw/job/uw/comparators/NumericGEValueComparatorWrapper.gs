package gw.job.uw.comparators
uses java.math.BigDecimal

/**
 * A comparator wrapper with BigDecimal values, and where to be "in bounds", values must be at least
 * as large as the reference value. In PC, this is used when lower numeric values imply greater risk,
 * such as for deductibles.
 */
@Export
class NumericGEValueComparatorWrapper extends BigDecimalValueComparatorWrapper {

  construct(comparatorArg : ValueComparator) {
    super(comparatorArg)
  }

  override function compare(value : String, referenceValue : String) : boolean {
    return ValueType.deserialize(value) >= ValueType.deserialize(referenceValue)
  }

  override protected function doOffset(a : BigDecimal, b : BigDecimal) : BigDecimal {
    return a - b
  }

  override function formatAsCondition(formattedValue : String) : String {
    return displaykey.UWIssue.ValueFormat.AtLeast(formattedValue)
  }
}
