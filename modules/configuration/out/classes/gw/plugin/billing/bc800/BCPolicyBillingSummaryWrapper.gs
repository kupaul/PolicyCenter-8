package gw.plugin.billing.bc800

uses gw.pl.currency.MonetaryAmount
uses gw.plugin.billing.BillingInvoiceInfo
uses gw.plugin.billing.BillingPeriodInfo
uses gw.plugin.billing.BillingPeriodInfo.PolicyTermInfo
uses gw.plugin.billing.BillingTermInfo
uses wsi.remote.gw.webservice.bc.bc800.billingsummaryapi.types.complex.PolicyBillingSummary

uses java.lang.IllegalStateException
uses java.lang.Integer
uses java.util.Date

@Export
final class BCPolicyBillingSummaryWrapper implements BillingPeriodInfo {
  var _soapObject : PolicyBillingSummary
  var _policyNumber : String
  var _termNumber : int
  var _policyTermInfos : BillingTermInfo[]

  construct(soapObject : PolicyBillingSummary, policyNumber : String, termNumber : int) {
    _soapObject = soapObject
    _policyNumber = policyNumber
    _termNumber = termNumber
    _policyTermInfos = _soapObject.PolicyTermInfos.Entry*.$TypeInstance
        .map(\ termInfo -> new PolicyTermInfo(
            termInfo.PolicyNumber, termInfo.TermNumber,
                termInfo.EffectiveDate, termInfo.ExpirationDate)
    )
  }
  
  override property get BillingMethod() : BillingMethod {
    return _soapObject.BillingStatus.BillingMethodCode
  }

  override property get CurrentOutstanding() : MonetaryAmount {
    return _soapObject.CurrentOutstanding
  }

  override property get Delinquent() : Boolean {
    return _soapObject.BillingStatus.Delinquent
  }

  override property get DepositRequirement() : MonetaryAmount {
    return _soapObject.DepositRequirement
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
    return _soapObject.Paid
  }

  override property get PastDue() : MonetaryAmount {
    return _soapObject.BillingStatus.PastDue
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
    return _soapObject.BillingStatus.TotalBilled
  }

  override property get TotalCharges() : MonetaryAmount {
    return _soapObject.TotalCharges
  }

  override property get Unbilled() : MonetaryAmount {
    return _soapObject.BillingStatus.Unbilled
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
    throw new IllegalStateException("This field is not applicable for this soap object.")
  }

}
