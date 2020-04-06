package gw.web.billing

uses java.lang.IllegalStateException
uses java.lang.SuppressWarnings

@Export
class PaymentInstrumentUIHelper {

  static function checkForError(jobNumber : String, jobToFind : Job) : String{
    if (jobNumber == null)
      return displaykey.Web.Errors.MissingUrlParameter("JobNumber")
    if (jobToFind == null)
      return displaykey.Web.Errors.InvalidUrlParameter("JobNumber", jobNumber)
    if (not User.util.CurrentUser.canView( jobToFind ))
      return displaykey.Java.Error.Permission.View("job")
    return null
  }

  /**
   * @deprecated Deprecated in PC 8.0.2. Use PolicyPeriod#createPaymentInstrument instead.
   */
  @SuppressWarnings({"all"})
  @Deprecated("PC8.0.2 Deprecated in PC 8.0.2. Use PolicyPeriod#createPaymentInstrument instead.")
  function createPaymentInstrument(jobToFind : Job, paymentMethod : String, token : String) {
    if (paymentMethod != null) {
      if (paymentMethod == AccountPaymentMethod.TC_UNSUPPORTED) {
        throw new IllegalStateException(displaykey.BillingSystemPlugin.Error.UnsupportedPaymentMethod)
      }
      var plugin = gw.plugin.Plugins.get(gw.plugin.billing.IBillingSystemPlugin)
      var paymentInstrument = new gw.plugin.billing.BillingPaymentInstrumentImpl()
      paymentInstrument.PaymentMethod = paymentMethod
      paymentInstrument.Token = token
      var accountNumber = jobToFind.Policy.Account.AccountNumber
      plugin.addPaymentInstrumentTo(accountNumber, jobToFind.Periods.first()?.PreferredSettlementCurrency, paymentInstrument)
    }
  }
}