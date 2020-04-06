package gw.web.policy

uses gw.api.database.Query
uses gw.api.system.PCLoggerCategory
uses gw.api.util.LocaleUtil
uses gw.api.util.LocationUtil
uses gw.api.web.PebblesUtil
uses gw.plugin.billing.BillingInvoiceStreamInfo
uses gw.plugin.billing.BillingUnappliedFundInfo
uses gw.plugin.billing.InstallmentPlanData
uses gw.plugin.billing.PaymentPlanData
uses gw.plugin.billing.ReportingPlanData
uses pcf.BillingAdjustmentPreviewPaymentsPopup
uses pcf.api.Location

uses java.lang.Exception

@Export
class BillingAdjustmentsUIHelper {
  private static var KANJI_LOCALES = {LocaleType.TC_JA_JP}

  var _location: Location
  var _policyPeriod: PolicyPeriod as PolicyPeriod
  var _newInvoicing: boolean as NewInvoicing
  var _newUnappliedFund: boolean as NewUnappliedFund
  var _installmentsPlans: InstallmentPlanData[] as InstallmentPlans
  var _reportingPlans: ReportingPlanData[] as ReportingPlans
  var _selectedReportingPlan: ReportingPlanData as SelectedReportingPlan
  var _paymentMethodChoice: PaymentMethod as PaymentMethodChoice
  var _invoiceStreams: BillingInvoiceStreamInfo[] as InvoiceStreams
  var _unappliedFunds: BillingUnappliedFundInfo[] as UnappliedFunds

  construct(location: Location, policyPeriod: PolicyPeriod) {
    _location = location
    _policyPeriod = policyPeriod

    setLocalVariablesFromPolicyPeriod()
  }

  static function showKanjiFields(): boolean {
    return KANJI_LOCALES.contains(LocaleUtil.getCurrentUserLocale())
  }

  property get AvailableBillingMethods(): BillingMethod[] {
    try {
      var supportedMethods = _policyPeriod.AvailableBillingMethods
      if (supportedMethods.Count == 1) {
        _policyPeriod.BillingMethod = supportedMethods.first()
      }
      return supportedMethods
    } catch (e: Exception) {
      LocationUtil.addRequestScopedErrorMessage(displaykey.Web.BillingAdjustmentsDV.Error.RetrieveBillingMethods)
      PCLoggerCategory.BILLING_SYSTEM_PLUGIN.error(e)
      _policyPeriod.BillingMethod = null
      return new BillingMethod[0]
    }
  }

  property get InitialPaymentMethodChoice(): PaymentMethod {
    if (_policyPeriod.BillingMethod == TC_LISTBILL and _policyPeriod.AltBillingAccountNumber == null) {
      // For List Bill, payment method option is available only if alt billing account is selected.
      // By default, if no alt account is selected, we just show empty installment plans
      return PaymentMethod.TC_INSTALLMENTS
    }

    if (_policyPeriod.ReportingPlanSelected and _reportingPlans.HasElements) {
      return PaymentMethod.TC_REPORTINGPLAN
    }
    else if (_policyPeriod.InstallmentsPlanSelected and _installmentsPlans.HasElements) {
      return PaymentMethod.TC_INSTALLMENTS
    }
    else {
      if (_installmentsPlans.IsEmpty and _reportingPlans.IsEmpty) {
        LocationUtil.addRequestScopedErrorMessage(displaykey.Web.BillingAdjustmentsDV.Error.RetrievePaymentPlans)
      }

      if (_reportingPlans.HasElements and _installmentsPlans.IsEmpty) {
        return PaymentMethod.TC_REPORTINGPLAN
      }
      else {
        return PaymentMethod.TC_INSTALLMENTS
      }
    }
  }

  function previewPayments() {
    try {
      var previewItems = _policyPeriod.JobProcess.retrieveInstallmentsPlanPreviewFromBillingSystem()
      BillingAdjustmentPreviewPaymentsPopup.push(previewItems)
    } catch (e: Exception) {
      LocationUtil.addRequestScopedErrorMessage(displaykey.Web.BillingAdjustmentsDV.Error.RetrieveInstallmentsPlanPreview(e.Message))
    }
  }

  property get SubAccounts(): gw.plugin.billing.BillingAccountSearchResult[] {
    try {
      var subAccounts = _policyPeriod.getSubAccounts()
      if (subAccounts.IsEmpty) {
        return {new gw.plugin.billing.impl.MockBillingAccountSearchResult(){
            : AccountNumber = "",
            : AccountName = displaykey.Web.Policy.Billing.NoSubAccounts
        }}
      }
      return subAccounts
    } catch (e: Exception) {
      LocationUtil.addRequestScopedErrorMessage(displaykey.Web.BillingAdjustmentsDV.Error.RetrieveSubAccounts)
      PCLoggerCategory.BILLING_SYSTEM_PLUGIN.error(e)
      return {}
    }
  }

  static function formatAccount(accountNumber: String): String {
    var result = Query.make(Account).compare("AccountNumber", Equals, accountNumber).select()
    if (!result.Empty) {
      return accountNumber + " (" + result.FirstResult.AccountHolderContact.DisplayName + ")"
    }
    return accountNumber
  }

  /**
   * This method "unsets" the various billing fields on the PolicyPeriod.
   */
  function resetBillingInfo() {
    _policyPeriod.resetBillingInfo()
    setLocalVariablesFromPolicyPeriod()
  }

  function hasBothInstallmentsAndReportPlans(): boolean {
    if(_reportingPlans == null or _installmentsPlans == null) {
      return false;
    }
    return _reportingPlans.HasElements and _installmentsPlans.HasElements
  }

  private function setLocalVariablesFromPolicyPeriod() {
    // If an InvoiceStreamCode is already set, we're not using new invoicing.
    _newInvoicing = (_policyPeriod.InvoiceStreamCode == null)
    if (_policyPeriod.BillingMethod != BillingMethod.TC_AGENCYBILL) {
      _newUnappliedFund = _newInvoicing
    }
    _newUnappliedFund = _policyPeriod.NewInvoiceStream.UnappliedFundID == null
    var paymentPlans = retrievePaymentPlans()
    _installmentsPlans = paymentPlans.InstallmentPlans
    _reportingPlans = paymentPlans.ReportingPlans
    _invoiceStreams = getAvailableInvoiceStreams()
    _paymentMethodChoice = getInitialPaymentMethodChoice()
    _unappliedFunds = _policyPeriod.UnappliedFunds
    if (_policyPeriod.SelectedPaymentPlan == null) {
      initializePaymentPlan()
    }
    if(_policyPeriod.SelectedPaymentPlan.IsReportingPlan) {
      _selectedReportingPlan = paymentPlans.ReportingPlans.getByReportingPatternCode(_policyPeriod.SelectedPaymentPlan.ReportingPatternCode)
    }
  }

  function retrievePaymentPlans() : PaymentPlanData[] {
    try {
      return _policyPeriod.retrievePaymentPlans()
    } catch (e: Exception) {
      LocationUtil.addRequestScopedErrorMessage(displaykey.Web.BillingAdjustmentsDV.Error.RetrievePaymentPlans)
      PCLoggerCategory.BILLING_SYSTEM_PLUGIN.error(e)
      return {}
    }
  }

  function setAltBillingAccount(accountNumber: String) {
    _policyPeriod.AltBillingAccountNumber = accountNumber
    _policyPeriod.NewInvoiceStream.PaymentInstrumentID = null
    _policyPeriod.refreshInvoiceStreams()
    _policyPeriod.unsetPaymentPlan()
    setLocalVariablesFromPolicyPeriod()
    PebblesUtil.invalidateIterators(_location, entity.PaymentPlanSummary)
    PebblesUtil.invalidateIterators(_location, BillingInvoiceStreamInfo)
  }

  private function initializePaymentPlan() {
    _policyPeriod.unsetPaymentPlan()
    if (PaymentMethodChoice == PaymentMethod.TC_INSTALLMENTS) {
      _policyPeriod.selectPaymentPlan(_installmentsPlans.first())
    } else if (PaymentMethodChoice == PaymentMethod.TC_REPORTINGPLAN) {
      _selectedReportingPlan = _reportingPlans.first()
      _policyPeriod.selectPaymentPlan(_selectedReportingPlan)
      _policyPeriod.updateInvoiceStreamAccordingToPaymentPlan()
    }
  }

  /**
   * This is just a public wrapper for the initializePaymentPlan() method.
  */
  function initPaymentPlan() {
    initializePaymentPlan()
  }

  function invoicingOptionChanged() {
    _policyPeriod.InvoiceStreamCode = null
    if (NewInvoicing) {
      NewUnappliedFund = true
    } else {
      _policyPeriod.updateInvoiceStreamAccordingToPaymentPlan()
    }
  }

  property get AvailableInvoiceStreams(): BillingInvoiceStreamInfo[] {
    try {
      return _policyPeriod.getAvailableInvoiceStreams()
    } catch (e: Exception) {
      LocationUtil.addRequestScopedErrorMessage(displaykey.Web.BillingAdjustmentsDV.Error.RetrieveInvoiceStreams)
      PCLoggerCategory.BILLING_SYSTEM_PLUGIN.error(e)
      return {}
    }
  }

  function unappliedFundOptionChanged() {
    if (NewUnappliedFund) {
      _policyPeriod.NewInvoiceStream.UnappliedFundID = null
    } else {
      _policyPeriod.NewInvoiceStream.UnappliedFundID = UnappliedFunds.first()?.PublicID
    }
  }
  /**
  * Return an array either containing the selected {@link InstallmentPlanData} or empty if it is a {@ReportingPlanData}
  * or nothing was selected in the first place.
  *
  * @param summary The {@link PaymentPlanSummary} that will be converted
  * @return An array containing the selected installment plan if it exists
  */
  static function maybeGetInstallmentPlanAsArray(summary : PaymentPlanSummary) : InstallmentPlanData[] {
    if (summary == null or summary.IsReportingPlan) {
      return {}
    }
    return {summary.asPaymentPlanData() as InstallmentPlanData}
  }

  function displayAccountUnappliedOrExisting() : String {
    return UnappliedFunds.IsEmpty ? displaykey.Web.Policy.Payment.AccountUnapplied : displaykey.Web.Policy.Payment.Existing
  }
}
