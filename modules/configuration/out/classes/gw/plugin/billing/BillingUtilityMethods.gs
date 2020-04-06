package gw.plugin.billing

uses gw.pl.currency.MonetaryAmount

uses java.math.RoundingMode
uses java.lang.SuppressWarnings
uses gw.api.system.PCLoggerCategory

@Export
abstract class BillingUtilityMethods {
  static function getNumberOfPayments(downPayment: MonetaryAmount, installment: MonetaryAmount, total: MonetaryAmount): int {
    if (total == null or downPayment == null or installment == null or installment.IsZero) {
      return 1
    }
    return total.subtract(downPayment).divide(installment, RoundingMode.CEILING).intValue()
  }

  @SuppressWarnings({"all"})
  public static function convertPaymentMethodToAccountPaymentMethod(paymentMethodValue : String) : AccountPaymentMethod {
    var accountPaymentMethod = AccountPaymentMethod.get(paymentMethodValue)

    if (accountPaymentMethod == null or accountPaymentMethod.Retired) {
      PCLoggerCategory.BILLING_SYSTEM_PLUGIN.error(displaykey.BillingSystemPlugin.Error.MismatchedPaymentMethod(paymentMethodValue))
      accountPaymentMethod = AccountPaymentMethod.TC_UNSUPPORTED
    }

    return accountPaymentMethod
  }
}