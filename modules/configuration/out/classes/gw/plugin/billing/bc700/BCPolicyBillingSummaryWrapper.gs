package gw.plugin.billing.bc700

uses gw.api.database.Query
uses gw.pl.currency.MonetaryAmount
uses gw.plugin.billing.BillingInvoiceInfo
uses gw.plugin.billing.BillingPeriodInfo
uses gw.plugin.billing.BillingPeriodInfo.PolicyTermInfo
uses gw.plugin.billing.BillingTermInfo
uses wsi.remote.gw.webservice.bc.bc700.billingsummaryapi.types.complex.PolicyBillingSummary

uses java.lang.IllegalStateException
uses java.lang.Integer
uses java.util.Date

@Export
class BCPolicyBillingSummaryWrapper implements BillingPeriodInfo {
  var _soapObject : PolicyBillingSummary
  var _policyNumber : String
  var _termNumber : int
  var _policyTermInfos : BillingTermInfo[]

  construct(soapObject : PolicyBillingSummary, policyNumber : String, termNumber : int) {
    _soapObject = soapObject
    _policyNumber = policyNumber
    _termNumber = termNumber
    _policyTermInfos = findPolicyTermInfos()
  }
  
  override property get BillingMethod() : BillingMethod {
    if (_soapObject.BillingStatus == null) return null
    return _soapObject.BillingStatus.BillingMethodCode
  }

  override property get CurrentOutstanding() : MonetaryAmount {
    if (_soapObject.CurrentOutstanding == null) return null
    return _soapObject.CurrentOutstanding.ofDefaultCurrency()
  }

  override property get Delinquent() : Boolean {
    return _soapObject.BillingStatus.Delinquent
  }

  override property get DepositRequirement() : MonetaryAmount {
    if (_soapObject.DepositRequirement == null) return null
    return _soapObject.DepositRequirement.ofDefaultCurrency()
  }

  override property get EffectiveDate() : Date {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get ExpirationDate() : Date {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get Invoices() : BillingInvoiceInfo[] {
    return _soapObject.Invoices.Entry*.$TypeInstance.map(\ p -> new BCInvoiceInfoWrapper(p))
  }

  override property get Paid() : MonetaryAmount {
    if (_soapObject.Paid == null) return null
    return _soapObject.Paid.ofDefaultCurrency()
  }

  override property get PastDue() : MonetaryAmount {
    var billingStatus = _soapObject.BillingStatus
    if (billingStatus == null or billingStatus.PastDue == null) return null
    return billingStatus.PastDue.ofDefaultCurrency()
  }

  override property get PaymentPlanName() : String {
    return _soapObject.PaymentPlanName
  }

  override property get Periods() : String[] {
    return _soapObject.Periods.Entry.toTypedArray()
  }

  override property get PolicyTermInfos() : BillingTermInfo[] {
    return _policyTermInfos
  }

  override property get PolicyNumber() : String {
    return _policyNumber
  }

  override property get Product() : String {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get TermNumber() : Integer {
    return _termNumber
  }

  override property get TotalBilled() : MonetaryAmount {
    var billingStatus = _soapObject.BillingStatus
    if (billingStatus == null or billingStatus.TotalBilled == null) return null
    return billingStatus.TotalBilled.ofDefaultCurrency()
  }

  override property get TotalCharges() : MonetaryAmount {
    if (_soapObject.TotalCharges == null) return null
    return _soapObject.TotalCharges.ofDefaultCurrency()
  }

  override property get Unbilled() : MonetaryAmount {
    var billingStatus = _soapObject.BillingStatus
    if (billingStatus == null or billingStatus.Unbilled == null) return null
    return billingStatus.Unbilled.ofDefaultCurrency()
  }

  override final function findPolicyPeriod() : PolicyPeriod {
    return PolicyPeriod.finder
        .findByPolicyNumberAndTerm(this.PolicyNumber, this.TermNumber)
        .FirstResult
  }

  override property get AltBillingAccount() : String {
    return _soapObject.AltBillingAccount
  }

  override property get InvoiceStream() : String {
    return _soapObject.InvoiceStream
  }

  override property get OwningAccount() : String {
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

  override property get PCPolicyPublicID(): String {
    return null
    // not exist in bc 700
  }

  private function findPolicyTermInfos() : BillingTermInfo[] {
    final var query = Query.make(PolicyPeriod)
    query.compare(PolicyPeriod#Policy, Equals, findPolicyPeriod().Policy)
    query.compare(PolicyPeriod#MostRecentModel, Equals, true)
    return query.select(\ row ->
            new PolicyTermInfo(row.PolicyNumber, row.TermNumber,
                row.EditEffectiveDate, row.CancellationDate?:row.PeriodEnd))
        .orderBy(\ row -> row.EditEffectiveDate)
        .toTypedArray()
  }
}
