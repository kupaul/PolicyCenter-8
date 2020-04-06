package gw.job

uses gw.api.job.JobProcessLogger
uses gw.plugin.Plugins
uses gw.plugin.billing.IBillingSystemPlugin
uses gw.plugin.billing.PaymentPlanData

@Export
abstract class NewTermProcess extends JobProcess {
  private property get BillingSystemPlugin(): IBillingSystemPlugin {
    // don't make this an static variable or else it won't be automatically reloaded
    // when we switch Plugin definition using Run Command
    return Plugins.get(IBillingSystemPlugin)
  }

  construct(period: PolicyPeriod, jobSpecificTypePermissions: JobTypePermissions) {
    super(period, jobSpecificTypePermissions)
  }

  override function setPaymentInfoWithNewQuote() {
    // Retrieve all payment plans from billing
    var paymentPlans = _branch.retrievePaymentPlansWithoutSettingBillingAmounts()

    // Default all billing information to that of the previous term in billing system (if we have a BasedOn period)
    if (_branch.BasedOn != null and _branch.SelectedPaymentPlan == null) {
      setBillingInformationFromPreviousTermInBillingSystem(paymentPlans)
    }
    // Set the default billing method, payment plan and invoice stream if not set
    if (_branch.BillingMethod == null) {
      var availableBillingMethods = _branch.AvailableBillingMethods
      _branch.BillingMethod = availableBillingMethods.contains(TC_DIRECTBILL)
          ? TC_DIRECTBILL : availableBillingMethods.first()
    }
    if (_branch.SelectedPaymentPlan == null) {
      final var defaultInstallmentsPlan = paymentPlans.InstallmentPlans.sortBy(\elt -> elt.BillingId).first()
      _branch.updateBillingAmountsOnInstallmentsPlans({defaultInstallmentsPlan})
      _branch.selectPaymentPlan(defaultInstallmentsPlan)
    }
    if (_branch.NewInvoiceStream == null) {
      _branch.NewInvoiceStream = new BillingInvoiceStream(_branch)
    }
    if (_branch.InvoiceStreamCode == null) {
      _branch.InvoiceStreamCode = _branch.AvailableInvoiceStreams.first().PublicID
    }
    _branch.updateInvoiceStreamAccordingToPaymentPlan()
    super.setPaymentInfoWithNewQuote()
  }

  override function cleanUpAfterEdit() {
    super.cleanUpAfterEdit()
    _branch.removeSelectedPaymentPlan()
  }

  /**
   * Retrieve billing information for the current term in Billing System and set as default values
   * for this new term.
   */
  private function setBillingInformationFromPreviousTermInBillingSystem(paymentPlans : PaymentPlanData[]) {
    JobProcessLogger.logInfo("Retrieving billing information for previous term from billing system")
    final var previousTerm = _branch.BasedOn
    final var preferredSettlementCurrencyUnchanged = !_branch.SettlementCurrencyChangedFromBasedOn
    final var billingPeriod = BillingSystemPlugin.getPeriodInfo(previousTerm)

    if (billingPeriod == null) {
      JobProcessLogger.logWarning("Unable to retrieve policy period information from billing system for Policy number "
          + previousTerm.PolicyNumber + " and term number " + previousTerm.TermNumber)
      return
    }
    // Select the billing method, using previous term billing method if still applicable
    var availableBillingMethods = _branch.AvailableBillingMethods
    if (availableBillingMethods.hasMatch(\b -> b == billingPeriod.BillingMethod)) {
      _branch.BillingMethod = billingPeriod.BillingMethod
    } else {
      // If the previous billing method is no longer available, null out the value on the period
      _branch.BillingMethod = null
    }

    // Only ListBill requires that we not set the Alt Billing Account from previous term,
    // as ListBill accounts are not currency-splintered (they are currency-specific)
    var notUsingListBill = _branch.BillingMethod != BillingMethod.TC_LISTBILL
    if(preferredSettlementCurrencyUnchanged or notUsingListBill) {
      // Set the AltBillingAccount from previous term in Billing System only if currency unchanged, OR ListBill case
      _branch.AltBillingAccountNumber = billingPeriod.AltBillingAccountNumber
    }

    // If we changed PreferredSettlementCurrency since last term, we cannot use any
    // Currency-specific entity references from BC, since they are now inconsistent
    // with the new term's PreferredSettlementCurrency. Currently, this includes
    // PaymentPlan and InvoiceStreamCode, at least.
    if(preferredSettlementCurrencyUnchanged) {
      // Have to set the InvoiceStreamCode first so the next call to BC has it populated correctly.
      if(billingPeriod.InvoiceStreamCode != null) {
        _branch.InvoiceStreamCode = billingPeriod.InvoiceStreamCode
        _branch.CustomBilling = true
      }
      // Set selected payment plan if we found one matching the PaymentPlanID returned from billing system
      var paymentPlan = paymentPlans.getByBillingId(billingPeriod.PaymentPlanID)
      if (paymentPlan != null) {
        _branch.updateBillingAmountsOnInstallmentsPlans({paymentPlan})
        _branch.selectPaymentPlan(paymentPlan)
      }
    }
  }

  override protected function runPreQuote() {
    setRateAsOfDate()
  }

  private function setRateAsOfDate() {
    _branch.RateAsOfDate = java.util.Date.CurrentDate
  }
}
