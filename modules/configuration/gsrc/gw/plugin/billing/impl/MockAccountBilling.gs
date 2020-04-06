package gw.plugin.billing.impl

uses gw.plugin.billing.BillingAccountInfo
uses gw.plugin.billing.BillingPaymentInfo
uses gw.plugin.billing.BillingContactInfo
uses gw.pl.currency.MonetaryAmount

@Export
class MockAccountBilling implements BillingAccountInfo
{
  var _BilledOutstandingTotal : MonetaryAmount as BilledOutstandingTotal
  var _BilledOutstandingCurrent : MonetaryAmount as BilledOutstandingCurrent
  var _BilledOutstandingPastDue : MonetaryAmount as BilledOutstandingPastDue
  var _UnbilledTotal : MonetaryAmount as UnbilledTotal
  var _UnappliedFundsTotal : MonetaryAmount as UnappliedFundsTotal
  var _CollateralRequirement : MonetaryAmount as CollateralRequirement
  var _CollateralHeld : MonetaryAmount as CollateralHeld
  var _CollateralChargesBilled : MonetaryAmount as CollateralChargesBilled
  var _CollateralChargesPastDue : MonetaryAmount as CollateralChargesPastDue
  var _CollateralChargesUnbilled : MonetaryAmount as CollateralChargesUnbilled
  var _Delinquent : boolean as Delinquent
  var _AccountName : String as AccountName
  var _AccountNameKanji : String as AccountNameKanji
  var _BillingSettings : MockBillingSettings as MockBillingSettings
  var _PrimaryPayer : MockBillingContact as MockPrimaryPayer
  var _currency : Currency as BillingCurrency

  override property get BillingSettings() : BillingPaymentInfo {
    return MockBillingSettings
  }
  
  override property get PrimaryPayer() : BillingContactInfo {
    return MockPrimaryPayer
  }
}
