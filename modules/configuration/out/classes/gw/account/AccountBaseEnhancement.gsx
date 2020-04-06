package gw.account

uses com.guidewire.pl.web.controller.UserDisplayableException
uses gw.api.database.IQueryResult
uses gw.api.database.Query
uses gw.pl.persistence.core.Bundle
uses java.lang.IllegalStateException
uses java.lang.RuntimeException
uses java.util.Date
uses gw.assignment.AssignmentUtil
uses gw.losshistory.ClaimSearchCriteria
uses java.util.ArrayList
uses gw.api.web.policy.ViewablePolicyPeriodQueryFilter
uses gw.api.policy.period.PolicyPeriodQueryFilters
uses gw.job.RewriteNewAccountQueryFilters
uses java.util.Set
uses gw.api.productmodel.Product
uses gw.api.util.DisplayableException
uses gw.address.AddressCopier
uses gw.api.util.RegionCurrencyMappingUtil
uses gw.api.util.CurrencyUtil
uses gw.api.system.PCLoggerCategory

enhancement AccountBaseEnhancement : Account {

  /**
   * Return an array of account locations, each of which is marked as active.
   */
  property get ActiveAccountLocations() : AccountLocation[] {
    return this.AccountLocations.where(\ loc -> loc.Active)
  }

  /**
   * Return a query result for all distinct AccountContactRole subtypes
   *    associated with this Account.
   */
  property get AccountContactRoleSubtypes() : IQueryResult<AccountContactRole, typekey.AccountContactRole> {
    /* the AccountContact roles are contained in the AccountContact's for an
     * Account; this query performs a reverse look-up through that relation
     * using a subselect restricted to the AccountContact's for the Account...
     */
    var roleQuery = Query.make(AccountContactRole)
    roleQuery.subselect("AccountContact", CompareIn, AccountContact, "ID")
      .compare("Account", Equals, this)
    return roleQuery.withDistinct(true).select(\ row -> row.Subtype)
  }

  /**
   * The contacts on the account that are candidates to be a PolicyNamedInsured.
   * These are the AccountHolder, Drivers, SecondaryContacts, and NamedInsureds.
   * Additionally, the contacts must a person, company, or either, if the policy's
   * product account type is "person", "company", or "any", respectively.
   *
   * The contacts are guaranteed to be unique.
   */
  function findPolicyNamedInsuredCandidates(aProduct : Product) : Set<AccountContact> {
    if (aProduct == null){
      throw "aProduct cannot be null"
    }
    return this.getAccountContactsWithAnyRole({"AccountHolder", "Driver", "SecondaryContact", "NamedInsured"})
      .where(\ ac -> aProduct.isContactTypeSuitableForProductAccountType(typeof ac.Contact))
      .toSet()
  }

  /**
   * Return all internal policies for this account
   */
  property get Policies() : Policy[] {
    var query = Query.make(Policy)
    query.compare(Policy#Account.PropertyInfo.Name, Equals, this)
    return query.select().toTypedArray()
  }

  /**
   * Finds the most recent periods of all policies which satisfy:
   * <ul>
   * <li>The Policy's most recent term's most recent period is expired (checks PeriodEnd column) OR</li>
   * <li>The Policy is eligible for rewrite:
   * <ul>
   * <li>The Policy's term's most recent periods are cancelled (for each term there must not exist a term in the future which is NOT canceled) AND</li>
   * <li>The Policy does not contain any open jobs</li>
   * </ul>
   * </li>
   * </ul>
   */
  function findPolicyPeriodsToRewrite() : List<PolicyPeriod> {
    var leftQuery = Query.make(PolicyPeriod)
    PolicyPeriodQueryFilters.inForce(leftQuery)

    // Check for expired periods
    leftQuery.compare("PeriodEnd", LessThanOrEquals, Date.CurrentDate)
    joinWithPolicyTableAndEnsurePolicyIsIssuedAndNotRewritten(leftQuery)

    var leftPolicyTermTable = leftQuery.join("PolicyTerm")
    leftPolicyTermTable.compare("MostRecentTerm", Equals, true)
    // Period's policy has no open jobs
    RewriteNewAccountQueryFilters.createSubselectHasNoActiveJobsExceptAudits(leftQuery)

    var rightQuery = Query.make(PolicyPeriod)
    PolicyPeriodQueryFilters.inForce(rightQuery)

    // Policy canceled (in force period has CancellationDate set)
    rightQuery.compare("CancellationDate", NotEquals, null)

    joinWithPolicyTableAndEnsurePolicyIsIssuedAndNotRewritten(rightQuery)
    // Period's policy has no open jobs (first subselect)
    RewriteNewAccountQueryFilters.createSubselectHasNoActiveJobsExceptAudits(rightQuery)
    // make sure that any term after current one is canceled (second subselect, more expensive)
    RewriteNewAccountQueryFilters.createSubselectForNextTermsAreCanceled(rightQuery)

    // union
    var query = leftQuery.union(rightQuery)
    var results = query.select()
    results.addFilter(new ViewablePolicyPeriodQueryFilter())
    return results.toList()
  }

  private function joinWithPolicyTableAndEnsurePolicyIsIssuedAndNotRewritten(query : Query<PolicyPeriod>) {
    var policyTable = query.join("Policy")
    // For a specific account
    policyTable.compare("Account", Equals, this.ID)
    // policy has to be issued
    policyTable.compare("IssueDate", NotEquals, null)
    policyTable.compare("RewrittenToNewAccountSourceJoin", Equals, null)
  }

  /**
   * Returns all policies for this account that are visible to the current user.
   */
  property get VisiblePolicies() : List<Policy> {
    /**
     *
     * Select pp.*
     *   from Policy p
     *   Join PolicyPeriod pp
     *     on pp.Policy = p.policy
     *   Join Account a
     *     on p.Account = a
     */
    var filter = new ViewablePolicyPeriodQueryFilter()
    var resultPolicies = new ArrayList<Policy>()
    for (p in Policies){
      if (p.Periods.hasMatch(\ pp -> filter.applyTypedFilter(pp))){
        resultPolicies.add(p)
      }
    }
    return resultPolicies
  }

  /**
   * Create and return a new Account with a brand new contact of the given type as the AccountHolder
   *
   * @param bundle - the bundle in which the account should be created
   * @param type - the specific type of contact ("company" or "person") to create
   * @return - the newly created account
   */
  static function createAccountForContactType(bundle : Bundle, type : ContactType) : Account {
    var contact : Contact
    if (type == "company") {
      contact = new Company(bundle)
    }
    else if (type == "person") {
      contact = new Person(bundle)
    }
    else {
      throw new RuntimeException(displaykey.Java.Account.UnsupportedContactSubtype)
    }
    return createAccountForContact(contact)
  }

  /**
   * Create a new Account with the given Contact as the AccountHolder
   * @param contact - the contact for which the account is to be created
   * @return the new account
   */
  static function createAccountForContact(contact : Contact) : Account {
    var account = new Account(contact.Bundle)
    account.changeAccountHolderTo(contact)
    if (contact.PrimaryAddress != null) {
      account.createPrimaryLocationFromMainContact()
    }
    var currency = RegionCurrencyMappingUtil.getCurrencyMappingForAddress(contact.PrimaryAddress)
    currency = currency ?: CurrencyUtil.getDefaultCurrency()
    contact.PreferredSettlementCurrency = contact.PreferredSettlementCurrency ?: currency
    account.PreferredCoverageCurrency = currency
    account.PreferredSettlementCurrency = currency
    account.createCustomHistoryEvent(CustomHistoryType.TC_ACCT_CREATED, \ -> displaykey.Account.History.AccountCreated)
    return account
  }

  /**
   * Add the given account location to this account; give the newly added account location the next
   * number in sequence.
   * @param location the account location to add
   */
  function addAndNumberAccountLocation(location : AccountLocation) {
    this.addToAccountLocations(location)
    this.LocationAutoNumberSeq.number(location,
        this.AccountLocations,
        entity.AccountLocation.Type.TypeInfo.getProperty("LocationNum"))
  }

  /**
   * Create an AccountLocation by using the information from the main contact.  The location is marked as primary.
   * The account location phone number is set to the primary phone of the contact.  The name of the account location is
   * set to the default value.
   * @return the primary location if it already exists or the newly created primary location
   */
  function createPrimaryLocationFromMainContact() : AccountLocation {
    if (this.PrimaryLocation != null) {
      return this.PrimaryLocation
    }

    var accountLocation = this.newLocation()
    copyPrimaryAddressInformationToAccountLocation(accountLocation)
    this.PrimaryLocation = accountLocation
    return accountLocation
  }

  /**
   * Modify the PrimaryLocation by using the information from the main contact.
   * The account location phone number is set to the primary phone of the contact.  The name of the account location is
   * set to the default value.
   */
  function modifyPrimaryLocationFromMainContact() {
    var accountLocation = this.PrimaryLocation
    if (accountLocation == null) {
      return
    }
    copyPrimaryAddressInformationToAccountLocation(accountLocation)
  }

  private function copyPrimaryAddressInformationToAccountLocation(accountLocation : AccountLocation) {
    var mainContact = this.AccountHolder
    if (mainContact == null) {
      throw new IllegalStateException(displaykey.Account.PrimaryLocation.Error.NoMainContact)
    }

    var contact = mainContact.AccountContact.Contact
    var primaryAddress = contact.PrimaryAddress
    if (primaryAddress == null) {
      throw new IllegalStateException(displaykey.Account.PrimaryLocation.Error.NoPrimaryAddress)
    }

    new AddressCopier(primaryAddress).copyInto(accountLocation)
    accountLocation.Phone = contact.getPrimaryPhoneValue()
  }

  /**
   * Return a ClaimSearchCriteria that can be used to search for claims.
   * @return a new ClaimSearchCriteria
   */
  function getNewClaimSearchCriteria() : ClaimSearchCriteria {
    var criteria = new ClaimSearchCriteria()
    criteria.Account = this
    criteria.DateCriteria.StartDate = Date.Today.addYears(-1)
    criteria.DateCriteria.EndDate = Date.Today
    criteria.DateCriteria.DateSearchType = "enteredrange"
    return criteria
  }

  /**
   * Change the account holder for this account to the given contact.
   * @param the contact that will become the new account holder
   */
  function changeAccountHolderTo(contact : Contact) {
    if (this.AccountHolder.AccountContact.Contact != contact) {
      // only possible when the Account is brand new
      if (this.AccountHolder != null) {
        this.createCustomHistoryEvent(CustomHistoryType.TC_ACCT_CHANGED, \ -> displaykey.Account.History.AccountHolderChanged, this.AccountHolderContact.DisplayName, contact.DisplayName)
        this.AccountHolder.remove()
      }
      var acctContact = this.maybeAddNewAccountContact(contact)
      acctContact.addNewRole("AccountHolder")
      this.updateAccountHolderContact()
    }
  }

  /**
   * Remove the given AccountLocation from the account, unless it is in use (in which case an
   * exception is thrown)
   * @param location - the account location to remove from the account
   */
  function removeLocation(location : AccountLocation) {
    if (not location.InUse) {
      this.removeFromAccountLocations(location)
    } else {
      throw new DisplayableException(displaykey.Web.AccountLocation.CannotRemoveBecauseInUse(location))
    }
  }

  /**
   * Create a new activity that is assigned to the user with the given role on this policy.
   * If the producer cannot be assigned the activity, assign to DefaultUser.
   *
   * @return The created activity
   */
  function createRoleActivity( role : typekey.UserRole, pattern : ActivityPattern, subject : String,
                               description : String, user : User) : Activity {
    // Most of these arguments are null since the ActivityPattern config will set their default values
    var activity = pattern.createAccountActivity( this.Bundle, pattern, this, subject, description, null, null, null, null, null )

    var roleAssignment = this.getUserRoleAssignment(user, role)
    if (roleAssignment != null) {
      if (not activity.assign( roleAssignment.AssignedGroup, roleAssignment.AssignedUser )) {
        PCLoggerCategory.ACCOUNT_API.warn(role + " was unable to be assigned to activity: " + roleAssignment.AssignedUser +
                          ".  Assigning to Default User.")
        activity.assign( AssignmentUtil.DefaultUser.DefaultAssignmentGroup, AssignmentUtil.DefaultUser )
      }
    }
    return activity
  }

  /**
   * Returns all related accounts from both this account's SourceRelatedAccounts and
   * TargetRelatedAccounts arrays. Each relationship is wrapped in an {@link AccountRelationship}
   * object to provide easier access to the related accounts. If user agrument is supplied, the returned
   * array will be filtered to contain relationships only for accounts which given user has access permissions to.
   *
   * @param user user whose access permissions will be used to filter related accounts.
   * @return an array of all source and target account relationships for this account.
   */
  function getAllRelationships(user : User) : AccountRelationship[] {
    return this.getAllRelatedAccounts(user).map(\ a -> a.getRelationship(this))
  }

  /**
   * Adds a new {@link AccountAccount} to this account's SourceRelatedAccounts array, representing
   * a relationship of type "relationshipType" from this account to "relatedAccount".
   *
   * @param relationshipType the type of the relationship.
   * @param relatedAccount the target account of the relationship.
   * @return the AccountAccount added to represent this relationship.
   */
  function addRelationship(relationshipType : AccountRelationshipType, relatedAccount : Account) : AccountAccount {
    var accountAccount = new AccountAccount()
    accountAccount.RelationshipType = relationshipType
    accountAccount.TargetAccount = relatedAccount
    this.addToSourceRelatedAccounts(accountAccount)
    return accountAccount
  }

  /**
   * Creates and returns a new {@link History} related to this account. The new history will have appropriate fields
   * set, a Type of "Custom" and a CustomType, PolicyTerm, Job, and Description taken from the method arguments. The
   * "description" argument is a block that returns a String so the history description can be localized based on the
   * policy's PrimaryLanguage. Any of all of the arguments may be null.
   *
   * @param type History event type
   * @param policyTerm PolicyTerm to store with the event
   * @param policyJob Job to store with the event
   * @param description History event comment
   * @return the created history
   */
  function createCustomHistoryEvent(type : CustomHistoryType, policyTerm : PolicyTerm, policyJob : Job, description : block() : String) : History {
    var history = this.createCustomHistoryEvent(type, description)
    history.PolicyTerm = policyTerm
    history.Job = policyJob
    return history
  }

  /**
   * Move specified policies from the specified account to this account.
   *
   * @param fromAccount The account from which to move the policies
   * @param policyPeriods An array of policy periods identifying the policies
   *                      to be moved
   */
  function movePoliciesFrom(fromAccount : Account, policyPeriods :PolicyPeriod[]) {
    validateAccountHolderSuitableForPoliciesProductType(policyPeriods, displaykey.Web.AccountFile.MovePolicies.Move)
    var policiesToMove = policyPeriods.map(\ pp -> pp.Policy)
    this.transferPolicies(policiesToMove, fromAccount)
    var historyDesc : String
    var relatedJob : Job
    var relatedPolicy : PolicyTerm

    for (p in policiesToMove) {
      p.MovedPolicySourceAccount = fromAccount
      if (p.BoundPeriods.Count > 0) {
        historyDesc = displaykey.Account.MovePolicies.History.Policy(p.LatestBoundPeriod.PolicyNumber, fromAccount.AccountNumber, this.AccountNumber)
        relatedJob = null
        relatedPolicy =  p.LatestBoundPeriod.PolicyTerm
      } else {
        relatedJob = p.Jobs.where(\ j -> not j.Complete).maxBy(\ j -> j.CreateTime)
        historyDesc = displaykey.Account.MovePolicies.History.Job(relatedJob, fromAccount.AccountNumber, this.AccountNumber)
        relatedPolicy =  null
      }
      this.createCustomHistoryEvent(CustomHistoryType.TC_POLICY_MOVED, relatedPolicy, relatedJob, \ -> historyDesc)
      fromAccount.createCustomHistoryEvent(CustomHistoryType.TC_POLICY_MOVED, \ -> historyDesc)
    }
  }

  /**
   * Make the Account active.
   *
   * This sets the account status "Active" if its current status belongs to the
   * "CanActivate" typefilter.
   *
   * @throws IllegalStateException if current status does not belong to
   *         "CanActivate" filter
   */
  function makeActive() {
    if (not typekey.AccountStatus.TF_CANACTIVATE.TypeKeys.contains(this.AccountStatus)) {
      throw new IllegalStateException("Cannot make account ${this} active from AccountStatus ${this.AccountStatus}")
    }
    if (this.AccountStatus == "Pending") {
      this.createCustomHistoryEvent(CustomHistoryType.TC_ACCT_CHANGED, \ -> displaykey.Account.History.Status.PendingToActive)
    }
    this.AccountStatus = "Active"
  }

  /**
   * Used primarily in the UI, this method finds an account by its <code>accountNumber</code> and returns it.
   * It throws a <code>DisplayableException</code> if the accountNumber is not empty, but no account is found
   * for it, or if the account fails to pass the check.
   *
   * @param accountNumber The number of the account to find.  Return null if empty (which occurs during
   *                      pebbles page loading).
   *
   * @param check A block to run additional checks (typically permission checks) on the found account.
   *
   */
  static function checkedFindByNumber(accountNumber : String, check(account : Account) : boolean) : Account {
    if (String.isEmpty(accountNumber)) {
      return null
    }
    var ret = Account.finder.findAccountByAccountNumber(accountNumber)
    if (ret != null and check(ret)) {
      return ret
    }
    throw new gw.api.util.DisplayableException(displaykey.Web.NewSubmission.Error.InvalidAccountNumber(accountNumber))
  }

  /**
   * Validate the account holder to make sure it's suitable for all the policy periods. Typical case is for example the personal auto policy
   * should not be allowed to moved to a company account.
   * This funtion will throw UserDisplayableException if the account is not suitable for any of the policy
   *
   * @param policyPeriods The policy periods we would like to validate against the account holder
   * @param typeOfActivity This is used for constructing the exception message if the account is not suitable for any of the policy period
   */
  function validateAccountHolderSuitableForPoliciesProductType(policyPeriods :PolicyPeriod[], typeOfActivity : String) {
    var accountHolderContactType = typeof this.AccountHolder.AccountContact.Contact
    for (period in policyPeriods) {
      if (!period.Policy.Product.isContactTypeSuitableForProductAccountType(accountHolderContactType)) {
        throw new UserDisplayableException(displaykey.Account.MovePolicies.Error.NotSuitableAccountType(typeOfActivity, period.PolicyNumber, accountHolderContactType.RelativeName, period.Policy.Product))
      }
    }
  }

  /**
   * Checks that the current user has permission to modify the latest bound period on each policy in the victim account.
   * If so, the victim account is considered mergeable and then the mergeWithAccount in java is called.
   * Once this completes successfully a history event is added to the surviving account.
   *
   * @param victimAccount The account that is to be merged into the surviving(this) account
   */
  function mergeWithAccountAndCreateHistoryEvent(victimAccount: Account){
    try{
      var victimPolicies = Policy.finder.findLocalPoliciesByAccount(victimAccount)
      victimPolicies.each(\ p -> {
        var period = p.LatestBoundPeriod
        if(period <> null and not perm.PolicyPeriod.change(p.LatestBoundPeriod)){
          throw new gw.api.util.DisplayableException(displaykey.Account.MergeAccounts.InsufficientPermissionsOnPolicies)
        }
      })
      //save victim account info before merging it
      var victimAccountNumber = victimAccount.AccountNumber
      var accountHolderName = victimAccount.AccountHolder.AccountContact.DisplayName
      this.mergeWithAccount(victimAccount)
      //history event not added to the surviving account in the base code
      this.createCustomHistoryEvent(CustomHistoryType.TC_ACCT_MERGED , \ -> displaykey.Account.History.AccountMerged(victimAccountNumber,
        accountHolderName))
      this.Bundle.commit()
    }
    catch(e: java.lang.Exception){
      throw new gw.api.util.DisplayableException(e.Message)
    }
  }
}
