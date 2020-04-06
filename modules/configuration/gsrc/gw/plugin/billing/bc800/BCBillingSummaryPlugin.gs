package gw.plugin.billing.bc800

uses gw.api.util.DisplayableException
uses gw.plugin.billing.BillingAccountInfo
uses gw.plugin.billing.BillingInvoiceInfo
uses gw.plugin.billing.BillingPeriodInfo
uses gw.plugin.billing.BillingPeriodInfo
uses gw.plugin.billing.IBillingSummaryPlugin
uses java.lang.Exception
uses wsi.remote.gw.webservice.bc.bc800.billingsummaryapi.BillingSummaryAPI
uses wsi.remote.gw.webservice.bc.bc800.billingsummaryapi.faults.BadIdentifierException
uses gw.api.util.LocaleUtil

@Export
class BCBillingSummaryPlugin implements IBillingSummaryPlugin {
  var logger = gw.api.system.PCLoggerCategory.BILLING_SUMMARY_PLUGIN

  construct() {
  }

  protected function callWebService<T>(call : block(api : BillingSummaryAPI) : T) : T {
    var api = new BillingSummaryAPI()
    try {
      api.Config.Guidewire.Locale = LocaleUtil.CurrentLanguage.Code
      return call(api)
    } catch (e : BadIdentifierException) {
      logger.error(e)
      return null
    } catch (e : Exception) {
      logger.error("Server exception was encountered during retrieval of the billing summary", e)
      throw new DisplayableException(displaykey.Web.AccountBilling.Error.GeneralException(e.LocalizedMessage))
    }
  }

  override function retrieveAccountBillingSummaries(accountNumber: String) : BillingAccountInfo[] {
    var bcSummary = callWebService(\ api -> {
      return api.retrieveAccountBillingSummary(accountNumber)
    })

    if (bcSummary == null) {
      throw new DisplayableException(displaykey.Web.AccountBilling.Error.AccountNotFound)
    }

    return bcSummary.map(\ s -> new BCAccountBillingSummaryWrapper(s))
  }

  override function retrievePolicyBillingSummary(policyNumber : String, termNumber : int) : BillingPeriodInfo {
    var bcSummary = callWebService(\ api -> {
      return api.retrievePolicyBillingSummary(policyNumber, termNumber)
    })

    if (bcSummary == null) {
      throw new DisplayableException(displaykey.Web.AccountBilling.Error.PolicyNotFound)
    }
    return new BCPolicyBillingSummaryWrapper(bcSummary, policyNumber, termNumber)
  }

  override function retrieveBillingPolicies(accountNumber: String) : BillingPeriodInfo[] {
    var periodInfos = callWebService(\ api -> {
      return api.retrievePeriodsForAccount(accountNumber)
    })

    if (periodInfos == null) {
      throw new DisplayableException(displaykey.Web.AccountBilling.Error.AccountNotFound)
    }

    return periodInfos.map(\ periodInfo -> new BCDisplayablePolicyPeriodWrapper(periodInfo))
  }


  override function retrieveAccountInvoices(accountNumber: String) : BillingInvoiceInfo[] {
    var invoices = callWebService(\ api -> {
      return api.retrieveInvoicesForAccount(accountNumber)
    })
    if (invoices == null) {
      throw new DisplayableException(displaykey.Web.AccountBilling.Error.AccountNotFound)
    }
    return invoices.map(\ p -> new BCInvoiceInfoWrapper(p))
  }

  override function getPoliciesBilledToAccount(accountNumber : String) : BillingPeriodInfo [] {
    var periodInfos = callWebService(\ api -> {
      return api.retrievePeriodsBilledToAccount(accountNumber)
    })
    if (periodInfos == null) {
      throw new DisplayableException(displaykey.Web.AccountBilling.Error.AccountNotFound)
    }
    return periodInfos.map(\ periodInfo -> new BCDisplayablePolicyPeriodWrapper(periodInfo))
  }

}
