package gw.account
uses gw.search.EntityQueryBuilder
uses gw.api.database.ISelectQueryBuilder
uses gw.api.domain.SecureSearchGateway
uses gw.api.database.Table
uses gw.contact.ContactQueryBuilder
uses gw.search.StringColumnRestrictor

/**
 * Base query builder for Account and AccountSummary.
 */
@Export
abstract class AccountQueryBuilderBase<T extends KeyableBean, B extends AccountQueryBuilderBase<T, B>> extends EntityQueryBuilder<T>{
  // account
  var _accountHolderContact : ContactQueryBuilder
  var _accountNumber : String
  var _accountNumberRestrictor : StringColumnRestrictor
  var _accountOrgType : AccountOrgType
  var _accountStatus : AccountStatus
  var _frozen : Boolean
  var _industryCode : IndustryCode
  var _originationDate : DateTime
  var _primaryLanguage : LanguageType

  // relationships to other accounts
  var _excludedAccount : Account
  var _relatedTo : Account
  
  // producer codes and security
  var _producer : Organization
  var _producerCode : ProducerCode
  var _producerCodeSecurityUser : User

  function withAccountHolderContact(value : ContactQueryBuilder) : B {
    _accountHolderContact = value
    return this as B
  }
  
  function withAccountNumber(value : String) : B {
    withAccountNumberRestricted(value, Equals)
    return this as B
  }

  function withAccountNumberRestricted(value : String, restrictor : StringColumnRestrictor) : B {
    _accountNumber = value
    _accountNumberRestrictor = restrictor
    return this as B
  }

  function withAccountOrgType(value : AccountOrgType) : B {
    _accountOrgType = value
    return this as B
  }

  function withAccountStatus(value : AccountStatus) : B {
    _accountStatus = value
    return this as B
  }

  function withFrozen(value : Boolean) : B {
    _frozen = value
    return this as B
  }
  
  function withIndustryCode(value : IndustryCode) : B {
    _industryCode = value
    return this as B
  }

  function withOriginationDate(value : DateTime) : B {
    _originationDate = value
    return this as B
  }

  function withPrimaryLanguage(value : LanguageType) : B {
    _primaryLanguage = value
    return this as B
  }
  
  function withExcludedAccount(value : Account) : B {
    _excludedAccount = value
    return this as B
  }

  function withRelatedTo(value : Account) : B {
    _relatedTo = value
    return this as B
  }

  function withProducer(value : Organization) : B {
    _producer = value
    return this as B
  }

  function withProducerCode(value : ProducerCode) : B {
    _producerCode = value
    return this as B
  }

  function withProducerCodeSecurityFor(value : User) : B {
    _producerCodeSecurityUser = value
    return this as B
  }
  
  override protected function doRestrictQuery(selectQueryBuilder : ISelectQueryBuilder) {
    if (ShouldAddAccountHolderContactRestrictions) {
      addAccountHolderContactRestrictions(selectQueryBuilder)
    }
    if (_accountNumber != null) {
      _accountNumberRestrictor.restrict(selectQueryBuilder, Account#AccountNumber.PropertyInfo.Name, _accountNumber)
    }
    if (_accountOrgType != null) {
      selectQueryBuilder.compare(Account#AccountOrgType.PropertyInfo.Name, Equals, _accountOrgType)
    }
    if (_accountStatus != null) {
      selectQueryBuilder.compare(Account#AccountStatus.PropertyInfo.Name, Equals, _accountStatus)
    }
    if (_frozen != null) {
      selectQueryBuilder.compare(Account#Frozen.PropertyInfo.Name, Equals, _frozen)
    }
    if (_industryCode != null) {
      selectQueryBuilder.compare(Account#IndustryCode.PropertyInfo.Name, Equals, _industryCode)
    }
    if (_originationDate != null) {
      selectQueryBuilder.compare(Account#OriginationDate.PropertyInfo.Name, Equals, _originationDate)
    }
    if (_primaryLanguage != null) {
      selectQueryBuilder.compare(Account#PrimaryLanguage.PropertyInfo.Name, Equals, _primaryLanguage)
    }
    if (_excludedAccount != null) {
      selectQueryBuilder.compare(Account#ID.PropertyInfo.Name, NotEquals, _excludedAccount)
    }
    if (_relatedTo != null) {
      var relatedAccountKeys = _relatedTo.SourceRelatedAccounts*.TargetAccount*.ID.union(_relatedTo.TargetRelatedAccounts*.SourceAccount*.ID).toSet()
      selectQueryBuilder.compareIn(Account#ID.PropertyInfo.Name, relatedAccountKeys.toTypedArray())
    }
    if (ShouldAddProducerCodeRestrictions) {
      addProducerCodeRestrictions(selectQueryBuilder)
    }
}
  
  protected property get ShouldAddProducerCodeRestrictions() : boolean {
    return _producerCodeSecurityUser.UseProducerCodeSecurity or _producer != null or _producerCode != null
  }
  
  protected function addProducerCodeRestrictions(selectQueryBuilder : ISelectQueryBuilder) {
    var accountProducerCodeTable : Table
    if (_producerCodeSecurityUser.UseProducerCodeSecurity) {
      accountProducerCodeTable = addProducerCodeSecurityRestriction(selectQueryBuilder)
      if (accountProducerCodeTable == null) {
        selectQueryBuilder.forceEmpty()  // returns empty, even if our selectQueryBuilder is only a component in another query
        return
      }
    }
    if (_producer != null || _producerCode != null) {
      accountProducerCodeTable = accountProducerCodeTable ?: selectQueryBuilder.join(AccountProducerCode, AccountProducerCode#Account.PropertyInfo.Name)
      addProducerRestriction(accountProducerCodeTable)
      addProducerCodeRestriction(accountProducerCodeTable)
    }
  }
  
  /**
   * Restrict the query to accounts that the user is allowed to view through producer-code security
   * and then return the resulting AccountProducerCode table.  If the user has no producer codes to
   * view accounts, return null.
   */
  private function addProducerCodeSecurityRestriction(selectQueryBuilder : ISelectQueryBuilder) : Table {
    var producerCodeSet = SecureSearchGateway.getProducerCodesForAccountView(_producerCodeSecurityUser)
    if (producerCodeSet.Empty) {
      return null
    }
    
    var producerCodes = producerCodeSet.toArray(new ProducerCode[producerCodeSet.size()])
    // If we check PCoR as well, the query is a little more complicated because we want to see if
    // the policyperiod has the producer codes at the Policy level OR the PolicyPeriod level.
    var accountProducerCodeTable = selectQueryBuilder.subselect(Account#ID.PropertyInfo.Name, CompareIn, AccountProducerCode, AccountProducerCode#Account.PropertyInfo.Name)
    accountProducerCodeTable.compareIn(AccountProducerCode#ProducerCode.PropertyInfo.Name, producerCodes)
    return accountProducerCodeTable
  }
  
  private function addProducerRestriction(accountProducerCodeTable : Table) {
    if (_producer != null) {
      var producerCodeTable = accountProducerCodeTable.join(AccountProducerCode#ProducerCode.PropertyInfo.Name)
      producerCodeTable.compare(ProducerCode#Organization.PropertyInfo.Name, Equals, _producer)
    }
  }

  private function addProducerCodeRestriction(accountProducerCodeTable : Table) {
    if (_producerCode != null) {
      accountProducerCodeTable.compare(AccountProducerCode#ProducerCode.PropertyInfo.Name, Equals, _producerCode)
    }
  }

  protected property get ShouldAddAccountHolderContactRestrictions() : boolean {
    return _accountHolderContact != null
  }
  
  protected function addAccountHolderContactRestrictions(selectQueryBuilder : ISelectQueryBuilder) {
      var contactTable = selectQueryBuilder.join(Account#AccountHolderContact.PropertyInfo.Name)
      _accountHolderContact.restrictQuery(contactTable)
  }
  
}
