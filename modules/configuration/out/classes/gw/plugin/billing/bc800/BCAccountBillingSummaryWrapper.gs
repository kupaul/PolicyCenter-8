package gw.plugin.billing.bc800

uses gw.plugin.billing.BillingAccountInfo
uses wsi.remote.gw.webservice.bc.bc800.billingsummaryapi.types.complex.BCPCAccountBillingSummary
uses gw.plugin.billing.BillingPaymentInfo
uses gw.plugin.billing.BillingContactInfo
uses gw.pl.currency.MonetaryAmount

@Export
class BCAccountBillingSummaryWrapper implements BillingAccountInfo {
  var _soapObject : BCPCAccountBillingSummary

  construct(o : BCPCAccountBillingSummary) {
    _soapObject = o
  }

  override property get BilledOutstandingCurrent() : MonetaryAmount {
    return _soapObject.BilledOutstandingCurrent
  }

  override property get BilledOutstandingPastDue() : MonetaryAmount {
    return _soapObject.BilledOutstandingPastDue
  }

  override property get BilledOutstandingTotal() : MonetaryAmount {
    return _soapObject.BilledOutstandingTotal
  }

  override property get BillingSettings() : BillingPaymentInfo {
    return new BCAccountBillingSettingsWrapper(_soapObject.BillingSettings.$TypeInstance)
  }

  override property get CollateralChargesBilled() : MonetaryAmount {
    return _soapObject.CollateralChargesBilled
  }

  override property get CollateralChargesPastDue() : MonetaryAmount {
    return _soapObject.CollateralChargesPastDue
  }

  override property get CollateralChargesUnbilled() : MonetaryAmount {
    return _soapObject.CollateralChargesUnbilled
  }

  override property get CollateralHeld() : MonetaryAmount {
    return _soapObject.CollateralHeld
  }

  override property get CollateralRequirement() : MonetaryAmount {
    return _soapObject.CollateralRequirement
  }

  override property get Delinquent() : boolean {
    return _soapObject.Delinquent
  }

  override property get UnappliedFundsTotal() : MonetaryAmount {
    return _soapObject.UnappliedFundsTotal
  }

  override property get UnbilledTotal() : MonetaryAmount {
    return _soapObject.UnbilledTotal
  }

  override property get PrimaryPayer() : BillingContactInfo {
    return new BCContactSummaryWrapper(_soapObject.PrimaryPayer)
  }

  override property get AccountName() : String {
    return _soapObject.AccountName
  }

  override property get AccountNameKanji(): String {
    return _soapObject.AccountNameKanji
  }

  override property get BillingCurrency(): Currency {
    return Currency.get(_soapObject.Currency.name())
  }
}
