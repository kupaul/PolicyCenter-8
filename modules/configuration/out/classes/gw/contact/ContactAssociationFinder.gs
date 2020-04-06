package gw.contact

uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.QueryRestrictor
uses gw.api.database.Relop
uses gw.api.policy.period.PolicyPeriodQueryFilters
uses gw.api.productmodel.Product
uses gw.api.util.DisplayableException
uses gw.api.web.policy.ViewablePolicyPeriodQueryFilter

uses gw.plugin.billing.BillingAccountInfo
uses gw.plugin.Plugins
uses gw.plugin.billing.IBillingSummaryPlugin
uses gw.plugin.billing.IBillingSystemPlugin

uses java.lang.IllegalArgumentException
uses java.util.ArrayList
uses java.util.HashMap
uses java.util.Map
uses gw.plugin.billing.BCAccountBillingDisplayTotals

@Export
class ContactAssociationFinder {
  var _contact : Contact

  /**
   * Represents a billing-system account, to support LVs of accounts for a particular contact.
   * Stores information about the remote account, the local account number, and a String
   * describing the Roles through which the account is linked to the contact.
   */
  class ExternalBillingAccount {
    private var _accountNumber : String as readonly AccountNumber
    /** comma-separated list of the types of roles through which we found the accounts */
    private var _roles : String as readonly Roles
    private var _externalAccountNumber : String as readonly ExternalAccountNumber
    private var _billingAccountInfos: BCAccountBillingDisplayTotals as readonly BillingAccountDisplayTotals
  }

  construct(contact : Contact) {
    _contact = contact
  }

  /**
   * Return a list of associated Accounts.
   *
   * @return the array of Accounts
   */
  public function findAccounts() : Account[] {
    var accounts = _contact.AccountContacts*.Account
    return accounts
  }

  public function findPolicyPeriods() : List<PolicyPeriod> {
    var pcrQuery = Query.make(PolicyPeriod)
    pcrQuery.compare("modelnumber", Relop.NotEquals, null)
    var policyContactRoleTable = pcrQuery.join(PolicyContactRole, "BranchValue")
    policyContactRoleTable.compare("ContactDenorm", Equals, _contact)
    pcrQuery.withDistinct(true)
    
    // A second query to get periods related to the contact of the Primary Named Insured 
    // since fully archived policies will not have a PolicyContactRole to query
    var pniContactDenormQuery = Query.make(PolicyPeriod)
    pniContactDenormQuery.compare("modelnumber", Relop.NotEquals, null)
    pniContactDenormQuery.compare("PNIContactDenorm", Equals, _contact)
    PolicyPeriodQueryFilters.boundInForce(pniContactDenormQuery)
    new ViewablePolicyPeriodQueryFilter().filterNewQuery(pniContactDenormQuery)
    pniContactDenormQuery.withDistinct(true)
    
    var unionQuery = pcrQuery.union(pniContactDenormQuery)

    var periods = new ArrayList<PolicyPeriod>()
    for(p in unionQuery.select()){
      if(perm.PolicyPeriod.view(p)){
        periods.add(p)
      }
    }
    return periods
  }

  /**
   * Determine the list of AccountHolders and BillingContacts associated with the input contact and
   * returns a map of [account Number]->[account roles].
   */
  public function createTopLevelAccountToRolesMap() : Map<String,String> {
    var accountToRoleListMap = Query.make(AccountContactRole)
                   .join("AccountContact")
                   .compare("Contact",Equals, _contact)
                   .select()
                   .toList()
                   .partition(\ a -> a.AccountContact.Account)
    accountToRoleListMap.retainWhereKeys(\ a -> User.util.CurrentUser.canView(a))

    var result = new HashMap<String,String>()
    for (account in accountToRoleListMap.Keys) {
      if (accountToRoleListMap[account].countWhere(\ a -> a typeis AccountHolder or a typeis BillingContact) > 0) {
        var roles = accountToRoleListMap[account].map(\ a -> (typeof a).DisplayName).sort().join(", ")
        result.put(account.AccountNumber, roles)
      }
    }
    return result
  }

  /**
   * Returns a List of BillingAccount instances, each one representing an account in the
   * billing system whose corresponding PolicyCenter Account is linked to the specified
   * Contact.
   *
   * It works by first creating BillingAccounts for all of the local Accounts
   * linked to the specified Contact with either the AccountHolder or BillingContact roles.
   * As it constructs that list, it sets up each BillingAccount instance with information
   * queried from the billing system. Then, for each of those (local) Accounts' account
   * numbers, it queries the billing system for any sub-account numbers, and then inserts
   * into the result List instances of BillingAccount for those remote accounts, querying
   * the remote system again to set up each one.
   */
  public function findHeldAndBilledExternalAccounts(topLevelAccountToRolesMap : Map<String,String>) : List<ExternalBillingAccount> {
    var topLevelAccountList = new ArrayList<ExternalBillingAccount>()
    topLevelAccountToRolesMap.eachKeyAndValue(\ accountNumber, roles -> {
      var billingActInfo = getBillingAccountInfo(accountNumber)
      if (billingActInfo != null) {
        topLevelAccountList.add(new ExternalBillingAccount() {
                                  :_accountNumber = accountNumber,
                                  :_roles = roles,
                                  :_externalAccountNumber = accountNumber,
                                  :_billingAccountInfos = new BCAccountBillingDisplayTotals(billingActInfo,
                                      _contact.PreferredSettlementCurrency)
                                })
      }
    })

    var result = new ArrayList<ExternalBillingAccount>()
    for (ba in topLevelAccountList) {
      result.add(ba)
      var subActNumList = getSubAccountNumbers(ba.AccountNumber)
      if (subActNumList != null) {
        subActNumList.each(\ s -> {
          var billingActInfo = getBillingAccountInfo(s)
          if (billingActInfo!=null) {
            result.add(new ExternalBillingAccount() {
                         :_accountNumber = ba.AccountNumber,
                         :_roles = ba.Roles,
                         :_externalAccountNumber = s,
                         :_billingAccountInfos = new BCAccountBillingDisplayTotals(billingActInfo,
                             _contact.PreferredSettlementCurrency)
                      })
          }
        })
      }
    }
    return result
  }

  public function findLatestBoundPolicyPeriods() : List<PolicyPeriod> {
    var pcrQuery = Query.make(PolicyPeriod)
    var policyContactRoleTable = pcrQuery.join(PolicyContactRole, "BranchValue")
    // Grab policies that are related to the contact
    policyContactRoleTable.compare("ContactDenorm", Equals, _contact)
    // Filter for bound and In Force policy periods
    PolicyPeriodQueryFilters.boundInForce(pcrQuery)
    // Filter for current user
    new ViewablePolicyPeriodQueryFilter().filterNewQuery(pcrQuery)
    pcrQuery.withDistinct(true)
    
    // A second query to get periods related to the contact of the Primary Named Insured 
    // since fully archived policies will not have a PolicyContactRole to query
    var pniContactDenormQuery = Query.make(PolicyPeriod)
    pniContactDenormQuery.compare("PNIContactDenorm", Equals, _contact)
    PolicyPeriodQueryFilters.boundInForce(pniContactDenormQuery)
    new ViewablePolicyPeriodQueryFilter().filterNewQuery(pniContactDenormQuery)
    pniContactDenormQuery.withDistinct(true)
    
    var unionQuery = pcrQuery.union(pniContactDenormQuery)

    var results = unionQuery.select().toList()

    // First partition by Policy ( map[policy]->[period1,period2,...]
    var policyToPeriodListMap = results.partition(\ p -> {return p.Policy})   
    // For each policy, pick out the latest period
    return policyToPeriodListMap.Values.flatMap<PolicyPeriod>(\ l -> {
      return {l.sortByDescending(\p -> p.PeriodStart).first()}})
  }

  /**
   * Gets all non Locked work orders whose current period is related to the contact.
   *
   * @param status Policy period status to filter on.  If null, do not filter by status
   * @return non Locked work orders whose current period is related to the contact and whose status is
   * equal to the param status.  If the param status == null, do not filter by status
   */
  public function findWorkOrders(status : PolicyPeriodStatus) : IQueryBeanResult<Job> {
    var query = Query.make(Job)
    var policyPeriodTable = query.join(PolicyPeriod, "Job")
    policyPeriodTable.compare("Locked", Relop.Equals, Boolean.FALSE)
    if (status != null) {
      policyPeriodTable.compare("Status", Equals, status)
    }
    var policyContactRoleTable = policyPeriodTable.join(PolicyContactRole, "BranchValue")
    policyContactRoleTable.compare("ContactDenorm", Equals, _contact)
    query.withDistinct(true)

    return query.select()
  }

  /**
   * Gets all work orders whose current period is related to the contact.
   *
   * @param completeJobsOnly null if don't care, True for only complete jobs, False for only non-complete jobs
   * @param jobType          the type of job that must be matched, or null for any type of job
   * @param product          the product which must be matched, or null for any product
   * @param user             the user whoes permission will be used, or null to ignore permission
   * @return work orders whose current period is related to the contact
   */
  public function findWorkOrders(completedJobsOnly : Boolean, jobType : typekey.Job, product : Product, user : User) : Job[] {
    var jobQuery = Query.make(Job)  

    var restrictor : QueryRestrictor =  null
    if (user != null) {
      restrictor = addRestrictor(restrictor, Job.restrictors.satisfiesSecurityForUser(user))
    }
    if (completedJobsOnly != null) {
      if (completedJobsOnly) {
        restrictor = addRestrictor(restrictor, Job.restrictors.closed())
      } else {
        restrictor = addRestrictor(restrictor, Job.restrictors.open())
      }
    }
    if (jobType != null) {
      restrictor = addRestrictor(restrictor, Job.restrictors.ofTypes({jobType}))
    }
    if (product != null) {
      restrictor = addRestrictor(restrictor, Job.restrictors.ofProduct(product))
    }

    var policyPeriodTable = jobQuery.join(PolicyPeriod, "Job")
    policyPeriodTable.compare("ArchiveState", Equals, null)
    var policyContactRoleTable = policyPeriodTable.join(PolicyContactRole, "BranchValue")
    policyContactRoleTable.compare("ContactDenorm", Equals, _contact)
    jobQuery.withDistinct(true)
    
    var pniContactDenormQuery = Query.make(Job)
    var pniPolicyPeriodTable = pniContactDenormQuery.join(PolicyPeriod, "Job")
    pniPolicyPeriodTable.compare("ArchiveState", NotEquals, null)
    pniPolicyPeriodTable.compare("PNIContactDenorm", Equals, _contact)
    pniContactDenormQuery.withDistinct(true)
    
    var unionQuery = jobQuery.union(pniContactDenormQuery)
    if (restrictor != null) {
      restrictor.restrictOn(unionQuery)
    }
    return unionQuery.select().toList() as entity.Job[]
  }

  private static function addRestrictor(baseRestrictor : QueryRestrictor, restrictorToAdd : QueryRestrictor) : QueryRestrictor {
    if (null==restrictorToAdd) {
      throw new IllegalArgumentException("Must provide restrictor to add.")
    }
    if (null==baseRestrictor) {
      baseRestrictor = restrictorToAdd
    } else {
      baseRestrictor = baseRestrictor.with(restrictorToAdd)
    }
    return baseRestrictor
  }

  private static function getBillingAccountInfo(accountNumber : String) : BillingAccountInfo[] {
    try {
      return Plugins.get(IBillingSummaryPlugin).retrieveAccountBillingSummaries(accountNumber)
    } catch (e : DisplayableException) {
      gw.api.util.LocationUtil.addRequestScopedErrorMessage(e.LocalizedMessage)
      return null
    }
  }

  private static function getSubAccountNumbers(accountNumber : String) : List<String> {
    try {
      return Plugins.get(IBillingSystemPlugin).getSubAccounts(accountNumber).map(\ g -> g.AccountNumber).toList()
    } catch (e : DisplayableException) {
      gw.api.util.LocationUtil.addRequestScopedErrorMessage(e.LocalizedMessage)
      return null
    }
  }

}
