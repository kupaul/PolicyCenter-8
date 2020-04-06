package gw.billing

uses gw.api.productmodel.AuditSchedulePattern
uses gw.api.system.PCLoggerCategory
uses gw.api.util.MonetaryAmounts
uses gw.pl.currency.MonetaryAmount
uses gw.plugin.Plugins
uses gw.plugin.billing.BillingAccountSearchResult
uses gw.plugin.billing.BillingInvoiceStreamInfo
uses gw.plugin.billing.BillingPaymentInstrument
uses gw.plugin.billing.BillingUnappliedFundInfo
uses gw.plugin.billing.IBillingSystemPlugin
uses gw.plugin.billing.PaymentPlanData
uses gw.plugin.policyperiod.IPolicyPeriodPlugin

uses java.lang.IllegalStateException
uses java.lang.SuppressWarnings

enhancement PolicyPeriodBillingEnhancement : entity.PolicyPeriod {
  /**
   * An array of available billing methods for this policy period.
   */
  property get AvailableBillingMethods() : BillingMethod[] {
    var policyPeriodPlugin = Plugins.get(IPolicyPeriodPlugin)
    var supportedMethods = policyPeriodPlugin.getSupportedBillingMethods(this)
    if (supportedMethods.Count > 1) {
      var BillingSystem = Plugins.get(IBillingSystemPlugin)
      var bcBillingMethods = BillingSystem
        .getAvailableBillingMethods(this.ProducerCodeOfRecord.PublicID, this.PreferredSettlementCurrency)
      supportedMethods = supportedMethods.where(\ b -> bcBillingMethods.contains(b))
    }
    return supportedMethods
  }

  /**
   * The selected billing invoice stream for this policy period.
   *
   * Only available for new term.
   */
  public property get SelectedInvoiceStream() : BillingInvoiceStreamInfo {
    if (this.InvoiceStreamCode == null) {
      return null
    }
    return this.AvailableInvoiceStreams.firstWhere(\ s -> s.PublicID == this.InvoiceStreamCode)
  }

  /**
   * Convenience method to reset the various Billing parameters that must be re-selected
   * as a result of a Currency change.
   */
  function preferredSettlementCurrencyUpdated() {
    if(this.BillingMethod == BillingMethod.TC_LISTBILL) {
      // Alt billing account for list bill is currency-specific, remove it before resetting other billing variables.
      unsetAltBillingAccountNumber()
    }

    // The currently selected PaymentPlan may no longer be valid for the new Currency.
    // Set it to null so the user must re-select it after Quote.
    // During Quote process, we will retrieve relevant payment plans for this Currency
    // from the billing system.
    unsetPaymentPlan()

    // Any selected Custom Billing options are no longer applicable, so clear them out.
    clearCustomBilling()
  }

  /**
   * Resets all Billing-related fields on this PolicyPeriod to defaults.
   */
  function resetBillingInfo() {
    this.unsetAltBillingAccountNumber()
    this.unsetPaymentPlan()
    this.updateBillingDefaults()

    switch (this.BillingMethod) {
      case TC_LISTBILL:
          this.CustomBilling = true
          break
      case TC_DIRECTBILL:
          break
      case TC_AGENCYBILL:
          disableCustomBilling()
          break
    }
  }

  /**
   * This method is included for compatibility only. Please use the new method refreshInvoiceStreams().
   *
   * @deprecated Since PolicyCenter 8.0.2, please use refreshInvoiceStreams().
   */
  @Deprecated("PC8.0.2", "Please use refreshInvoiceStreams()")
  function updatePaymentPlans() {
    refreshInvoiceStreams();
  }

  /**
   * Update this period's cached payment plans if it is a new term process.
   *
   * This should be invoked when the BillingMethod or AltBillingAccountNumber
   * for the branch have been changed.
   *
   * This should only be invoked after the branch has been quoted.
   */
  function refreshInvoiceStreams() {
    if (this.JobProcess typeis gw.job.NewTermProcess) {
      PCLoggerCategory.BILLING_SYSTEM_PLUGIN.info("Refreshing available payment plans from Billing System, branch: " + this)
      updateInvoiceStreamAccordingToPaymentPlan()
    }
  }

  /**
   * Return whether the specified billing invoice stream can be selected
   *    for this policy period based on its selected payment plan.
   *
   * @param stream The billing invoice stream
   */
  @SuppressWarnings({"all"})
  function canSelectInvoiceStream(stream : BillingInvoiceStreamInfo) : boolean {
    if (stream.PaymentMethod == AccountPaymentMethod.TC_UNSUPPORTED) {
      return false
    }

    if (this.SelectedPaymentPlan == null) {
      return true
    }

    var validInterval = stream.Interval == this.PaymentFrequency
    var validPaymentMethod = this.SelectedPaymentPlan.AllowResponsive or (stream.PaymentMethod <> TC_RESPONSIVE)
    return (validInterval and validPaymentMethod)
  }

  /**
   * The payment frequency for this policy period.
   */
  public property get PaymentFrequency() : BillingPeriodicity {
    switch(this.SelectedPaymentPlan.InvoiceFrequency) {
      case TC_TWICEPERMONTH: return TC_TWICEPERMONTH
      case TC_EVERYWEEK: return TC_EVERYWEEK
      case TC_EVERYOTHERWEEK: return TC_EVERYOTHERWEEK
      default: return TC_MONTHLY
    }
  }

  /**
   * The available payment instruments for this policy period.
   */
  public property get AvailablePaymentInstruments() : BillingPaymentInstrument[] {
    return callBillingSystemPlugin(\ plugin ->
      plugin.getExistingPaymentInstruments(this.BillingAccountNumber, this.PreferredSettlementCurrency)).cast(BillingPaymentInstrument)
  }

  /**
   * Whether the selected payment plan for this policy period is "Responsive".
   */
  public property get AllowResponsive() : boolean {
    var paymentPlan = this.SelectedPaymentPlan
    return paymentPlan == null or paymentPlan.IsReportingPlan or paymentPlan.AllowResponsive
  }

  /**
   * Return the billing sub-accounts for this policy period.
   */
  property get SubAccounts() : BillingAccountSearchResult[] {
    return callBillingSystemPlugin(\ plugin -> plugin.getSubAccounts(BillingAccountNumber))
  }

  /**
   * The available billing invoice streams for this policy period.
   */
  property get AvailableInvoiceStreams() : BillingInvoiceStreamInfo[] {
    return callBillingSystemPlugin(\ plugin ->
      plugin.getInvoiceStreams(BillingAccountNumber, this.PreferredSettlementCurrency)).cast(BillingInvoiceStreamInfo)
  }

  /**
   * The unapplied funds for the Billing Account
   */
  property get UnappliedFunds() : BillingUnappliedFundInfo[] {
    return callBillingSystemPlugin(\ plugin ->
        plugin.retrieveAccountUnappliedFunds(BillingAccountNumber, this.PreferredSettlementCurrency)).cast(BillingUnappliedFundInfo)
  }

  /**
   * The billing account number of this policy period.
   *
   * It is either the policy's account number or an alternate billing account
   * number specified for this period.
   */
  property get BillingAccountNumber() : String {
    return this.AltBillingAccountNumber == null
      ? this.Policy.Account.AccountNumber
      : this.AltBillingAccountNumber
  }

  private function callBillingSystemPlugin<T>(_call : block(plugin : IBillingSystemPlugin) : T) : T {
    var plugin = Plugins.get(IBillingSystemPlugin)
    return _call(plugin)
  }

  /**
   * The billing contact for this policy period.
   */
  property get BillingContact() : PolicyBillingContact {
    return this.EffectiveDatedFields.BillingContact
  }

  /**
   * Whether a reporting plan is selected for this policy period.
   */
  property get ReportingPlanSelected() : boolean {
    if(this.Archived) {
      throw "Cannot access SelectedPaymentPlan on an archived Policy Period."
    }

    return this.SelectedPaymentPlan != null &&
           this.SelectedPaymentPlan.IsReportingPlan
  }

  /**
   * The reporting audit schedule pattern for this policy period.
   */
  property get ReportingPattern() : AuditSchedulePattern {
    if (not ReportingPlanSelected) {
      throw "No reporting plan is selected"
    }
    return this.SelectedPaymentPlan.ReportingPattern
  }

  /**
   * Whether an installments plan is selected for this policy period.
   */
  property get InstallmentsPlanSelected() : boolean {
    return this.SelectedPaymentPlan != null &&
           this.SelectedPaymentPlan.IsInstallmentsPlan
  }

  /**
   * Unset the selected payment plan for this policy period.
   *
   * This includes clearing the selected payment plan, the deposit amount,
   * and the deposit override percent.
   */
  function unsetPaymentPlan() {
    removeSelectedPaymentPlan()
    this.DepositOverridePct = null
    this.DepositAmount = null
  }

  /**
   * Removes and nulls out only the currently selected payment plan.
   */
  function removeSelectedPaymentPlan() {
    var currentPlan = this.SelectedPaymentPlan
    if (currentPlan != null) {
      currentPlan.remove()
    }
    this.SelectedPaymentPlan = null
  }

  function unsetAltBillingAccountNumber() {
    this.AltBillingAccountNumber = null
  }

  /**
   * Calculate and set the deposit amount for this policy period
   *    based on the total subject to reporting and override percent.
   */
  function calculateAndSetDepositAmountOnReporting() : MonetaryAmount {
    var depositAmt : MonetaryAmount
    if (this.TotalSubjectToReporting != null and this.DepositOverridePct != null) {
      depositAmt = this.TotalSubjectToReporting * this.DepositOverridePct / 100
    } else if (this.TotalSubjectToReporting != null and this.ReportingPattern.ReportingDefaultDepositPct != null) {
      depositAmt = this.TotalSubjectToReporting * this.ReportingPattern.ReportingDefaultDepositPct / 100
    } else {
      depositAmt = null
    }
    if (depositAmt != null) {
      depositAmt = MonetaryAmounts.roundToCurrencyScale(depositAmt.Amount, depositAmt.Currency, HALF_EVEN)
    }
    this.DepositAmount = depositAmt
    return depositAmt
  }

  /**
   * Set the specified payment plan for this policy period.
   *
   * @param plan The payment plan to be selected for this period.
   */
  function selectPaymentPlan(plan: PaymentPlanData) {
    if (plan != null and !plan.isSameBillingPaymentPlan(this.SelectedPaymentPlan)) {
      // Clear the current Payment Plan fields
      unsetPaymentPlan()
      this.SelectedPaymentPlan = plan.createPaymentPlanSummary(this.Bundle)
      if (this.SelectedPaymentPlan.IsReportingPlan) {
        setFieldsFromNewReportingPlan()
      } else {
        updateInvoiceStreamAccordingToPaymentPlan()
      }
    }
  }

  /**
   * Update the invoice stream for this policy period based on its selected payment plan.
   */
  function updateInvoiceStreamAccordingToPaymentPlan() {
    var validInvoiceStreams = this.AvailableInvoiceStreams.where(\ b -> canSelectInvoiceStream(b))*.PublicID
    if (not validInvoiceStreams.contains(this.InvoiceStreamCode)) {
      this.InvoiceStreamCode = validInvoiceStreams.first()
    }
    this.NewInvoiceStream.Interval = this.PaymentFrequency
    if (not (this.NewInvoiceStream.Automatic or this.AllowResponsive)) {
      this.NewInvoiceStream.Automatic = true
    }
  }

  function updateBillingDefaults() {
    // Retrieve all payment plans from billing
    var paymentPlans = this.retrievePaymentPlansWithoutSettingBillingAmounts()

    final var defaultInstallmentsPlan = paymentPlans.InstallmentPlans.sortBy(\elt -> elt.BillingId).first()
    if(defaultInstallmentsPlan != null) {
      this.updateBillingAmountsOnInstallmentsPlans({defaultInstallmentsPlan})
      this.selectPaymentPlan(defaultInstallmentsPlan)
    }

    if (this.NewInvoiceStream == null) {
      this.NewInvoiceStream = new BillingInvoiceStream(this)
    }

    this.updateInvoiceStreamAccordingToPaymentPlan()
  }

  /**
   * Sets the specified reporting plan for this policy period.
   *
   * @param plan The reporting plan to be selected for this period.
   */
  function setFieldsFromNewReportingPlan() {
    this.FinalAuditOption = FinalAuditOption.TC_YES
    this.DepositAmount =  this.TotalSubjectToReporting * this.SelectedPaymentPlan.DefaultDepositPercent / 100
    this.DepositOverridePct = null
  }

  /**
   * Returns whether the deposit amount can be overridden for this policy period.
   */
  function canOverrideDeposit() : boolean {
    return this.Submission != null or this.Issuance != null or this.Reinstatement != null
      or (this.PolicyChange != null and not this.PolicyTerm.DepositReleased)
  }

  /**
   * Updates deposit in this policy term, whose value to be sent to BC later
   * Currently updatePolicyTermDepositAmount() is called during submission, rewrite, renewal, issuance,
   * policy change and reinstatement in WC reporting policies.
   * see calculateDeposit() in PolicyInfoEnhancement for more information
   */
  function updatePolicyTermDepositAmount() {
    if(not this.PolicyTerm.DepositReleased){
      this.PolicyTerm.DepositAmount = this.DepositAmount
    }
  }

  /**
   * Waive any changes to the deposit amount for this policy period.
   */
  function waiveDepositChange() {
    this.DepositOverridePct = this.BasedOn.DepositOverridePct
    this.DepositAmount = this.BasedOn.DepositAmount
  }

  /**
   * The previous deposit amount for this policy period.
   */
  property get PrevDepositAmount() : MonetaryAmount {
    return this.PolicyTerm.DepositReleased ? 0bd.ofCurrency(this.PreferredSettlementCurrency) : this.BasedOn.DepositAmount
  }

  /**
   * The difference in the deposit amount from the previous period.
   */
  property get DepositChangeFromBasedOnPeriod() : MonetaryAmount {
    var currentDepositAmount = this.DepositAmount
    return currentDepositAmount.subtract(PrevDepositAmount == null ? 0bd.ofCurrency(this.PreferredSettlementCurrency) : PrevDepositAmount)
  }

  /**
   * Create a new payment instrument for this period using the specified
   *    payment method and token.
   */
  @SuppressWarnings({"all"})
  function createPaymentInstrument(paymentMethod : AccountPaymentMethod, token : String) {
    if (paymentMethod == null) {
      throw new IllegalStateException("Payment method cannot be null.")
    }
    if (paymentMethod == AccountPaymentMethod.TC_UNSUPPORTED) {
      throw new IllegalStateException(displaykey.BillingSystemPlugin.Error.UnsupportedPaymentMethod)
    }
    if (this.Status == PolicyPeriodStatus.TC_BOUND) {
      throw new IllegalStateException("Cannot add payment instrument on bound policy")
    }
    var plugin = gw.plugin.Plugins.get(gw.plugin.billing.IBillingSystemPlugin)
    var paymentInstrument = new gw.plugin.billing.BillingPaymentInstrumentImpl()
    paymentInstrument.PaymentMethod = paymentMethod
    paymentInstrument.Token = token
    var accountNumber = this.BillingAccountNumber
    var newInstrument = plugin.addPaymentInstrumentTo(accountNumber, this.PreferredSettlementCurrency, paymentInstrument)
    this.NewInvoiceStream.PaymentInstrumentID = newInstrument.PublicID
    this.NewInvoiceStream.PaymentMethod = newInstrument.PaymentMethod

    this.Bundle.commit()
  }

  function disableCustomBilling() {
    this.CustomBilling = false
  }

  /**
   * Unset custom billing instructions from this policy period.
   */
  function clearCustomBilling() {
    disableCustomBilling()

    // Create a new invoice stream, and remove the existing one, but do not use the setter on PolicyPeriod
    // to avoid DB constraint issues -- only set the key from the new BillingInvoiceStream TO the PolicyPeriod.
    if (this.NewInvoiceStream != null) {
      this.NewInvoiceStream.remove()
    }
    new BillingInvoiceStream(this).PolicyPeriod = this

    this.InvoiceStreamCode = null
  }

  property get SettlementCurrencyChangedFromBasedOn() : boolean {
    // If no BasedOn (e.g., submission case) then it hasn't changed.
    if(this.BasedOn == null) {
      return false;
    }
    return this.PreferredSettlementCurrency != this.BasedOn.PreferredSettlementCurrency
  }
}
