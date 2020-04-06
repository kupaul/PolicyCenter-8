package gw.web.billing


uses gw.api.web.WebUtil
uses pcf.CreatePaymentInstrument

@Export
class BillingInvoiceStreamUIHelper {

  static function getAvailablePaymentInstruments(policyPeriod : PolicyPeriod) : gw.plugin.billing.BillingPaymentInstrument[]{
    try{
      return policyPeriod.AvailablePaymentInstruments.where(\ b -> b.PaymentMethod == TC_ACH || b.PaymentMethod == TC_CREDITCARD)
    }catch(e : java.lang.Exception){
      e.printStackTrace()
      gw.api.util.LocationUtil.addRequestScopedErrorMessage(displaykey.Web.BillingAdjustmentsDV.Error.RetrievePaymentInstruments)
      return {}
    }
  }

  static function isPaymentDateVisible(interval : BillingPeriodicity) : boolean{
    return not (isDayOfWeekVisible(interval) or isFirstDayOfMonthVisible(interval))
  }

  static function isDayOfWeekVisible(interval : BillingPeriodicity) : boolean{
    return interval == BillingPeriodicity.TC_EVERYWEEK
  }

  static function isSecondDayOfMonthVisible(interval : BillingPeriodicity) : boolean{
    return interval == BillingPeriodicity.TC_TWICEPERMONTH
  }

  static function isFirstDayOfMonthVisible(interval : BillingPeriodicity) : boolean{
    return interval == BillingPeriodicity.TC_MONTHLY or interval == BillingPeriodicity.TC_TWICEPERMONTH
  }

  static function externalPaymentLocation(policyPeriod : PolicyPeriod) : pcf.api.Location {
    var accountHolderName = policyPeriod.BillingContact.DisplayName
    var address = policyPeriod.BillingContact.AccountContactRole.AccountContact.Contact.PrimaryAddress

    var add1 = address.AddressLine1
    var add2 = address.AddressLine2
    var city = address.City
    var state = address.State.Code
    var zip = address.PostalCode

    //For the simple demo setup, the demo payment system runs alongside PolicyCenter on the same server, using the config.xml PaymentSystemURL parameter
    //Normally the the payment system would be on a separate physical computer from PolicyCenter.
    var baseURL = WebUtil.ResourcesPath.remove("/" + WebUtil.ResourcesDir)
    while (baseURL.endsWith("/")) {
      baseURL = baseURL.substring(0, baseURL.length - 1)
    }

    var paymentURL = baseURL //gw.api.system.PCConfigParameters.PaymentSystemURL.Value

    //For a real-world customer environment, CHANGE THE RETURN URL to the PolicyCenter URL that is commented out on the next line:
    var returnURL = baseURL //gw.plugin.Plugins.get(gw.plugin.webconfig.IPolicyCenterWebConfigPlugin).PolicyCenterURL

    return CreatePaymentInstrument.push(paymentURL, returnURL, policyPeriod.Job.JobNumber, accountHolderName, add1, add2, city, state, zip)
  }
}