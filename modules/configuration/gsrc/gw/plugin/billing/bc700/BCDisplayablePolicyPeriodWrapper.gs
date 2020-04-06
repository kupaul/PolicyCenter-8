package gw.plugin.billing.bc700

uses gw.pl.currency.MonetaryAmount
uses gw.plugin.billing.BillingInvoiceInfo
uses gw.plugin.billing.BillingPeriodInfo
uses gw.plugin.billing.BillingTermInfo
uses wsi.remote.gw.webservice.bc.bc700.billingsummaryapi.types.complex.DisplayablePolicyPeriod

uses java.lang.IllegalStateException
uses java.lang.Integer
uses java.util.Date

@Export
class BCDisplayablePolicyPeriodWrapper implements BillingPeriodInfo {
  var _period : DisplayablePolicyPeriod

  construct(soapObject : DisplayablePolicyPeriod) {
    _period = soapObject
  }

  override property get BillingMethod() : BillingMethod {
    return _period.BillingStatus.BillingMethodCode
  }

  override property get CurrentOutstanding() : MonetaryAmount {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get Delinquent() : Boolean {
    return _period.BillingStatus.Delinquent
  }

  override property get DepositRequirement() : MonetaryAmount {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get EffectiveDate() : Date {
    return _period.EffectiveDate
  }

  override property get ExpirationDate() : Date {
    return _period.ExpirationDate
  }

  override property get Invoices() : BillingInvoiceInfo[] {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get Paid() : MonetaryAmount {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get PastDue() : MonetaryAmount {
    return _period.BillingStatus.PastDue.ofDefaultCurrency()
  }

  override property get PaymentPlanName() : String {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get Periods() : String[] {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get PolicyTermInfos() : BillingTermInfo[] {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get PolicyNumber() : String {
    return _period.PolicyNumber
  }

  override property get Product() : String {
    return _period.Product
  }

  override property get TermNumber() : Integer {
    return _period.TermNumber
  }

  override property get TotalBilled() : MonetaryAmount {
    return _period.BillingStatus.TotalBilled.ofDefaultCurrency()
  }

  override property get TotalCharges() : MonetaryAmount {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get Unbilled() : MonetaryAmount {
    return _period.BillingStatus.Unbilled.ofDefaultCurrency()
  }

  override function findPolicyPeriod() : PolicyPeriod{
    return PolicyPeriod.finder
        .findByPolicyNumberAndTerm(this.PolicyNumber, this.TermNumber)
        .FirstResult
  }

  override property get AltBillingAccount() : String {
    return _period.AltBillingAccount
  }

  override property get InvoiceStream() : String {
    return _period.InvoiceStream
  }

  override property get OwningAccount() : String {
    return _period.OwningAccount
  }

  override property get PCPolicyPublicID(): String {
    // not exist in bc 700
    return null
  }
}
