package gw.plugin.billing.impl

uses gw.pl.currency.MonetaryAmount
uses gw.plugin.billing.BillingInvoiceInfo
uses gw.plugin.billing.BillingPeriodInfo
uses gw.plugin.billing.BillingTermInfo

uses java.lang.Integer
uses java.util.Date

@Export
class MockPolicyPeriodBilling implements BillingPeriodInfo {
  construct() {}
  
  var _BillingMethod : BillingMethod as BillingMethod
  var _Delinquent : Boolean as Delinquent
  var _EffectiveDate : Date as EffectiveDate
  var _ExpirationDate : Date as ExpirationDate
  var _PastDue : MonetaryAmount as PastDue
  var _PolicyNumber : String as PolicyNumber
  var _TermNumber : Integer as TermNumber
  var _Product : String as Product
  var _PaymentPlanName : String as PaymentPlanName
  var _TotalBilled : MonetaryAmount as TotalBilled
  var _Unbilled : MonetaryAmount as Unbilled
  var _CurrentOutstanding : MonetaryAmount as CurrentOutstanding
  var _DepositRequirement : MonetaryAmount as DepositRequirement
  var _Paid : MonetaryAmount as Paid
  var _TotalCharges : MonetaryAmount as TotalCharges
  var _AltBillingAccount : String as AltBillingAccount
  var _InvoiceStream : String as InvoiceStream
  var _OwningAccount : String as OwningAccount
  var _pcpolicypublicid : String as PCPolicyPublicID
  
  var _Periods : String[] as Periods
  var _policyTermInfos : BillingTermInfo[] as PolicyTermInfos
  var _Invoices : MockInvoice[] as MockInvoices

  override function findPolicyPeriod() : PolicyPeriod {
    return PolicyPeriod.finder.findByPolicyNumberAndTerm(PolicyNumber, TermNumber).FirstResult
  }

  override property get Invoices() : BillingInvoiceInfo[] {
    return MockInvoices
  }

}
