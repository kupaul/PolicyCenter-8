package gw.web.contact

uses gw.pl.currency.MonetaryAmount

uses java.util.Date
uses java.util.Set

/**
 * Collects the metrics for the Accounts associated with a Contact
 *      through a specific AccountContact Role.
 */
@Export
interface ContactMetrics {

  /**
   * The Contact.
   */
  property get Contact() : Contact

  /**
   * The AccountContactRole type.
   */
  property get Roles() : Set<Type<AccountContactRole>>

  /**
   * The 1st effective date for account policies associated with the Contact.
   */
  property get FirstEffectivePolicyDate() : Date


  /**
   * The number of active policies for the accounts associated with the Contact associated with the Contact.
   */
  property get ActivePoliciesCount() : int

  /**
   * The total in-force policy premiums for the accounts associated with
   *    the Contact.
   */
  property get TotalInForcePremium() : MonetaryAmount

  /**
   * True if any amounts had to be converted from a different currency.
   */
  property get TotalInForcePremiumConverted() : boolean

  /**
   * The number of accounts associated with the Contact.
   */
  property get AccountsCount() : int

  /**
   * The number of cancellations made by the customer for the account policies
   *    associated with the Contact.
   */
  property get CancellationsByCustomerCount() : int

  /**
   * The number of cancellations made by the carrier for non-payment
   *    for the account policies associated with the Contact.
   */
  property get CancellationsForNonPaymentCount() : int

  /**
   * The number of cancellations made by the carrier for other reasons
   *    for the account policies associated with the Contact.
   */
  property get OtherCancellationsCount() : int

  /**
   * The total lifetime premium for all policies of the accounts
   *    associated with the Contact.
   */
  property get TotalLifetimePremium() : MonetaryAmount

  /**
   * True if any amounts had to be converted from a different currency.
   */
  property get LifetimePremiumConverted() : boolean

  property get Jobs() : Job[]

  /**
   * The ClaimSet for the policies for the accounts associated with the Contact.
   */
  property get ClaimSet() : ClaimSet

  property get OpenClaimsCount() : int

  /**
   * The summation of TotalIncurred taken across all claims contained in ClaimSet
   */
  property get NetTotalIncurred() : MonetaryAmount

  /**
   * The total unbilled amount for the accounts associated with the Contact.
   */
  property get TotalUnbilled() : MonetaryAmount

  /**
   * The total currently billed amount for the accounts
   *    associated with the Contact.
   */
  property get TotalCurrentlyBilled() : MonetaryAmount

  /**
   * The total past due amount for the accounts associated with the Contact.
   */
  property get TotalPastDueBilled() : MonetaryAmount

  /**
   * The total outstanding billed amount for the accounts
   *    associated with the Contact.
   */
  property get TotalOutstandingBilled() : MonetaryAmount

  /**
  * True if any amounts had to be converted from a different currency.
  */
  property get BillingAmountsConverted() : boolean

  /**
   * Is Direct Bill Only?
   */
  property get DirectBillOnly() : boolean

  /**
   * The Alert messages based on the metrics.
   */
  property get Alerts() : List<String>
}
