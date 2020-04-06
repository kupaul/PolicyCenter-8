package gw.plugin.billing.impl
uses gw.plugin.billing.BillingPaymentInfo
uses java.lang.Integer

@Export
class MockBillingSettings implements BillingPaymentInfo
{
  var _PaymentMethod : AccountPaymentMethod as PaymentMethod
  var _InvoiceDeliveryMethod : InvoiceDeliveryMethod as InvoiceDeliveryMethod
  var _CreditCardIssuer : CreditCardIssuer as CreditCardIssuer
  var _CreditCardNumber : String as CreditCardNumber
  var _CreditCardExpMonth : Integer as CreditCardExpMonth
  var _CreditCardExpYear : Integer as CreditCardExpYear
  var _BankName : String as BankName
  var _BankABANumber : String as BankABANumber
  var _BankAccountNumber : String as BankAccountNumber
  var _BankAccountType : BankAccountType as BankAccountType
  
  construct()
  {
  }

}
