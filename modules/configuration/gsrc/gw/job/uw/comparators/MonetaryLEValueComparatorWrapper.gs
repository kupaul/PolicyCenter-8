package gw.job.uw.comparators

uses gw.api.util.FXRateUtil
uses gw.pl.currency.MonetaryAmount

uses java.math.BigDecimal

/**
 * A comparator wrapper with MonetaryAmount values, and where to be "in bounds", values must be smaller
 * than or equal to the reference value. In PC, this is used when greater numeric values imply
 * greater risk, such as for total premiums or number of employees.
 */
@Export
final class MonetaryLEValueComparatorWrapper extends MonetaryAmountValueComparatorWrapper {
  construct(comparatorArg : ValueComparator) {
    super(comparatorArg)
  }

  override final protected function doOffsetFixed(a : MonetaryAmount, b : MonetaryAmount) : MonetaryAmount {
    return a + b
  }

  override final protected function doOffsetPercentage(a : BigDecimal, b : BigDecimal) : BigDecimal {
    return a + b
  }

  override function compare(value : String, referenceValue : String) : boolean {
    var val = ValueType.deserialize(value)
    var ref = ValueType.deserialize(referenceValue)
    return (val.Currency == ref.Currency)
        ? val <= ref : FXRateUtil.convertAmount(val, ref.Currency) <= ref
  }

  override function formatAsCondition(formattedValue : String) : String {
    return displaykey.UWIssue.ValueFormat.AtMost(formattedValue)
  }
}