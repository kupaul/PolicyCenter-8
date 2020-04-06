package gw.plugin.billing.impl

uses gw.api.database.Query
uses gw.api.system.PLDependenciesGateway
uses gw.api.util.CurrencyUtil
uses gw.plugin.billing.BillingAccountInfo
uses gw.plugin.billing.BillingInvoiceInfo
uses gw.plugin.billing.BillingPeriodInfo
uses gw.plugin.billing.BillingPeriodInfo.PolicyTermInfo
uses gw.plugin.billing.BillingTermInfo
uses gw.plugin.billing.IBillingSummaryPlugin

uses java.util.ArrayList
uses java.util.Date

@Export
class StandAloneBillingSummaryPlugin implements IBillingSummaryPlugin {
  construct() {}

  public static var INSTANCE : IBillingSummaryPlugin = new StandAloneBillingSummaryPlugin()

  override function retrieveAccountBillingSummaries(accountNumber : String): BillingAccountInfo[] {
    var mockSoapAccount = new MockAccountBilling() {
      :BilledOutstandingTotal = 12077.18bd.ofDefaultCurrency(),
      :BilledOutstandingCurrent = 11077.18bd.ofDefaultCurrency(),
      :BilledOutstandingPastDue = 1000.18bd.ofDefaultCurrency(),
      :UnbilledTotal = 35999.38bd.ofDefaultCurrency(),
      :UnappliedFundsTotal = 0.00bd.ofDefaultCurrency(),
      :CollateralRequirement = 5000.00bd.ofDefaultCurrency(),
      :CollateralHeld = 5000.00bd.ofDefaultCurrency(),
      :CollateralChargesBilled = 0.00bd.ofDefaultCurrency(),
      :CollateralChargesPastDue = 0.00bd.ofDefaultCurrency(),
      :CollateralChargesUnbilled = 0.00bd.ofDefaultCurrency(),
      :Delinquent = false,
      :BillingCurrency = CurrencyUtil.DefaultCurrency,
      :MockBillingSettings = new MockBillingSettings() {
        :InvoiceDeliveryMethod = InvoiceDeliveryMethod.TC_MAIL,
        :PaymentMethod = AccountPaymentMethod.TC_CREDITCARD.Code,
        :CreditCardIssuer = CreditCardIssuer.TC_DISCOVER.Code, 
        :CreditCardNumber = "************3044", 
        :CreditCardExpMonth = 5,
        :CreditCardExpYear = 2012
      },
      :MockPrimaryPayer = new MockBillingContact() {
        :Name = "Bill Kinman",
        :Address = "4040 Elmwood Ave, Floor 0000, Louisville, KY 40207, US",
        :Phone = "850-578-1682 x0007"
      }
    }
    return { mockSoapAccount }
  }

  override function retrievePolicyBillingSummary(policyNumber : String, termNumber : int): BillingPeriodInfo {
    var invoice1 = new MockInvoice() {
      :Amount = 10000bd.ofDefaultCurrency(),
      :Billed = 2000bd.ofDefaultCurrency(),
      :InvoiceDate = Date.CurrentDate.addDays( -10 ),
      :InvoiceDueDate = Date.CurrentDate.addDays( 20 ),
      :Paid = 1000bd.ofDefaultCurrency(),
      :PastDue = 0bd.ofDefaultCurrency(),
      :InvoiceStream = "Monthly / Send Invoice"
    }
    var invoice2 = new MockInvoice() {
      :Amount = 3000bd.ofDefaultCurrency(),
      :Billed = 0bd.ofDefaultCurrency(),
      :InvoiceDate = Date.CurrentDate.addDays( 20 ),
      :InvoiceDueDate = Date.CurrentDate.addDays( 50 ),
      :Paid = 0bd.ofDefaultCurrency(),
      :PastDue = 0bd.ofDefaultCurrency(),
      :InvoiceStream = "Monthly / Send Invoice"
    }
    var mockObject = new MockPolicyPeriodBilling() {
      :PolicyNumber = policyNumber,
      :TermNumber = termNumber,
      :PolicyTermInfos = findPolicyTermInfos(policyNumber, termNumber),
      :BillingMethod = TC_AGENCYBILL,
      :CurrentOutstanding = 6000bd.ofDefaultCurrency(),
      :DepositRequirement = 5000bd.ofDefaultCurrency(),
      :MockInvoices = new MockInvoice[]{invoice1, invoice2},
      :Paid = 15000bd.ofDefaultCurrency(),
      :PastDue = 1000bd.ofDefaultCurrency(),
      :PaymentPlanName = "5 Pay",
      :TotalBilled = 22000bd.ofDefaultCurrency(),
      :Unbilled = 12000bd.ofDefaultCurrency(),
      :TotalCharges = 34000bd.ofDefaultCurrency(),
      :Delinquent = false,
      :InvoiceStream = "Monthly / Manual Payment",
      :AltBillingAccount = "Uncle Sam"}
    return mockObject
  }

  override function retrieveBillingPolicies(accountNumber: String): BillingPeriodInfo[] {
    var bcPeriods = new ArrayList<BillingPeriodInfo>()
    var periods = Account.finder.findAccountByAccountNumber(accountNumber).Policies*.BoundPeriods
    for(period in periods index i){
      var soapObject = new MockPolicyPeriodBilling() {
        :BillingMethod = BillingMethod.TC_DIRECTBILL,
        :Delinquent = i % 2 == 0,
        :EffectiveDate = period.PeriodStart,
        :ExpirationDate = period.PeriodEnd,
        :PastDue = 2000bd.ofDefaultCurrency(),
        :PolicyNumber = period.PolicyNumber,
        :TermNumber = period.TermNumber,
        :Product = period.Policy.Product.Description,
        :TotalBilled = 4000bd.ofDefaultCurrency(),
        :Unbilled = 1000bd.ofDefaultCurrency(),
        :AltBillingAccount = period.AltBillingAccountNumber,
        :InvoiceStream = {"Monthly / Visa xxxx-4857", "Weekly / Amex xxxx-4624"}[i%2]
      }
      bcPeriods.add(soapObject)
    }
    return bcPeriods.toTypedArray()
  }

  override function retrieveAccountInvoices(p0: String): BillingInvoiceInfo[] {
    var invoice1 = new MockInvoice() {
      :InvoiceNumber = "GH3455860",
      :Status = "Closed",
      :PaidStatus = "Fully Paid",
      :Amount = 100.73bd.ofDefaultCurrency(),
      :InvoiceDate = PLDependenciesGateway.getSystemClock().getDateTime().addMonths( -4 ),
      :InvoiceDueDate = PLDependenciesGateway.getSystemClock().getDateTime().addMonths( -3 ),
      :Unpaid = 0bd.ofDefaultCurrency(),
      :InvoiceStream = "PA, Manual Payment"
    }
    var invoice2 = new MockInvoice() {
      :InvoiceNumber = "YU12349567",
      :Status = "Open",
      :PaidStatus = "Partially Paid",
      :Amount = 400.67bd.ofDefaultCurrency(),
      :InvoiceDate = PLDependenciesGateway.getSystemClock().getDateTime().addMonths( 1 ),
      :InvoiceDueDate = PLDependenciesGateway.getSystemClock().getDateTime().addMonths( 2 ),
      :Unpaid = 123.56bd.ofDefaultCurrency(),
      :InvoiceStream = "PA, Manual Payment"
    }
    var invoice3 = new MockInvoice() {
      :InvoiceNumber = "JH34798456",
      :Status = "Planned",
      :PaidStatus = "Current",
      :Amount = 400.67bd.ofDefaultCurrency(),
      :InvoiceDate = PLDependenciesGateway.getSystemClock().getDateTime().addMonths( 3 ),
      :InvoiceDueDate = PLDependenciesGateway.getSystemClock().getDateTime().addMonths( 4 ),
      :Unpaid = 400.67bd.ofDefaultCurrency(),
      :InvoiceStream = "PA, Manual Payment"
    }
    return new BillingInvoiceInfo[]{invoice1, invoice2, invoice3}
  }

  override function getPoliciesBilledToAccount(accountNumber : String) : BillingPeriodInfo [] {
    var bcPeriods = new ArrayList<BillingPeriodInfo>()
    var query = new Query<PolicyPeriod>(PolicyPeriod)
    query.compare("Status", Equals, PolicyPeriodStatus.TC_BOUND)
    var policyNumber = query.select(\ p -> p.PolicyNumber).FirstResult
    var soapObject = new MockPolicyPeriodBilling() {
      :BillingMethod = BillingMethod.TC_DIRECTBILL,
      :Delinquent = true,
      :EffectiveDate = Date.Today,
      :ExpirationDate = Date.Today.addYears(1),
      :PastDue = 2000bd.ofDefaultCurrency(),
      :PolicyNumber = policyNumber,
      :TermNumber = 1,
      :Product = "Business Auto",
      :TotalBilled = 4000bd.ofDefaultCurrency(),
      :Unbilled = 1000bd.ofDefaultCurrency(),
      :OwningAccount = accountNumber + " Sub",
      :InvoiceStream = "PA, Manual Payment"
    }
    bcPeriods.add(soapObject)
    return bcPeriods.toTypedArray()
  }

  private function findPolicyTermInfos(policyNumber : String, termNumber : int) : BillingTermInfo[] {
    final var policyPeriod = PolicyPeriod.finder
        .findByPolicyNumberAndTerm(policyNumber, termNumber)
        .FirstResult
    final var query = Query.make(PolicyPeriod)
    query.compare(PolicyPeriod#Policy, Equals, policyPeriod.Policy)
    query.compare(PolicyPeriod#MostRecentModel, Equals, true)
    return query.select(\ row -> {
        return new PolicyTermInfo(row.PolicyNumber, row.TermNumber,
            row.EditEffectiveDate, row.CancellationDate?:row.PeriodEnd)
      })
      .orderBy(\ row -> row.EditEffectiveDate)
      .toTypedArray()
  }
}
