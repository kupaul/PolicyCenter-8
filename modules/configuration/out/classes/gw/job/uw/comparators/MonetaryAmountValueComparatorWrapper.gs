package gw.job.uw.comparators
uses gw.api.util.FXRateUtil
uses gw.job.uw.UWIssueValueComparatorWrapper
uses gw.job.uw.UWIssueValueType
uses gw.job.uw.types.UWIssueMonetaryAmountType
uses gw.pl.currency.MonetaryAmount

uses java.math.BigDecimal

/**
 * An abstract comparator wrapper for concrete wrappers using BigDecimal values.
 */
@Export
abstract class MonetaryAmountValueComparatorWrapper extends UWIssueValueComparatorWrapper {

  private static var VALUE_100 = "100.0" as BigDecimal

  construct(comparatorArg : ValueComparator) {
    super(comparatorArg, UWIssueValueType.MONETARY_AMOUNT)
  }

  override property get ValueType() : UWIssueMonetaryAmountType {
    return super.ValueType as UWIssueMonetaryAmountType
  }

  override function calculateDefaultApprovalValue(issueType : UWIssueType,
      issueValue : String) : String {
    if (issueValue == null) {
      return null
    }
    var value = ValueType.deserialize(issueValue)
    var scale = value.Amount.scale()
    var offsetAmount = issueType.DefaultValueOffsetAmount
    switch (issueType.DefaultValueAssignmentType) {
      case "OffsetAmount":
        var defaultValue = new MonetaryAmount(offsetAmount, issueType.DefaultValueOffsetCurrency)
        value = doOffsetFixed(value, convertDefaultValue(value.Currency, defaultValue))
        break
      case "OffsetPercent":
        var coefficient = doOffsetPercentage(VALUE_100, offsetAmount) / VALUE_100
        value = value * coefficient
        break
    }
    value = value.setScale(scale, HALF_EVEN)
    return ValueType.serialize(value)
  }

  /**
   * Change this method if you need to use different ways of converting the currencies.
   */
  private function convertDefaultValue(currency : Currency, defaultValue : MonetaryAmount) : MonetaryAmount {
    return FXRateUtil.convertAmount(defaultValue, currency)
  }

  override function getNonCurrencyDisplayString(value : String) : String {
    var val = ValueType.deserialize(value)
    return val.rescale().Amount.toString()
  }

  /**
   * Returns a DB friendly string based on the primary value provided and the previous string
   * Generally, the string provided will suffice, however, some need to derive the Currency from the
   * previous value and incorporate into the result
   */
  override function getValueString(value : String, previousValueString : String) : String {
    var previousValue = ValueType.deserialize(previousValueString)
    var newValue = new MonetaryAmount(value as BigDecimal, previousValue.Currency)
    return ValueType.serialize(newValue)
  }

  /**
   * Returns the currency, if any, associated with the Approval Value
   */
  override function getValueCurrency(value : String) : Currency {
    var val = ValueType.deserialize(value)
    return val.Currency
  }

  abstract protected function doOffsetFixed(a : MonetaryAmount, b : MonetaryAmount) : MonetaryAmount

  abstract protected function doOffsetPercentage(a : BigDecimal, b : BigDecimal) : BigDecimal


}