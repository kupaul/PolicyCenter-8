package gw.plugin.billing.impl

uses gw.api.database.Query
uses gw.api.databuilder.UniqueKeyGenerator
uses gw.api.system.PCLoggerCategory
uses gw.api.util.CurrencyUtil
uses gw.api.util.DateUtil
uses gw.api.util.MonetaryAmounts
uses gw.lang.reflect.ReflectUtil
uses gw.lang.reflect.TypeSystem
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
uses gw.plugin.billing.ReportingPlanDataImpl

uses java.lang.Double
uses java.lang.Integer
uses java.util.ArrayList
uses java.util.Collections
uses java.lang.IllegalStateException
uses java.lang.SuppressWarnings

/**
 * This is a demo implementation of the BillingSystemPlugin.
 */
@Export
class StandAloneBillingSystemPlugin implements IBillingSystemPlugin {
  static private var _CommissionPlanSummaries : List<CommissionPlanSummary> = null
  static private var _AgencyBillPlanSummaries : List<AgencyBillPlanSummary> = null

  construct() {
  }

  public static var INSTANCE : IBillingSystemPlugin = new StandAloneBillingSystemPlugin()

  private property get COMMISSION_PLAN_SUMMARIES() : List<CommissionPlanSummary> {
    if (_CommissionPlanSummaries == null) {
      _CommissionPlanSummaries = {newCommissionPlanSummary(CurrencyUtil.DefaultCurrency)}
    }
    return _CommissionPlanSummaries
  }

  private property get AGENCY_BILL_PLAN_SUMMARIES() : List<AgencyBillPlanSummary> {
    if (_AgencyBillPlanSummaries == null) {
      final var plans = { newAgencyBillingPlanSummary(TC_USD, "1") }
      plans.add(newAgencyBillingPlanSummary(TC_USD, "2"))
      plans.add(newAgencyBillingPlanSummary(TC_USD, "3"))
      if (CurrencyUtil.MultiCurrencyMode){
        plans.add(newAgencyBillingPlanSummary(TC_JPY, "ichi"))
        plans.add(newAgencyBillingPlanSummary(TC_JPY, "ni"))
        plans.add(newAgencyBillingPlanSummary(TC_JPY, "san"))
        plans.add(newAgencyBillingPlanSummary(TC_EUR, "ein"))
        plans.add(newAgencyBillingPlanSummary(TC_EUR, "dos"))
        plans.add(newAgencyBillingPlanSummary(TC_EUR, "trois"))
      }
      _AgencyBillPlanSummaries = Collections.unmodifiableList(plans)
    }
    return _AgencyBillPlanSummaries
  }

  override function createAccount( account: Account, txnId : String ) : String {
    return "BCAccountPublicID"
  }

  override function accountExists(p0: String ) : boolean {
    return false
  }

  @Deprecated("As of 8.0.1 use IBillingSystemPlugin#accountExists instead.")
  override function isAccountExist(p0: String ) : boolean {
    return false
  }

  override function getAvailableBillingMethods( p0: String, currency : Currency ) : BillingMethod[] {
    return BillingMethod.getTypeKeys(false).toTypedArray()
  }

  override function createPolicyPeriod( p0: PolicyPeriod, txnId : String ) : String {
    return "BCPolicyPeriodPublicID"
  }

  override function retrieveAllPaymentPlans(policyPeriod : PolicyPeriod) : PaymentPlanData[] {
    if (policyPeriod.BillingMethod == BillingMethod.TC_LISTBILL && policyPeriod.AltBillingAccountNumber == null) {
      return {}
    }

    var allPaymentMethods = AccountPaymentMethod.getTypeKeys(false)

    var plan1 = new InstallmentPlanDataImpl()
    plan1.BillingId = "pctest:2"
    plan1.Name = displaykey.Web.Demo.Billing.SixPaymentsDemo
    plan1.AllowedPaymentMethods = allPaymentMethods.where(\ a -> a <> TC_RESPONSIVE).toTypedArray()
    plan1.Notes = displaykey.Web.Demo.Billing.SendInvoiceNotAllowed
    plan1.InvoiceFrequency = BillingPeriodicity.TC_EVERYOTHERMONTH

    var plan2 = new InstallmentPlanDataImpl()
    plan2.BillingId = "pctest:3"
    plan2.Name = displaykey.Web.Demo.Billing.ThreePaymentsDemo
    plan2.InvoiceFrequency = BillingPeriodicity.TC_EVERYFOURMONTHS
    plan2.AllowedPaymentMethods = allPaymentMethods.toTypedArray()

    var reportingPlans = ReportingPlanCreator.createReportingPlansForPlanId("ReportingPlanId")
    reportingPlans.each( \ plan -> {
      (plan as ReportingPlanDataImpl).AllowedPaymentMethods = allPaymentMethods.toTypedArray()
    })

    var plan4 = new InstallmentPlanDataImpl()
    plan4.BillingId = "pctest:4"
    plan4.Name = displaykey.Web.Demo.Billing.FullPay
    plan4.InvoiceFrequency = BillingPeriodicity.TC_EVERYYEAR
    plan4.AllowedPaymentMethods = allPaymentMethods.toTypedArray()

    var plan5 = new InstallmentPlanDataImpl()
    plan5.BillingId = "pctest:5"
    plan5.Name = displaykey.Web.Demo.Billing.TwicePerMonthDemo
    plan5.Notes = displaykey.Web.Demo.Billing.SendInvoiceNotAllowed
    plan5.AllowedPaymentMethods = allPaymentMethods.where(\ a -> a <> TC_RESPONSIVE).toTypedArray()
    plan5.InvoiceFrequency = BillingPeriodicity.TC_TWICEPERMONTH

    var createdPlans : List<PaymentPlanData> = {plan1, plan2}
    createdPlans.addAll(reportingPlans)
    createdPlans.addAll({plan4, plan5})
    return createdPlans.toTypedArray()
  }

  override function cancelPolicyPeriod( p0: PolicyPeriod, txnId : String ) : void {
  }

  override function retrieveInstallmentsPlanPreview( p0: PolicyPeriod ) : PaymentPreviewItem[] {
    var plan = new PaymentPreviewItem()
    plan.Amount = p0.TotalCostRPT
    plan.Type = displaykey.Web.Demo.Billing.DownPayment
    plan.DueDate = DateUtil.currentDate()

    return new PaymentPreviewItem[] {plan}
  }

  override function issuePolicyChange( p0: PolicyPeriod, p1: String ) : void {
  }

  override function issueReinstatement( p0: PolicyPeriod, p1: String ) : void {
  }

  override function renewPolicyPeriod( p0: PolicyPeriod, p1: String ) : void {
  }

  override function issueFinalAudit( p0: PolicyPeriod, p1: String ) : void {
  }

  override function createProducer( p0: Organization, p1: String ) : String {
    return "pc:1"
  }

  override function retrieveAllAgencyBillPlans(): AgencyBillPlanSummary[] {
    return AGENCY_BILL_PLAN_SUMMARIES.toTypedArray()
  }

  override function producerExists(p0: String ) : boolean {
    return false
  }

  @Deprecated("As of 8.0.1 use IBillingSystemPlugin#producerExists instead.")
  override function isProducerExist(p0: String ) : boolean {
    return false
  }

  override function createProducerCode( p0: ProducerCode, p1: String ) : String {
    return "pctest:1"
  }

  override function retrieveAllCommissionPlans() : CommissionPlanSummary[] {
    return COMMISSION_PLAN_SUMMARIES.toTypedArray()
  }

  override function syncProducerCode(producerCode : ProducerCode) {
    producerCode.CommissionPlans.each(\ codePlan -> {
      // CommissionPlan is required; billing system will have defaulted it...
      if (codePlan.CommissionPlanID == null) {
        codePlan.CommissionPlanID = getCommissionPlanSummaryFor(codePlan.Currency).Id
      }
    })
  }

  override function updateProducerCode( p0: ProducerCode, txnId : String ) : void {
  }

  override function syncOrganization(organization : Organization) {
    // null AgencyBillPlan is allowed; do nothing
  }

  override function updateProducer( p0: Organization, txnId : String ) : void {
  }

  override function updateAccount( p0: Account, p1: String ) : void {
  }

  override function rewritePolicyPeriod( p0: PolicyPeriod, p1: String ) : void {
  }

  override function issuePremiumReport( p0: PolicyPeriod, p1: String ) : void {
  }

  override function updateContact( p0: Contact, p1: String ) : void {
  }

  override function waiveFinalAudit( p0: PolicyPeriod, p1: String ) : void {
  }

  override function scheduleFinalAudit( p0: PolicyPeriod, p1: String ) : void {
  }

  override function getPeriodInfo( period: PolicyPeriod ) : PolicyPeriodBillingInfo {
    return new PolicyPeriodBillingInfo(){
      :BillingMethod = period.BillingMethod,
      :PaymentPlanID = period.SelectedPaymentPlan.BillingId,
      :AltBillingAccountNumber = period.AltBillingAccountNumber,
      :InvoiceStreamCode = period.InvoiceStreamCode
    }
  }

  override function transferPolicyPeriods(p0 : String, p1 : PolicyPeriod[], p2 : String) {
  }

  override function setDownPaymentInstallmentTotalForAllInstallmentsPlans(policyPeriod : PolicyPeriod, paymentPlans : PaymentPlanData[]) {
    var currency = policyPeriod.PreferredSettlementCurrency
    var totalCost = policyPeriod.TotalCostRPT

    paymentPlans.each(\ paymentPlan -> {
      if (not (paymentPlan typeis InstallmentPlanData)) {
        return
      }
      var installmentPlan = paymentPlan as InstallmentPlanDataImpl
      var downPercent : Double    // Down payment as percentage of total
      var installmentCount : Double  // Number of installments
      var installmentPercent : Double  // Percent extra charged for each installment
      switch (paymentPlan.BillingId) {
        case "pctest:2":   // 6 Pay --> Down payment + 5 installments
          downPercent = 0.18
          installmentCount = 5
          installmentPercent = 0.03
          break;
        case "pctest:3":   // 3 Pay --> Down payment + 2 installments
          downPercent = 0.40
          installmentCount = 2
          installmentPercent = 0.02
          break;
        case "pctest:4":   // Full Pay --> Down payment only
          downPercent = 1.00
          installmentCount = 0
          installmentPercent = 0
          break;
        case "pctest:5":   // Twice Per Month --> Down payment + 10 installments
          downPercent = 0.20
          installmentCount = 8
          installmentPercent = 0.10
          break;
        default:           // A default which generates a partial down payment and installments with no add-on fees
          downPercent = 0.40
          installmentCount = 2
          installmentPercent = 0
      }
      if (totalCost != null) {
        installmentPlan.DownPayment =
          MonetaryAmounts.roundToCurrencyScale(totalCost.Amount * downPercent, totalCost.Currency, HALF_EVEN)

        // Always round installments up to show the largest installment
        if (installmentCount > 0) {
          installmentPlan.Installment = MonetaryAmounts.roundToCurrencyScale(
             (((totalCost - installmentPlan.DownPayment)/installmentCount).Amount * (1 + installmentPercent)),
                 totalCost.Currency, CEILING)
        } else { installmentPlan.Installment = 0bd.ofCurrency(currency) }

        if (installmentPercent == 0) {
          installmentPlan.Total = MonetaryAmounts.roundToCurrencyScale(totalCost)  // Avoid any rounding issues when no fees are applied
        } else {  // Calc as sum of the down payment + installments
          installmentPlan.Total = MonetaryAmounts.roundToCurrencyScale(
              (installmentPlan.DownPayment + (installmentCount * installmentPlan.Installment)).Amount,
              installmentPlan.DownPayment.Currency, HALF_EVEN)
        }
      }
    } )
  }

  override function getSubAccounts(parentAccountNumber: String) : BillingAccountSearchResult[] {

    return createSearchResultFromActualAccounts( getSampleSubAccounts() )

  }

  override function getInvoiceStreams(accountNumber : String, currency : Currency) : BillingInvoiceStreamInfo[] {
    PCLoggerCategory.BILLING_SYSTEM_PLUGIN.info("Getting invoice streams for account: ${accountNumber}")
    return createInvoiceStreams(accountNumber)
  }

  private function createInvoiceStreams(accountNumber : String) : BillingInvoiceStreamInfo[] {
    var id = accountNumber.hashCode() >> 114 // append the account number to the description for testing purpose
    return new BillingInvoiceStreamInfo[]{
      new MockBillingInvoiceStreamInfo(){
        :PublicID = "1:" + id,
        :Description = "PA (57493074, 5738982)",
        :PaymentInstrumentName = "Visa xxxx-7288",
        :Interval = BillingPeriodicity.TC_MONTHLY,
        :DueDateBilling = false,
        :Days = "1",
        :PaymentMethod = AccountPaymentMethod.TC_CREDITCARD
      },
      new MockBillingInvoiceStreamInfo(){
        :PublicID = "2:" + id,
        :Description = "BOP (478389838), CA (57383829)",
        :PaymentInstrumentName  = "Manual Payment",
        :Interval = BillingPeriodicity.TC_MONTHLY,
        :DueDateBilling = false,
        :Days = "15",
        :PaymentMethod = AccountPaymentMethod.TC_RESPONSIVE
      },
      new MockBillingInvoiceStreamInfo(){
        :PublicID = "3:" + id,
        :Description = "IM",
        :PaymentInstrumentName  = "Amex xxxx-7287",
        :Interval = BillingPeriodicity.TC_TWICEPERMONTH,
        :DueDateBilling = true,
        :Days = "1, 15",
        :PaymentMethod = AccountPaymentMethod.TC_CREDITCARD
      },
      new MockBillingInvoiceStreamInfo(){
        :PublicID = "5:" + id,
        :Description = "PA",
        :PaymentInstrumentName  = "Manual Payment",
        :Interval = BillingPeriodicity.TC_MONTHLY,
        :DueDateBilling = false,
        :Days = "15",
        :PaymentMethod = AccountPaymentMethod.TC_RESPONSIVE
      }
    }
  }

  override function searchForAccounts(p0 : BillingAccountSearchCriteriaJava, p1 : Integer) : BillingAccountSearchResult[] {
    var result1 = createSearchResult("1", p0)
    var result2 = createSearchResult("2", p0)
    var result3 = createSearchResult("3", p0)
    return {result1, result2, result3}
  }

  private function createSearchResultFromActualAccounts(accounts : Account[]) : BillingAccountSearchResult[]{

    var results = new ArrayList<BillingAccountSearchResult>()

    accounts.each(\ a -> {
     results.add( new MockBillingAccountSearchResult(){
        :AccountNumber = a.AccountNumber,
        :AccountName = a.AccountHolderContact.DisplayName,
        :PrimaryPayer = "Payer"
     })
    })

    return results.toTypedArray()
  }

  private function createSearchResult(id : String, criteria : BillingAccountSearchCriteriaJava) : BillingAccountSearchResult{
    var result = new MockBillingAccountSearchResult(){
      :AccountNumber = id,
      :AccountName = UniqueKeyGenerator.get().nextID(),
      :PrimaryPayer = "Payer " + id}
    if (criteria typeis BillingAccountSearchCriteria) {
      if (criteria.AccountName.NotBlank) {
        result.AccountName = criteria.AccountName
      }
      result.AccountNameKanji = criteria.AccountNameKanji
    }
    return result
  }

  override function getExistingPaymentInstruments(accountNumber : String, currency : Currency) : BillingPaymentInstrument[] {
    return {new BillingPaymentInstrumentImpl(){
        :PublicID = "bctest:1",
        :DisplayName = "Visa xxxx-3452",
        :PaymentMethod = TC_CREDITCARD,
        :OneTime = false
      },
      new BillingPaymentInstrumentImpl(){
        :PublicID = "bctest:2",
        :DisplayName = "ACH/EFT xxxx-3857",
        :PaymentMethod = TC_ACH,
        :OneTime = false
      }
    }
  }

  @SuppressWarnings({"all"})
  override function addPaymentInstrumentTo(accountNumber : String, currency : Currency, paymentInstrument : BillingPaymentInstrument) : BillingPaymentInstrument {
    if (paymentInstrument.PaymentMethod == AccountPaymentMethod.TC_UNSUPPORTED) {
      throw new IllegalStateException(displaykey.BillingSystemPlugin.Error.UnsupportedPaymentMethod)
    }
    return new BillingPaymentInstrumentImpl(){
        :PublicID = "bctest:1",
        :DisplayName = "Visa xxxx-3452",
        :PaymentMethod = paymentInstrument.PaymentMethod,
        :OneTime = paymentInstrument.OneTime
      }
  }

  override function updatePolicyPeriodTermConfirmed(policyNumber : String, termNumber : int,
                                           isConfirmed : boolean) : void {
  }

  @Deprecated("Deprecated as of 8.0.1. Use updatePolicyPeriodTermConfirmed(String policyNumber, int termNumber, boolean isConfirmed) instead.")
  override function updatePolicyPeriodTermConfirmed(policyNumber : String, termNumber : int,
                                                    isConfirmed : Boolean) : void {
  }

  /** Create or return existing sub accounts
   *
   */
  private function getSampleSubAccounts() : Account[] {

    var accounts = new Account[2]

    //TODO-dp cannot use test code in production module
    var results = Query.make(Account).compareIn("PublicId", { "pctest:bc:1", "pctest:bc:2" } as Object[] ).select()
    if(results.HasElements){
      return results.toTypedArray()
    }

    var helper = TypeSystem.getByFullNameIfValid("gw.plugin.billing.impl.StandAloneBillingSystemPluginHelper")
    if(helper != null) {
      return ReflectUtil.invokeStaticMethod("gw.plugin.billing.impl.StandAloneBillingSystemPluginHelper", "init", {}) as Account[]
    } else {
      return new Account[0]
    }
  }

  override function retrieveAccountUnappliedFunds(accountNumber : String, currency : Currency) : BillingUnappliedFundInfo[] {
    return {}
  }

  private function getCommissionPlanSummaryFor(currency : Currency) : CommissionPlanSummary {
    var planSummary =
        COMMISSION_PLAN_SUMMARIES.firstWhere(\ planSummary -> planSummary.Currency == currency)
    if (planSummary == null) {
      planSummary = newCommissionPlanSummary(currency)
      COMMISSION_PLAN_SUMMARIES.add(planSummary)
    }
    return planSummary
  }

  private static function newAgencyBillingPlanSummary(currency: Currency, id: String): AgencyBillPlanSummary {
    var summary = new AgencyBillPlanSummary()
    var suffix = " (${id})"
    summary.Id = "pctest:" + currency.Ordinal + suffix
    summary.Name = displaykey.Web.Demo.Billing.StandardAgencyBillPlan + suffix
    summary.Currency = currency
    return summary
  }

  private function newCommissionPlanSummary(currency : Currency) : CommissionPlanSummary {
    final var planSummary = new CommissionPlanSummary()
    planSummary.Name = displaykey.Web.Demo.Billing.StandardCommissionPlan + currency.Code
    planSummary.Id = "pctest:" + currency.Ordinal
    planSummary.Currency = currency
    planSummary.AllowedTiers = new Tier[] {TC_BRONZE}
    return planSummary
  }
}
