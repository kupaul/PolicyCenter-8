package gw.plugin.billing

/**
 * Billing payment instrument
 */
@Export
class BillingPaymentInstrumentImpl implements BillingPaymentInstrument {
  /**
   * The public id
   */
  var _policyID : String as PublicID
  /**
   * The payment method
   */
  var _paymentMethod : AccountPaymentMethod as PaymentMethod
  /**
   * The display name
   */
  var _displayName : String as DisplayName
  /**
   * True if single use only
   */
  var _oneTime : Boolean as OneTime
  /**
   * The token
   */
  var _token : String as Token
  
  
  construct() {
  }
}
