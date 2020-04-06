package gw.webservice.pc.pc700.account

uses gw.api.database.EmptyQuery
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.api.database.Table
uses gw.search.NameCriteria

uses java.util.Date
uses java.util.HashSet
uses java.util.Set
uses gw.api.database.Relop
uses gw.api.domain.SecureSearchGateway
uses gw.search.EntitySearchCriteria

/**
 * This is the AccountSearchCriteria created in PolicyCenter 7.0.x.  It was renamed
 * and replaced with the gw.account.AccountSearchCriteria.gs in PolicyCenter 8.0.
 * Ideally, this class would have been deprecated, but it is used by the
 * AccountSearchCriteriaModel.gx which is in turn used by the 7.0 AccountAPI, and
 * GX models do not operate on deprecated classes.
 * @see gw.account.AccountSearchCriteria
 */
@Export
//todo: mark this class as @Deprecated("As of 8.0 use gw.webservice.pc.pc800.account.AccountSearchInfo instead")
final class AccountSearchCriteria700 extends EntitySearchCriteria<AccountSummary> {
  var _addressLine1 : String as AddressLine1
  var _addressLine2 : String as AddressLine2
  var _addressAutoFill : AddressAutofillEntity
  var _secure : boolean as Secure
  var _accountStatus : AccountStatus as AccountStatus
  var _accountNumber : String as AccountNumber
  var _producer : Organization as Producer
  var _producerCode : ProducerCode as ProducerCode
  var _phone : String as Phone
  var _nameCriteria : gw.search.NameCriteria as NameCriteria
  var _excludedAccount : Account as ExcludedAccount
  var _relatedTo : Account as RelatedTo
  var _industryCode : IndustryCode as IndustryCode
  var _accountOrgType : AccountOrgType as AccountOrgType
  var _originationDate : Date as OriginationDate
  var _primaryLanguage : LanguageType as PrimaryLanguage

  var _restrictedSearch : boolean    // configuration for search behavior from UI; set by constructor

  construct() {
    this(false)
  }

  construct(restrictedSearch : boolean) {
    NameCriteria = new NameCriteria()
    _addressAutoFill = new AddressAutofillEntity()
    _restrictedSearch = restrictedSearch
    if (_restrictedSearch) {
      NameCriteria.FirstNameExact = true
      NameCriteria.LastNameExact = true
      NameCriteria.CompanyNameExact = true
    }
  }

  //Going forward we want search to be based on any phone number, not just work phone
  //But changing the name of the property will break api compatibility. So for now we
  //retain the old name
  @Deprecated("Replaced with the Phone property in PolicyCenter 7.0.3")
  property get WorkPhone() : String {
    return _phone;
  }

  @Deprecated("Replaced with the Phone property in PolicyCenter 7.0.3")
  property set WorkPhone(val : String) {
    _phone = val;
  }

  property get AddressAutofill() : AddressAutofillEntity {
    return _addressAutoFill
  }

  property get City() : String {
    return _addressAutoFill.City
  }

  property set City(value : String) {
    _addressAutoFill.City = value
  }

  property get CityKanji() : String {
    return _addressAutoFill.CityKanji
  }

  property set CityKanji(value : String) {
    _addressAutoFill.CityKanji = value
  }

  property get County() : String {
    return _addressAutoFill.County
  }

  property set County(value : String) {
    _addressAutoFill.County = value
  }

  property get State() : State {
    return _addressAutoFill.State
  }

  property set State(value : State) {
    _addressAutoFill.State = value
  }

  property get Country() : Country {
    return _addressAutoFill.Country
  }

  property set Country(value : Country) {
    _addressAutoFill.Country = value
  }

  property get PostalCode() : String {
    return _addressAutoFill.PostalCode
  }

  property set PostalCode(value : String) {
    _addressAutoFill.PostalCode = value
  }

  function buildAccountQuery() : Query<Account> {
    var accountQuery = new Query<Account>(Account)
    return buildQuery(accountQuery) as Query<Account>
  }

  function buildAccountSummaryQuery() : Query<AccountSummary> {
    var accountSummaryQuery = new Query<AccountSummary>(AccountSummary)
    return buildQuery(accountSummaryQuery) as Query<AccountSummary>
  }

  private function buildQuery(baseQuery : Query) : Query{
    var accountProducerCodeTable : Table = null

    // ProducerCode-based security
    if (isSecure()) {
      var user = User.util.CurrentUser
      if (user != null and user.isUseProducerCodeSecurity()) {
        var producerCodeSet = SecureSearchGateway.getProducerCodesForAccountView(user)
        if (producerCodeSet.isEmpty()) {
          //return an empty query because there aren't any producer codes available to allow security check to succeed
          return new EmptyQuery(baseQuery.getEntityType())
        }
        var producerCodes = producerCodeSet.toArray(new ProducerCode[producerCodeSet.size()])
        // If we check PCoR as well, the query is a little more complicated because we want to see if
        // the policyperiod has the producer codes at the Policy level OR the PolicyPeriod level.

        accountProducerCodeTable = baseQuery.subselect("ID", CompareIn, AccountProducerCode, "Account")
        accountProducerCodeTable.compareIn("ProducerCode", producerCodes)
      }
    }

    baseQuery.compare("Frozen", Equals, Boolean.FALSE)

    if (AccountStatus != null) {
      baseQuery.compare("AccountStatus", Equals, AccountStatus)
    }

    if ( AccountNumber.NotBlank ) {
      baseQuery.compare("AccountNumber", Equals, AccountNumber)
    }

    if (Producer != null || ProducerCode != null) {
      if (accountProducerCodeTable == null) {
        accountProducerCodeTable = baseQuery.join(AccountProducerCode, "Account")
      }

      if (Producer != null) {
        var producerCodeTable = accountProducerCodeTable.join(AccountProducerCode, "ProducerCode")
        producerCodeTable.compare("Organization", Equals, Producer)
      }

      if (ProducerCode != null) {
        accountProducerCodeTable.compare("ProducerCode", Equals, ProducerCode)
      }
    }

    var hasNameCriteria = NameCriteria.isSet()
    var hasAddressCriteria = isAddressFieldsSet()
    var hasCityStateZip = isCityStateZipSet()
    var hasPhoneCriteria = Phone.NotBlank
    if (hasNameCriteria || hasCityStateZip || hasAddressCriteria || hasPhoneCriteria) {
      var contactTable = getContactTable(baseQuery)
      if (hasPhoneCriteria) {
        contactTable.compare("WorkPhone", Relop.Equals, Phone)
      }
      if (hasCityStateZip) {
        if ( City.NotBlank ) {
          contactTable.startsWith("CityDenorm", City, true)
        }
        if (State != null) {
          contactTable.compare("State", Equals, State)
        }
        if ( PostalCode.NotBlank ) {
          contactTable.startsWith("PostalCodeDenorm", PostalCode, true)
        }
      }
      if (hasAddressCriteria) {
        var addressTable = contactTable.subselect("PrimaryAddress", CompareIn, Address, "ID")
        if ( AddressLine1.NotBlank ) {
          addressTable.compare("AddressLine1", Equals, AddressLine1)
        }
        if ( AddressLine2.NotBlank ) {
          addressTable.compare("AddressLine2", Equals, AddressLine2)
        }
        if ( County.NotBlank ) {
          addressTable.startsWith("County", County, true)
        }
        if (Country != null) {
          addressTable.compare("Country", Equals, Country)
        }
      }
    }
    if (ExcludedAccount != null) {
      baseQuery.compare("ID", NotEquals, ExcludedAccount)
    }

    if (RelatedTo != null) {
      baseQuery.compareIn("ID", getRelatedAccountKeys(RelatedTo).toTypedArray())
    }

    return baseQuery
  }

  protected static function getRelatedAccountKeys(account : Account) : Set<Key> {
    var ret = new HashSet<Key>()
    var sourceRelatedAccounts = account.getSourceRelatedAccounts()
    for (sourceRelatedAccount in sourceRelatedAccounts) {
      ret.add(sourceRelatedAccount.TargetAccount.ID)
    }
    var targetRelatedAccounts = account.getTargetRelatedAccounts()
    for (targetRelatedAccount in targetRelatedAccounts) {
      ret.add(targetRelatedAccount.SourceAccount.ID)
    }
    return ret
  }

  private function getContactTable(baseQuery : Query) : Table<Contact> {
    var contactTable = NameCriteria.addJoin(baseQuery, "AccountHolderContact")
    contactTable.compare("AccountHolderCount", GreaterThan, 0)
    return contactTable
  }

  private function isAddressFieldsSet() : boolean {
    return AddressLine1.NotBlank
        || AddressLine2.NotBlank
        || County.NotBlank
        || ( Country != null )
  }

  private function isCityStateZipSet() : boolean {
        return City.NotBlank
        || ( State != null )
        || PostalCode.NotBlank
  }


  override property get InvalidSearchCriteriaMessage() : String {
    if (_nameCriteria.CompanyName.NotBlank && (_nameCriteria.FirstName.NotBlank || _nameCriteria.LastName.NotBlank)) {
      return displaykey.Web.AccountSearch.CannotSpecifyBothPersonAndCompany
    }
    return null
  }

  override  property get MinimumSearchCriteriaMessage() : String {
    return checkMinimumSearchCriteria() ? null : displaykey.Web.AccountSearch.MinimumSearchCriteriaRequirement
  }

  /**
   * Returns true if the search criteria specifies enough of the right fields
   *    with the right minimum lengths to perform an efficient search;
   *    false otherwise
   */
  //A search criteria is sufficent if :
  //Any of the following are present :
  //  * TaxID
  //  * account number
  //  * work phone
  //  * producer
  //  * producer code
  //Company name is sufficent if there are at least 5 characters ("The A")
  //
  //A search criteria is also sufficent if first and last name
  //appear in combination with enough information to id the
  //city and state.
  //
  //Finally, as a massive exception to the rule, if we are doing
  //a related to search we are always sufficent
  private function checkMinimumSearchCriteria() : boolean {
    //This line allows users who are restricted to their own set of producer codes
    //to bypass the sufficency checks and do un-constrained searches. You may want to allow
    //this if each producer code is responsible for only a small subset of the total policies.
    //if (this.Secure and User.util.CurrentUser.UseProducerCodeSecurity) return true;

    if (this.RelatedTo != null) return true
    if (_nameCriteria.CompanyName.NotBlank &&
       (_nameCriteria.CompanyNameExact || _nameCriteria.CompanyName.length >= 5)) return true
    if ( _nameCriteria.TaxId.NotBlank ||
         _nameCriteria.OfficialId.NotBlank ||
         _accountNumber.NotBlank ||
         _phone.NotBlank ||
         _producer != null ||
         _producerCode != null) return true

    var has_location = _addressAutoFill.PostalCode.NotBlank ||
                       ((_addressAutoFill.City.NotBlank || _addressAutoFill.CityKanji.NotBlank)
                           && _addressAutoFill.State != null)

    var has_name = (_nameCriteria.FirstName.NotBlank && (_nameCriteria.FirstName.length > 2 || _nameCriteria.FirstNameExact)) &&
                   (_nameCriteria.LastName.NotBlank && (_nameCriteria.LastName.length > 2 || _nameCriteria.LastNameExact))
    return has_name && (_nameCriteria.LastNameExact || has_location || !_restrictedSearch)
  }

  /**
   * This will check that the minimally acceptable information has been supplied
   * and perform the query; otherwise it will throw an exception
   *
   * @param usingRelatedTo If the search page exposes the searching related accounts criteria
   *
   * @throws DisplayableException If the minimum criteria for search have not been specified,
   *  if both a company and person are specified, or if no matching account holder can be found.
   */
  override protected function doSearch() : IQueryBeanResult<AccountSummary> {
    return this.buildAccountSummaryQuery().select()
  }

  // Helper functions for API
  function setIndustryCodeByCode(code : String){
    var query = Query.make(entity.IndustryCode)
    query.compare(IndustryCode#Code.PropertyInfo.Name, Equals, code)
    IndustryCode = query.select().AtMostOneRow
  }

  function setProducerCodeByCode(code : String){
    var query = Query.make(entity.ProducerCode)
    query.compare(ProducerCode#Code.PropertyInfo.Name, Equals, code)
    ProducerCode = query.select().FirstResult
  }

  function setProducerByPublicID(publicId : String){
    var query = Query.make(Organization)
    query.compare(Organization#PublicID.PropertyInfo.Name, Equals, publicId)
    Producer = query.select().FirstResult
  }

}
