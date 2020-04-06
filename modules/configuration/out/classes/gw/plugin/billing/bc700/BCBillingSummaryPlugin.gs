package gw.plugin.billing.bc700

uses gw.api.util.DisplayableException
uses gw.plugin.billing.BillingAccountInfo
uses gw.plugin.billing.BillingInvoiceInfo
uses gw.plugin.billing.BillingPeriodInfo
uses gw.plugin.billing.BillingPeriodInfo
uses gw.plugin.billing.IBillingSummaryPlugin
uses java.lang.Exception
uses wsi.remote.gw.webservice.bc.bc700.billingsummaryapi.BillingSummaryAPI
uses wsi.remote.gw.webservice.bc.bc700.billingsummaryapi.faults.BadIdentifierException
uses gw.xsd.guidewire.soapheaders.Locale

@Export
class BCBillingSummaryPlugin implements IBillingSummaryPlugin {
  var logger = gw.api.system.PCLoggerCategory.BILLING_SUMMARY_PLUGIN

  construct() {
  }
  
  protected function callWebService<T>(call : block(api : BillingSummaryAPI) : T) : T {
    var api = new BillingSummaryAPI()
    try {
      if (User.util.CurrentUser.Language != null) {
        api.Config.RequestSoapHeaders.add(new Locale() { : $Text = User.util.CurrentUser.Language.Code })
      }
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

    return { new BCAccountBillingSummaryWrapper(bcSummary) }
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
