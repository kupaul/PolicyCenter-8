package gw.plugin.billing.bc700

uses gw.plugin.billing.BillingAccountInfo
uses wsi.remote.gw.webservice.bc.bc700.billingsummaryapi.types.complex.BCPCAccountBillingSummary
uses gw.plugin.billing.BillingPaymentInfo
uses gw.plugin.billing.BillingContactInfo
uses gw.pl.currency.MonetaryAmount
uses gw.api.util.CurrencyUtil

@Export
class BCAccountBillingSummaryWrapper implements BillingAccountInfo {
  var _soapObject : BCPCAccountBillingSummary

  construct(o : BCPCAccountBillingSummary) {
    _soapObject = o
  }

  override property get BilledOutstandingCurrent() : MonetaryAmount {
    return _soapObject.BilledOutstandingCurrent.ofDefaultCurrency()
  }

  override property get BilledOutstandingPastDue() : MonetaryAmount {
    return _soapObject.BilledOutstandingPastDue.ofDefaultCurrency()
  }

  override property get BilledOutstandingTotal() : MonetaryAmount {
    return _soapObject.BilledOutstandingTotal.ofDefaultCurrency()
  }

  override property get BillingSettings() : BillingPaymentInfo {
    return new BCAccountBillingSettingsWrapper(_soapObject.BillingSettings.$TypeInstance)
  }

  override property get CollateralChargesBilled() : MonetaryAmount {
    return _soapObject.CollateralChargesBilled.ofDefaultCurrency()
  }

  override property get CollateralChargesPastDue() : MonetaryAmount {
    return _soapObject.CollateralChargesPastDue.ofDefaultCurrency()
  }

  override property get CollateralChargesUnbilled() : MonetaryAmount {
    return _soapObject.CollateralChargesUnbilled.ofDefaultCurrency()
  }

  override property get CollateralHeld() : MonetaryAmount {
    return _soapObject.CollateralHeld.ofDefaultCurrency()
  }

  override property get CollateralRequirement() : MonetaryAmount {
    return _soapObject.CollateralRequirement.ofDefaultCurrency()
  }

  override property get Delinquent() : boolean {
    return _soapObject.Delinquent
  }

  override property get UnappliedFundsTotal() : MonetaryAmount {
    return _soapObject.UnappliedFundsTotal.ofDefaultCurrency()
  }

  override property get UnbilledTotal() : MonetaryAmount {
    return _soapObject.UnbilledTotal.ofDefaultCurrency()
  }

  override property get PrimaryPayer() : BillingContactInfo {
    return new BCContactSummaryWrapper(_soapObject.PrimaryPayer)
  }

  override property get AccountName() : String {
    return _soapObject.AccountName
  }

  override property get AccountNameKanji(): String {
    return null
    // not available for bc 700
  }

  override property get BillingCurrency(): Currency {
    return CurrencyUtil.getDefaultCurrency()
  }
}
