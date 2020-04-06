package gw.web.contact

uses gw.api.database. *
uses gw.api.policy.period.PolicyPeriodQueryFilters
uses gw.api.util.MultiCurrencySummation
uses gw.api.web.filter.NewQueryBasedQueryFilter
uses gw.api.web.policy.ViewablePolicyPeriodQueryFilter
uses gw.job.RewriteNewAccountQueryFilters
uses gw.pl.currency.MonetaryAmount
uses gw.util.Pair

uses java.math.BigDecimal
uses java.util.Date
uses java.util.Map
uses java.util.Set

/**
 * Implements the helper that provides access to various policy metrics
 * associated with a specified contact who has a role (e.g., account holder)
 * in a set of specified roles.
 *
 * Used by the ContactMetrics implementation.
 */
@Export
class AccountHolderPolicyMetrics {

  static final var _instance : AccountHolderPolicyMetrics as readonly Instance = new AccountHolderPolicyMetrics()

  internal static final var CANCELLATION_MONTHS_SINCE : int = 12

  /**
   * Return the first policy effective date
   *    for the specified account contact and role types.
   */
  function firstEffectivePolicyDateFor(contact : Contact, roles : Set<Type<AccountContactRole>>) : Date {
    return policiesQueryFor(contact, roles).select(\ p -> DBFunction.Min(p.OriginalEffectiveDate)).single()
  }

  /**
   * Return the count of active (in-force and scheduled) policies
   *    for the specified account contact and role types.
   */
  function countActivePoliciesFor(contact : Contact, roles : Set<Type<AccountContactRole>>) : int {
    return activePoliciesQueryFor(contact, roles).select().Count
  }

  /**
   * Returns the summation (total) of the in-force policy premiums
   *    for the specified account contact and role type.
   *
   * Note: If the specified contact is <em>not</em> an account holder,
   * this will return null.
   *
   * @param contact The contact that will have its Total Premium RPT calculated.
   * @param roles The roles the contact holds for this account
   * @return The sum of the Total Premium RPT of the most recently bound periods
   * of all visible policies contained in all of accounts where the contact is
   * the specified role
   */
  function sumInForcePremiumFor(contact : Contact, roles : Set<Type<AccountContactRole>>, currency : Currency) : MonetaryAmountCalculationResult {
    var activePolicies = activePoliciesQueryFor(contact, roles).select()
    var amounts = activePolicies.map( \ policy -> {
      var period = policy.findLastCoveredPeriod()
      if ( ( period != null )
          and ( period.getCoverageEndDate() >= Date.CurrentDate ) ) {
        return period.TotalPremiumRPT
      }
      return 0bd.ofCurrency(currency)
    })
    var summedAmounts = amounts.sumDifferentCurriences(currency)
    return new MonetaryAmountCalculationResult(summedAmounts, containsDifferentCurrency(currency, amounts))
  }

  /**
   * Returns the count of accounts associated with
   *    the specified account contact and role type.
   *
   * @param contact The contact that all accounts link to
   * @param roles The roles the contact holds for the accounts
   * @return The number of accounts where the specified role is
   * held by the contact
   */
  function countAccountsFor(contact : Contact, roles : Set<Type<AccountContactRole>>) : int {
    /* Note: Do not use contact.AccountHolderCount, which is absolute
     * and does not take access security by the user into account...
     */
    return linkedAccountsQueryFor(contact, roles).select().Count
  }

  /**
   * Returns a query result of the open jobs for the policies of the accounts
   *    associated with the specified account contact and role type.
   *
   * @return A query result of the open jobs.
   * @param contact The account contact with which the accounts are associated.
   * @param roles The account contact roles that associates the contact with the account.
   */
  function openJobResultsFor(contact : Contact, roles : Set<Type<AccountContactRole>>)
      : IQueryBeanResult<Job> {
    var restrictor : QueryRestrictor =  null
    var user = User.util.CurrentUser
    var queryJob = Query.make(Job)

    restrictor = Job.restrictors.open() // open jobs...
    if ( user != null ) {
      // restrict by permissions for user...
      restrictor = restrictor.with(Job.restrictors.satisfiesSecurityForUser(user))
    }
    restrictor.restrictOn(queryJob)

    queryJob.subselect("Policy", CompareIn, policiesQueryFor(contact, roles), "ID")

    return queryJob.select()
  }

  /**
   * Returns the query for the cancellations
   *    for the specified account contact and role types.
   */
  function cancellationsResultFor(contact: Contact, roles : Set<Type<AccountContactRole>>)
      : IQueryBeanResult<Cancellation> {
    var queryPolicies = Query.make(Policy)
    var queryAccounts = queryPolicies.subselect("Account", CompareIn, Account, "ID")
            as ISelectQueryBuilder<Account>
    restrictAccountsByUserSecurity(queryAccounts, contact, roles)

    var queryJobs = Query.make(Cancellation)
    queryJobs.subselect("Policy", CompareIn, queryPolicies, "ID")

    /* include _all_ Cancellations within the last x months... */
    queryJobs.compare("CreateTime", GreaterThan, Date.Today.addMonths(-CANCELLATION_MONTHS_SINCE))

    var user = User.util.CurrentUser
    if ( user != null ) {
      // restrict by permissions for user...
      Job.restrictors.satisfiesSecurityForUser(user).restrictOn(queryJobs)
    }

    return queryJobs.select()
  }

  /**
   * Return a query for the Accounts associated with the specified contact
   *    by the specified role.
   *
   * @param contact The contact to whom which all returned accounts link
   * @param roles The roles by which the contact links to the returned accounts
   *
   * @return A query for the accounts where the specified role is held by
   *            the contact.
   */
  function linkedAccountsQueryFor(contact : Contact, roles : Set<Type<AccountContactRole>>)
          : Query<Account> {
    var queryAccounts = Query.make(Account)

    restrictAccountsByUserSecurity(queryAccounts, contact, roles)
    return queryAccounts
  }

  function activePoliciesQueryFor(contact : Contact, roles : Set<Type<AccountContactRole>>)
          : Query<Policy> {
    var queryPolicies = policiesQueryFor(contact, roles)

    /* EXISTS on PolicyPeriods that are visible */
    var queryPeriods = Query.make(PolicyPeriod)

    //qryPeriods.compare("ModelNumber", NotEquals, null) // bound periods...
    new ViewablePolicyPeriodQueryFilter().filterNewQuery(queryPeriods)

    var today = Date.Today
    queryPeriods.or(\ rt ->
        rt.and(\ innerRestriction -> {
              innerRestriction.compare("CancellationDate", Equals, null).compare("PeriodEnd", GreaterThanOrEquals, today)
           })
           .and(\ innerRestriction -> {
              innerRestriction.compare("CancellationDate", NotEquals, queryPeriods.getColumnRef("PeriodStart"))
                .compare("CancellationDate", GreaterThanOrEquals, today)
           })
    )

    PolicyPeriodQueryFilters.inForce(queryPeriods)
    RewriteNewAccountQueryFilters.createSubselectForNextTermsAreCanceled(queryPeriods)

    queryPolicies.subselect("ID", CompareIn, queryPeriods, "Policy")

    return queryPolicies
  }

  function activePolicyPeriodsQueryFor(contact : Contact, roles : Set<Type<AccountContactRole>>)
          : Query<PolicyPeriod> {

    var queryPeriods = Query.make(PolicyPeriod)

    var policies = queryPeriods.join("Policy") as ISelectQueryBuilder<Policy>
    restrictPolicies(contact, roles, policies)

    new ViewablePolicyPeriodQueryFilter().filterNewQuery(queryPeriods)

    queryPeriods.or(\ rt ->
        rt.compare("CancellationDate", Equals, null)
            .compare("CancellationDate", NotEquals,
                queryPeriods.getColumnRef("PeriodStart")))

    PolicyPeriodQueryFilters.inForce(queryPeriods)

    return queryPeriods
  }

  function policiesQueryFor(contact : Contact, roles : Set<Type<AccountContactRole>>)
      : Query<Policy> {
    var queryPolicies = Query.make(Policy)

    var queryAccounts = queryPolicies.join("Account") as ISelectQueryBuilder<Account>
    restrictAccountsByUserSecurity(queryAccounts, contact, roles)

    return queryPolicies
  }

  /**
   * @param contact The contact that will have its Lifetime Premium RPT calculated.
   * @param role The role the contact holds for this account
   * @return The sum of the Total Premium RPT of all latest (in model time) bound periods
   * of all visible policies contained in all of accounts where the contact is
   * the specified role.
   */
  function calculateLifetimePremium(contact : Contact, roles : Set<Type<AccountContactRole>>, currency : Currency) : MonetaryAmountCalculationResult {
    // calculate sum of prior premiums (aggregate) by currency
    // (for the specified contact and role) and reduce to map
    // of sums of prior premiums by currency)
    var sumsOfPriorPremiums : Map<Currency, BigDecimal> = {}
    activePoliciesQueryFor(contact, roles).select(\ p -> {
        return new Pair<Currency, BigDecimal>(p.PriorPremiums_cur, DBFunction.Sum(p.PriorPremiums_amt))
      }).reduce<Map<Currency, BigDecimal>>(sumsOfPriorPremiums, \ v, h -> {
        v.put(h.First, h.Second)
        return v
      })
    var sumHolder = new MultiCurrencySummation(sumsOfPriorPremiums)

    // calculate sum of total premium RPT (aggregate) by currency
    // (for the specified contact and role) and reduce to map
    // of sums of total premium RPT by currency)
    var sumsOfTotalPremiumRPT : Map<Currency, BigDecimal> = {}
    activePolicyPeriodsQueryFor(contact, roles).select(\ period ->
        new Pair<Currency, BigDecimal>(period.TotalPremiumRPT_cur, DBFunction.Sum(period.TotalPremiumRPT_amt)))
      .reduce<Map<Currency, BigDecimal>>(sumsOfTotalPremiumRPT, \ v, h -> {
        v.put(h.First, h.Second)
        return v
      })

    sumHolder.add(sumsOfTotalPremiumRPT)
    var usesConvertedAmounts = containsDifferentCurrency(currency, sumsOfPriorPremiums)
                                or containsDifferentCurrency(currency, sumsOfTotalPremiumRPT)
    return new MonetaryAmountCalculationResult(sumHolder.sum(currency), usesConvertedAmounts)
  }

  private function containsDifferentCurrency(currency : Currency, sums : Map<Currency, BigDecimal>) : boolean {
    return sums.Keys.hasMatch( \ cur -> cur != null and cur != currency)
  }

  private function containsDifferentCurrency(currency : Currency, sums : List<MonetaryAmount>) : boolean {
    return sums.hasMatch( \ sum -> sum.Currency != null and sum.Currency != currency)
  }

  /**
   * Defines filters for cancelled policy metrics.
   *
   * The policy metrics for cancellations are:
   *    1) Cancellations by the customer (Source = Insured)
   *    2) Cancellations by the carrier for Non-Payment
   *    3) Cancellations by the carrier for other reasons,
   *        i.e., anything other than Non-Payment, Policy rewritten (mid-term),
   *        or Policy rewriten or replaced (flat cancel).
   */
  static class CancellationsFilter extends NewQueryBasedQueryFilter<Cancellation> {
    var _cancelSource : CancellationSource
    var _ignoredReasons : ReasonCode[]

    /**
     * List of Carrier Cancellation Reasons to be ignored when filtering for
     * "other cancellation reasons".
     */
    static final var IgnoredCancellationReasons =
        new ReasonCode[] {"Nonpayment", "FlatRewrite", "MidtermRewrite"}

    static function cancellationsByCustomer() : CancellationsFilter {
      var filter = new CancellationsFilter()

      filter._cancelSource = "Insured"
      filter._ignoredReasons = null

      return filter
    }

    static function cancellationsForNonPayment() : CancellationsFilter {
      var filter = new CancellationsFilter()

      filter._cancelSource = "Carrier"
      filter._ignoredReasons = null

      return filter
    }

    static function otherCancellations() : CancellationsFilter {
      var filter = new CancellationsFilter()

      filter._cancelSource = "Carrier"
      filter._ignoredReasons = IgnoredCancellationReasons

      return filter
    }

    /**
     * Filter and count the number of cancellations matching the filter
     *    in the cancellations result.
     */
    static function countCancellationsBy(cancellations : IQueryBeanResult<Cancellation>,
        filter : CancellationsFilter) : int {
      cancellations.clearFilters()
      cancellations.addFilter(filter)

      return cancellations.Count
    }

    override function applyTypedFilter(cancellation : Cancellation) : boolean {
      return ( cancellation.Source == _cancelSource )
          and ( _cancelSource == "Insured" )
            /* Carrier... */
            or ( ( ( _ignoredReasons == null )
              and ( cancellation.CancelReasonCode == "Nonpayment" ) )
                or not _ignoredReasons.contains(cancellation.CancelReasonCode) )
    }

    override function filterNewQuery(cancellations : IQuery<Cancellation>) : IQuery<Cancellation> {
      var query = cancellations as Query<Cancellation>

      query.compare("Source", Equals, _cancelSource)
      if ( _cancelSource == "Carrier" ) {
        if ( _ignoredReasons == null ) {
          query.compare("CancelReasonCode", Equals, "Nonpayment" as ReasonCode)
        } else {
          query.compareNotIn("CancelReasonCode", _ignoredReasons)
        }
      }
      return query
    }
  }

  /**
   * Takes a query on Policy, joins with the Account Table, and then restricts the query
   * using restrictAccount.
   */
  private function restrictPolicies(contact : Contact, roles : Set<Type<AccountContactRole>>,
      policies : ISelectQueryBuilder<Policy>) {
    var accounts = policies.join("Account") as ISelectQueryBuilder<Account>
    restrictAccounts(accounts, contact, roles)
  }

  /**
   * Restrict a query builder on an Account to those with producer codes
   * the current user has security permission to access.
   */
  private function restrictAccountsByUserSecurity(accounts : ISelectQueryBuilder<Account>,
          contact : Contact, roles : Set<Type<AccountContactRole>>) {
    // restrict by permissions for user...
    var restrictor : QueryRestrictor = Account.restrictors.satisfiesSecurityForUser(User.util.CurrentUser)
    restrictor.restrictOn(accounts)
    restrictAccounts(accounts, contact, roles)
  }

  /**
   * Restrict a query builder on an Account to those associated with
   *    the specified contact by the specified role.
   */
  private function restrictAccounts(accounts : ISelectQueryBuilder<Account>,
          contact : Contact, roles : Set<Type<AccountContactRole>>) {
    if ( ( roles.Count == 1 ) and ( roles.single() == AccountHolder ) ) {
      /* use de-normalized AccountHolderContact... */
      accounts.compare("AccountHolderContact", Equals, contact)
    } else {
      /* EXISTS on Account.AccountContacts correlated by Account for contact... */
      var accountContact = accounts.subselect("ID", CompareIn, AccountContact, "Account")
      accountContact.compare("Contact", Equals, contact)
      /* EXISTS on AccountContact.Roles
       *  correlated by AccountContact for Role type...
       */
      var accountContactRoleTable = accountContact.join(AccountContactRole, "AccountContact")
      accountContactRoleTable.compareIn("Subtype", roles.map(\ r -> r.SubtypeTypeKey) as Object[])
    }
  }

  public static class MonetaryAmountCalculationResult {
    var _amount : MonetaryAmount as readonly CalculatedAmount
    var _converted : boolean as readonly IsConverted

    private construct(amount : MonetaryAmount, converted : boolean) {
      _amount = amount
      _converted = converted
    }
  }
}