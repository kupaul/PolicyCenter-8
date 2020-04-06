package gw.job.uw.comparators

uses gw.api.util.FXRateUtil
uses gw.pl.currency.MonetaryAmount

uses java.math.BigDecimal

/**
 * A comparator wrapper with Monetary values, and where to be "in bounds", values must be at least
 * as large as the reference value. In PC, this is used when lower numeric values imply greater risk,
 * such as for deductibles.
 */
@Export
final class MonetaryGEValueComparatorWrapper extends MonetaryAmountValueComparatorWrapper {
  construct(comparatorArg : ValueComparator) {
    super(comparatorArg)
  }

  override function compare(value : String, referenceValue : String) : boolean {
    var val = ValueType.deserialize(value)
    var ref = ValueType.deserialize(referenceValue)
    return (val.Currency == ref.Currency)
      ? val >= ref : FXRateUtil.convertAmount(val, ref.Currency) >= ref
  }

  override final protected function doOffsetFixed(a : MonetaryAmount, b : MonetaryAmount) : MonetaryAmount {
    return a - b
  }

  override final protected function doOffsetPercentage(a : BigDecimal, b : BigDecimal) : BigDecimal {
    return a - b
  }

  override function formatAsCondition(formattedValue : String) : String {
    return displaykey.UWIssue.ValueFormat.AtLeast(formattedValue)
  }
}