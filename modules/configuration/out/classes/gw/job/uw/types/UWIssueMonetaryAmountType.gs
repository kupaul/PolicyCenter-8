package gw.job.uw.types

uses gw.job.uw.UWIssueValueType
uses gw.pl.currency.MonetaryAmount

uses java.math.BigDecimal
uses java.lang.IllegalArgumentException
uses java.lang.NumberFormatException

@Export
class UWIssueMonetaryAmountType implements UWIssueValueType {

  override function deserialize(value : String) : MonetaryAmount {
    return value == null ? null : new MonetaryAmount(value)
  }
  
  override function serialize(obj : Object) : String {
    var value = obj as MonetaryAmount
    return value == null ? null : value.toString()
  }

  override function validate(value : String) : String {
    try {
      deserialize(value)
      return null
    } catch (e : NumberFormatException) {
      return displaykey.UWIssue.MonetaryAmountType.InvalidMonetaryAmount(value)
    } catch (e : IllegalArgumentException) {
      if (e.Message != null and e.Message.equals("Currency cannot be null.")) {
        return displaykey.UWIssue.MonetaryAmountType.InvalidCurrency(value)
      }
      return displaykey.UWIssue.MonetaryAmountType.InvalidMonetaryAmount(value)
    }
  }
}
