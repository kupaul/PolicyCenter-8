package gw.plugin.billing.bc700

uses gw.api.system.PCLoggerCategory
uses gw.api.util.CurrencyUtil
uses gw.api.util.LocaleUtil
uses gw.plugin.billing.AgencyBillPlanSummary
uses gw.plugin.billing.BillingAccountSearchCriteria
uses gw.plugin.billing.BillingAccountSearchCriteriaJava
uses gw.plugin.billing.BillingAccountSearchResult
uses gw.plugin.billing.BillingInvoiceStreamInfo
uses gw.plugin.billing.BillingPaymentInstrument
uses gw.plugin.billing.BillingPaymentInstrumentImpl
uses gw.plugin.billing.BillingUnappliedFundInfo
uses gw.plugin.billing.CommissionPlanSummary
uses gw.plugin.billing.IBillingSystemPlugin
uses gw.plugin.billing.InstallmentPlanData
uses gw.plugin.billing.InstallmentPlanDataImpl
uses gw.plugin.billing.PaymentPlanData
uses gw.plugin.billing.PaymentPreviewItem
uses gw.plugin.billing.PolicyPeriodBillingInfo
uses gw.plugin.billing.ReportingPlanCreator
uses wsi.remote.gw.webservice.bc.bc700.billingapi.BillingAPI
uses wsi.remote.gw.webservice.bc.bc700.billingapi.enums.InvoiceItemType
uses wsi.remote.gw.webservice.bc.bc700.billingapi.faults.AlreadyExecutedException
uses wsi.remote.gw.webservice.bc.bc700.billingapi.faults.BadIdentifierException
uses wsi.remote.gw.webservice.bc.bc700.billingapi.types.complex.BCAccountSearchCriteria
uses wsi.remote.gw.webservice.bc.bc700.billingapi.types.complex.InvoiceItemPreview
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.CancelPolicyInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.FinalAuditInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.IssuePolicyInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.NewProducerCodeInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.PCAccountInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.PCContactInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.PCPolicyPeriodInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.PCProducerInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.PaymentPlanInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.PolicyChangeInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.PremiumReportInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.ProducerCodeInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.ReinstatementInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.RenewalInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.RewriteInfo
uses wsi.remote.gw.webservice.bc.bc700.paymentinstrumentapi.PaymentInstrumentAPI

uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException
uses java.lang.Integer
uses java.util.ArrayList
uses java.util.HashSet

/**
* This is the implementation of IBillingSystemPlugin that connects to a 700
* Guidewire BillingCenter via SOAP
*/
@Export
class BCBillingSystemPlugin implements IBillingSystemPlugin {

  var _logger : org.slf4j.Logger

  construct() {
    _logger = gw.pl.logging.LoggerFactory.getLogger("BillingIntegration")
  }

  protected function callUpdate<T>(call : block(api : BillingAPI) : T) : T {
    try {
      return call(BillingAPI)
    } catch(e : AlreadyExecutedException) {
      // already executed, just ignored this call
    }
    return null
  }

  override function createAccount(account : Account, transactionID : String) : String {
    var accountInfo = new PCAccountInfo()
    accountInfo.sync(account)
    PCLoggerCategory.BILLING_SYSTEM_PLUGIN.info("Sending account ${account} to Billing System")
    return callUpdate(\ b -> b.createAccount(accountInfo, transactionID))
  }

  override function retrieveAllPaymentPlans(policyPeriod : PolicyPeriod) : PaymentPlanData[] {
    var bcPaymentPlans : PaymentPlanInfo[]
    if (policyPeriod.BillingMethod == BillingMethod.TC_LISTBILL){
      PCLoggerCategory.BILLING_SYSTEM_PLUGIN.info("Getting payment plans for account ${policyPeriod.AltBillingAccountNumber}")
      if(policyPeriod.AltBillingAccountNumber != null){
        bcPaymentPlans = BillingAPI.getPaymentPlansForAccount(policyPeriod.AltBillingAccountNumber)
      } else {
        return {}
      }
    }
    else {
      PCLoggerCategory.BILLING_SYSTEM_PLUGIN.info("Getting all payment plans")
      bcPaymentPlans = BillingAPI.getAllPaymentPlans()
    }

    return convertBCPaymentPlansToPaymentPlanSummaries(bcPaymentPlans, policyPeriod)
  }

  protected function convertBCPaymentPlansToPaymentPlanSummaries(paymentPlans : PaymentPlanInfo[], period : PolicyPeriod) : PaymentPlanData[] {
    return paymentPlans.flatMap(\ plan -> convertBCPaymentPlanToPaymentPlanSummary(plan, period))
  }

  protected function convertBCPaymentPlanToPaymentPlanSummary(bcPaymentPlan: PaymentPlanInfo, period : PolicyPeriod) : List<PaymentPlanData> {
    // If BC sends us a Reporting plan, we need to find all AuditSchedulePatterns in our system
    // whose PaymentPlanCode matches the PublicID of the BC (Reporting) PaymentPlan. Then,
    // we generate a PC PaymentPlanSummary object for each of these patterns.
    if (bcPaymentPlan.Reporting) {
      return ReportingPlanCreator.createReportingPlansForPlanId(bcPaymentPlan.PublicID)
    }
    else { // if it's not a Reporting plan, it's an Installments plan.
      var installmentPlan = new InstallmentPlanDataImpl ()
      // Set the BillingId to the PublicID from BillingCenter
      installmentPlan.BillingId = bcPaymentPlan.PublicID
      installmentPlan.Name = bcPaymentPlan.Name
      installmentPlan.AllowedPaymentMethods = bcPaymentPlan.AllowedPaymentMethods.map(\ s -> AccountPaymentMethod.get(s)) as AccountPaymentMethod[]
      if (bcPaymentPlan.InvoiceFrequency != null) {
        installmentPlan.InvoiceFrequency = bcPaymentPlan.InvoiceFrequency
      } // else use the default value from datamodel which is 'monthly'
      return {installmentPlan}
    }
  }

  override function accountExists(accountNumber: String) : boolean {
    return BillingAPI.isAccountExist(accountNumber)
  }

  @Deprecated("As of 8.0.1 use IBillingSystemPlugin#accountExists instead.")
  override function isAccountExist(accountNumber: String) : boolean {
    return BillingAPI.isAccountExist(accountNumber)
  }

  override function getAvailableBillingMethods(producerCode : String, currency : Currency) : BillingMethod[] {
    var billingMethods = BillingAPI.getAvailableBillingMethods(producerCode)
    var temp = new ArrayList<BillingMethod>()
    billingMethods.each(\ b -> { temp.add(BillingMethod.get(b)) })
    temp.add(BillingMethod.TC_LISTBILL)
    return temp.toTypedArray()
  }

  override function retrieveInstallmentsPlanPreview(policyPeriod : PolicyPeriod) : PaymentPreviewItem[] {
    var issuePolicyInfo = createIssuePolicyInfoForPreview(policyPeriod)

    var bcInvoiceItems = BillingAPI.previewInstallmentsPlanInvoices(issuePolicyInfo)
    return convertToPolicyCenterPaymentPreviewItems(bcInvoiceItems, policyPeriod.PreferredSettlementCurrency)
  }

  private function createIssuePolicyInfoForPreview(policyPeriod : PolicyPeriod) : IssuePolicyInfo {
    var issuePolicyInfo = new IssuePolicyInfo()
    issuePolicyInfo.syncForPreview(policyPeriod)
    return issuePolicyInfo
  }

  private function convertToPolicyCenterPaymentPreviewItems(bcInvoiceItems : InvoiceItemPreview[], expectedCurrency : Currency) : PaymentPreviewItem[] {
    var invoices = new HashSet<PaymentPreviewItem>()
    bcInvoiceItems.each(\ i -> {var invoiceItem = new PaymentPreviewItem()
                                 invoiceItem.DueDate = i.InvoiceDueDate
                                 invoiceItem.Amount = i.Amount.ofCurrency(expectedCurrency)
                                 invoiceItem.Type = i.Type.GosuValue
                                 invoices.add(invoiceItem)})

    return invoices.toTypedArray()
  }
  /**
  * Issue a policy period in Billing Center
  * @param period: the policy period
  * @param transactionID: the unique transaction id to make this call idempotent
  */
  override function createPolicyPeriod(period: PolicyPeriod, transactionID : String) : String {
    var issuePolicyInfo = new IssuePolicyInfo()
    issuePolicyInfo.sync(period)
    PCLoggerCategory.BILLING_SYSTEM_PLUGIN.info("Sending policy ${period} to Billing System")
    return callUpdate(\ b -> b.issuePolicyPeriod(issuePolicyInfo, transactionID))
  }

  /**
  * Cancel a policy period in Billing Center
  * @param period: the policy period
  * @param transactionID: the unique transaction id to make this call idempotent
  */
  override function cancelPolicyPeriod(period: PolicyPeriod, transactionID : String) : void {
    var cancelInfo = new CancelPolicyInfo()
    cancelInfo.sync(period)
    callUpdate(\ b -> b.cancelPolicyPeriod(cancelInfo, transactionID))
  }

  /**
  * Issue a policy change in Billing Center
  * @param period: the policy period
  * @param transactionID: the unique transaction id to make this call idempotent
  */
  override function issuePolicyChange(period: PolicyPeriod, transactionID: String) : void {
    var policyChangeInfo = new PolicyChangeInfo()
    policyChangeInfo.syncPolicyChange(period)
    callUpdate(\ b -> b.changePolicyPeriod(policyChangeInfo,  transactionID))
  }

  override function issueReinstatement(period: PolicyPeriod, transactionID: String) : void {
    var reinstatementInfo = new ReinstatementInfo()
    reinstatementInfo.syncBasicPolicyInfo(period)
    reinstatementInfo.Description = period.Reinstatement.Description

    callUpdate(\ b -> b.reinstatePolicyPeriod(reinstatementInfo,  transactionID))
  }

  override function renewPolicyPeriod(period: PolicyPeriod, transactionID: String) : void {
    var renewalInfo = new RenewalInfo()
    renewalInfo.sync(period)
    renewalInfo.PriorTermNumber = period.BasedOn.TermNumber
    renewalInfo.PriorPolicyNumber = period.BasedOn.PolicyNumber
    callUpdate(\ b -> b.renewPolicyPeriod(renewalInfo,  transactionID))
  }

  override function issueFinalAudit(period: PolicyPeriod, transactionID: String) : void {
    var finalAuditInfo = new FinalAuditInfo()
    finalAuditInfo.syncBasicPolicyInfo(period)

    callUpdate(\ b -> b.issueFinalAudit(finalAuditInfo,  transactionID))
  }

  override function createProducer(organization: Organization, transactionId: String) : String {
    if (not organization.Producer) {
      throw new IllegalArgumentException("Cannot create producer from an non-producer organization")
    }
    var producerInfo = new PCProducerInfo()
    producerInfo.sync(organization)
    return callUpdate(\ b -> b.createProducer(producerInfo,  transactionId))
  }

  override function retrieveAllAgencyBillPlans() : AgencyBillPlanSummary[] {
    return BillingAPI.getAllAgencyBillPlans()
      .map(\ p -> {
        final var summary = new AgencyBillPlanSummary()
        summary.Name = p.Name
        summary.Id = p.PublicID
        summary.Currency = CurrencyUtil.DefaultCurrency
        return summary
      })
  }

  override function producerExists(producerId: String) : boolean {
    return BillingAPI.isProducerExist(producerId)
  }

  @Deprecated("As of 8.0.1 use IBillingSystemPlugin#producerExists instead.")
  override function isProducerExist(producerId: String) : boolean {
    return BillingAPI.isProducerExist(producerId)
  }

  override function createProducerCode(producerCode: ProducerCode, transactionId: String) : String {
    var producerCodeInfo = new NewProducerCodeInfo()
    producerCodeInfo.sync(producerCode)
    return callUpdate(\ b -> b.createProducerCode(producerCodeInfo, transactionId))
  }

  override function retrieveAllCommissionPlans() : CommissionPlanSummary[] {
    return BillingAPI.getAllCommissionPlans()
      .map(\ p -> {
        final var summary = new CommissionPlanSummary()
        summary.Name = p.Name
        summary.Id = p.PublicID
        summary.Currency = CurrencyUtil.DefaultCurrency
        summary.AllowedTiers =
            p.AllowedTiers.map(\ t -> Tier.get(t)).toTypedArray()
        return summary
      })
  }

  override function syncProducerCode(producerCode : ProducerCode) {
    // 7.0 does nothing
  }

  override function updateProducerCode(producerCode: ProducerCode, transactionId : String) : void {
    var producerCodeInfo = new ProducerCodeInfo()
    producerCodeInfo.PublicID = producerCode.PublicID
    producerCodeInfo.Code = producerCode.Code
    var status = producerCode.ProducerStatus
    producerCodeInfo.Active = status == ProducerStatus.TC_ACTIVE or status ==  ProducerStatus.TC_LIMITED
    callUpdate(\ b -> b.updateProducerCode(producerCodeInfo, transactionId))
  }

  override function syncOrganization(organization : Organization) {
    // 7.0 does nothing
  }

  override function updateProducer(organization: Organization, transactionId : String) : void {
    if (not organization.Producer) {
      throw new IllegalArgumentException("Cannot create producer from an non-producer organization")
    }
    var producerInfo = new PCProducerInfo()
    producerInfo.sync(organization)
    callUpdate(\ b -> b.updateProducer(producerInfo, transactionId))
  }

  override function updateAccount(account: Account, transactionId: String) : void {
    var accountInfo = new PCAccountInfo()
    accountInfo.sync(account)
    callUpdate(\ b -> b.updateAccount(accountInfo, transactionId))
  }

  override function rewritePolicyPeriod(period: PolicyPeriod, transactionId: String) : void {
    var renewalInfo = new RewriteInfo()
    renewalInfo.sync(period)
    renewalInfo.PriorTermNumber = period.BasedOn.TermNumber
    renewalInfo.PriorPolicyNumber = period.BasedOn.PolicyNumber

    callUpdate(\ b -> b.rewritePolicyPeriod(renewalInfo, transactionId))
  }

  override function issuePremiumReport(period: PolicyPeriod, transactionId: String) : void {
    var premiumReportInfo = new PremiumReportInfo()
    premiumReportInfo.sync(period)
    callUpdate(\ b -> b.issuePremiumReport(premiumReportInfo, transactionId))
  }

  override function updateContact(contact: Contact, transactionId: String) : void {
    var updateContactInfo = new PCContactInfo()
    updateContactInfo.sync(contact)
    callUpdate(\ b -> b.updateContact(updateContactInfo, transactionId))
  }

  override function waiveFinalAudit(period: PolicyPeriod, transactionId: String) : void {
    var policyPeriodInfo = new PCPolicyPeriodInfo()
    policyPeriodInfo.PolicyNumber = period.PolicyNumber
    policyPeriodInfo.TermNumber = period.TermNumber
    callUpdate(\ b -> b.waiveFinalAudit(policyPeriodInfo, transactionId))
  }

  override function scheduleFinalAudit(period: PolicyPeriod, transactionId: String) : void {
    var policyPeriodInfo = new PCPolicyPeriodInfo()
    policyPeriodInfo.PolicyNumber = period.PolicyNumber
    policyPeriodInfo.TermNumber = period.TermNumber
    callUpdate(\ b -> b.scheduleFinalAudit(policyPeriodInfo, transactionId))
  }

  override function getPeriodInfo(period: PolicyPeriod) : PolicyPeriodBillingInfo {
    var policyPeriodInfo = new PCPolicyPeriodInfo()
    policyPeriodInfo.PolicyNumber = period.PolicyNumber
    policyPeriodInfo.TermNumber = period.TermNumber
    var bcPeriod = BillingAPI.getPolicyPeriod(policyPeriodInfo)
    if (bcPeriod == null) {
      return null
    }
    return new PolicyPeriodBillingInfo() {
      :BillingMethod = bcPeriod.BillingMethodCode,
      :PaymentPlanID = bcPeriod.PaymentPlanPublicId,
      :AltBillingAccountNumber = bcPeriod.AltBillingAccountNumber,
      :InvoiceStreamCode = bcPeriod.InvoiceStreamId
    }
  }

  override function transferPolicyPeriods(accountNumber : String,
                                  periods : PolicyPeriod[], transactionId : String) {
    var policyPeriodInfos = periods.map(\ p -> new PCPolicyPeriodInfo() {
      :TermNumber = p.TermNumber,
      :PolicyNumber = p.PolicyNumber
    })
    callUpdate(\ b -> {
      b.transferPolicyPeriods(policyPeriodInfos, accountNumber, transactionId)
      return null
    })
  }

  override function setDownPaymentInstallmentTotalForAllInstallmentsPlans(period : PolicyPeriod, paymentPlans : PaymentPlanData[]) {
    paymentPlans.each(\ i -> {
      if (not (i typeis InstallmentPlanData)) {
        return
      }
      var installmentPlan = i as InstallmentPlanDataImpl
      var issuePolicyInfo = createIssuePolicyInfoForPreview(period)

      issuePolicyInfo.PaymentPlanPublicId = installmentPlan.BillingId
      var bcInvoiceItems = BillingAPI.previewInstallmentsPlanInvoices(issuePolicyInfo)

      var paymentPreviewItems = convertToPolicyCenterPaymentPreviewItems(bcInvoiceItems, period.PreferredSettlementCurrency)
      var downPaymentItem =  paymentPreviewItems.firstWhere(\ p -> p.Type == InvoiceItemType.Deposit.GosuValue)
      if (downPaymentItem != null) {
        installmentPlan.DownPayment = downPaymentItem.Amount
      }
      else {
        // Need to set to zero because otherwise the amount from a prior preview calc will remain in this field
        installmentPlan.DownPayment = 0bd.ofCurrency(period.PreferredSettlementCurrency)
      }

      var installmentItems = paymentPreviewItems.where(\ p -> p.Type == InvoiceItemType.Installment.GosuValue)
      if (installmentItems.HasElements) {
        installmentPlan.Installment = installmentItems.max(\ p -> p.Amount)
      }
      else {
        // Need to set to zero because otherwise the amount from a prior preview calc will remain in this field
        installmentPlan.Installment = 0bd.ofCurrency(period.PreferredSettlementCurrency)
      }

      installmentPlan.Total = paymentPreviewItems.sum(period.PreferredSettlementCurrency, \ p -> p.Amount)
    })
  }

  override function getSubAccounts(parentAccountNumber: String) : BillingAccountSearchResult[] {
    if (parentAccountNumber == null) {
      throw new IllegalStateException("This method should never be called will null account number.")
    }
    try {
      var bcResults = BillingAPI.getAllSubAccounts(parentAccountNumber)
      return bcResults.map(\ b -> new BCBillingAccountSearchResult(b))
    } catch(e : BadIdentifierException) {
      // this is for the case when the account has not been sent to BC yet, probably
      // because this is the first policy period bound for that account.
      return {}
    }
  }


  override function getInvoiceStreams(accountNumber : String, currency : Currency) : BillingInvoiceStreamInfo[] {
    if (accountNumber == null) {
      throw new IllegalStateException("This method should never be called will null account number.")
    }
    PCLoggerCategory.BILLING_SYSTEM_PLUGIN.info("Getting invoice streams for account: ${accountNumber}")
    var infos = BillingAPI.getAccountInvoiceStreams(accountNumber)
    return infos.map(\ i -> new BCBillingInvoiceStreamInfo(i))
  }

  /**
   * This method expect the specific BillingAccountSearchCriteria implementation of the
   * BillingAccountSearchCriteriaJava interface, not just some implementation.
   */
  override function searchForAccounts(criteria : BillingAccountSearchCriteriaJava, limit : Integer) : BillingAccountSearchResult[] {
    if (criteria typeis BillingAccountSearchCriteria) {
      var bcCriteria = new BCAccountSearchCriteria() {
        :AccountName = criteria.AccountName,
        :AccountNumber = criteria.AccountNumber,
        :IsListBill = criteria.ListBill
      }
      var bcResults = BillingAPI.searchForAccounts(bcCriteria, limit)

      return bcResults.map(\ b -> new BCBillingAccountSearchResult(b))
    }else{
      throw new IllegalStateException("Criteria should be of gosu type: ${typeof BillingAccountSearchCriteria}")
    }
  }

  override function getExistingPaymentInstruments(accountNumber : String, currency : Currency) : BillingPaymentInstrument[] {
    try{
      var instruments = PaymentInstrumentAPI.getPaymentInstrumentsForAccount(accountNumber)
      return instruments
        .where(\ p -> p.PaymentMethod <> wsi.remote.gw.webservice.bc.bc700.paymentinstrumentapi.enums.PaymentMethod.Responsive) // filter out responsive
        .map(\ p -> createBillingPaymentInstrument(p))
    }catch(e : wsi.remote.gw.webservice.bc.bc700.paymentinstrumentapi.faults.BadIdentifierException){
      // account is new, just ignore the exception and return empty list
      _logger.info("Trying to get payment instruments for account that not exist in BC yet")
      return {}
    }
  }

  override function addPaymentInstrumentTo(accountNumber : String, currency : Currency, paymentInstrument : BillingPaymentInstrument) : BillingPaymentInstrument {
    var accountExist = accountExists(accountNumber)
    if(not accountExist){
      var account = Account.finder.findAccountByAccountNumber(accountNumber)
      createAccount(account, null)
    }
    var instrument = paymentInstrument
    var bcInstrument = new wsi.remote.gw.webservice.bc.bc700.paymentinstrumentapi.types.complex.PaymentInstrumentRecord(){
      :PaymentMethod = wsi.remote.gw.webservice.bc.bc700.paymentinstrumentapi.enums.PaymentMethod.forGosuValue(instrument.PaymentMethod.Code),
      :OneTime = false,
      :Token = instrument.Token
    }
    bcInstrument = PaymentInstrumentAPI.createPaymentInstrumentOnAccount(accountNumber, bcInstrument)
    return createBillingPaymentInstrument(bcInstrument)
  }

  override function updatePolicyPeriodTermConfirmed(policyNumber : String, termNumber : int,
                                           isConfirmed : boolean) : void{
    BillingAPI.updatePolicyPeriodTermConfirmed(policyNumber, termNumber, isConfirmed)
  }

  @Deprecated("Deprecated as of 8.0.1. Use updatePolicyPeriodTermConfirmed(String policyNumber, int termNumber, boolean isConfirmed) instead.")
  override function updatePolicyPeriodTermConfirmed(policyNumber : String, termNumber : int,
                                                    isConfirmed : Boolean) : void{
    BillingAPI.updatePolicyPeriodTermConfirmed(policyNumber, termNumber, isConfirmed)
  }

  private function createBillingPaymentInstrument(p : wsi.remote.gw.webservice.bc.bc700.paymentinstrumentapi.types.complex.PaymentInstrumentRecord) : BillingPaymentInstrument{
    return new BillingPaymentInstrumentImpl(){
        :PublicID = p.PublicID,
        :PaymentMethod = AccountPaymentMethod.get(p.PaymentMethod.GosuValue),
        :OneTime = p.OneTime,
        :DisplayName = p.DisplayName,
        :Token = p.Token
    }
  }

  override function retrieveAccountUnappliedFunds(accountNumber : String, currency : Currency) : BillingUnappliedFundInfo [] {
    return {}
    // BC 700 does not support this function, if customer wants they can change their implementation
    // of BC 700 to support it and change this method accordingly.
  }

  private property get BillingAPI() : BillingAPI {
    final var billingAPI = new BillingAPI()
    billingAPI.Config.Guidewire.Locale = LocaleUtil.CurrentLanguage.Code
    return billingAPI
  }

  private property get PaymentInstrumentAPI() : PaymentInstrumentAPI {
    return new PaymentInstrumentAPI()
  }
}