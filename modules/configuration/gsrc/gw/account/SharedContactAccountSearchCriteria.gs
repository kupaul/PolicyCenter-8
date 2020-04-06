package gw.account
uses gw.api.database.Query
uses gw.api.database.IQueryBeanResult
uses gw.search.EntitySearchCriteria
uses gw.api.database.ISelectQueryBuilder

@Export
class SharedContactAccountSearchCriteria extends EntitySearchCriteria<AccountSummary> {

  // search for accounts related to this account number
  var _accountNumber : String as AccountNumber
  
  // whether to restrict this query to just the accounts visible to this user
  var _secure : boolean as Secure
  
  // contact roles to include in shared contact search
  property get SearchableSharedContactRoles() : typekey.AccountContactRole[] {
    return {typekey.AccountContactRole.TC_ACCOUNTHOLDER, typekey.AccountContactRole.TC_NAMEDINSURED}
  }
      
  function makeQuery() : ISelectQueryBuilder {
    // account contacts of the account to search for 
    var srcAccountContactQuery = makeAccountContactQuery() 
    var srcAccountTable = srcAccountContactQuery.join("Account")
    srcAccountTable.compare("AccountNumber", Equals, AccountNumber)
    
    // using AccountSummaryQueryBuilder's base query for producer code based security
    var accountSummaryQuery = new AccountSummaryQueryBuilder()
        .withProducerCodeSecurityFor(User.util.CurrentUser)
        .build()
    accountSummaryQuery.withDistinct(true)

    var accountContactQuery = makeAccountContactQuery()
    accountContactQuery.subselect("Contact", CompareIn, srcAccountContactQuery, "Contact")    
    accountSummaryQuery.subselect("ID", CompareIn, accountContactQuery, "Account")
    accountSummaryQuery.compare("AccountNumber", NotEquals, AccountNumber)
    
    return accountSummaryQuery
  }
  
  override protected function doSearch() : IQueryBeanResult<AccountSummary> {
    return makeQuery().select() as IQueryBeanResult<AccountSummary>
  }
  
  private function makeAccountContactQuery() : Query<AccountContact> {
    // query to get account contacts of an account,
    // only getting account contacts for roles we care about
    var accountContactQuery = new Query<AccountContact>(AccountContact)
    var accountContactRoleQuery = new Query<AccountContactRole>(AccountContactRole)
    accountContactRoleQuery.compareIn("Subtype", SearchableSharedContactRoles)
    accountContactQuery.subselect("ID", CompareIn, accountContactRoleQuery, "AccountContact")
    return accountContactQuery     
  }

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }

}
