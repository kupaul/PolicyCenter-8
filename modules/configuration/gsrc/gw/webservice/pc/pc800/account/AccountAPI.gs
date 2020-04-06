package gw.webservice.pc.pc800.account

uses com.guidewire.pl.system.exception.DBDuplicateKeyException
uses gw.account.AccountQueryBuilder
uses gw.address.AddressQueryBuilder
uses gw.api.database.ISelectQueryBuilder
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.system.PCLoggerCategory
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.contact.ContactQueryBuilder
uses gw.pl.persistence.core.Bundle
uses gw.transaction.Transaction
uses gw.webservice.SOAPUtil
uses gw.webservice.pc.pc800.gxmodel.SimpleValuePopulator
uses gw.xml.ws.annotation.WsiWebService

uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException
uses java.util.Date
uses gw.api.database.PCBeanFinder
uses gw.xml.ws.annotation.WsiPermissions

/**
 * External API for performing various operations on accounts within PolicyCenter.
 */
@Export
@WsiWebService("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/account/AccountAPI")
class AccountAPI {

  /**
   * Returns the account number of the account with the given public ID, or null if
   * there is no such account.
   *
   * @param accountPublicID the public ID of the account
   * @return the accountNumber of the found account, or null if the account was not found
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("accountPublicID", "The public ID of the account number to look up")
  @WsiPermissions({SystemPermissionType.TC_VIEWACCOUNT, SystemPermissionType.TC_ACCOUNTSUMMARY})
  @Returns("The accountNumber of the account with the given public ID")
  function getAccountNumber(accountPublicID : String) : String {
    SOAPUtil.require(accountPublicID, "accountNumber")
    var account = Account.finder.findAccountByPublicId(accountPublicID)
    return account.AccountNumber
  }

  /**
   * Returns true if the account with the given public ID has currently active policies (periods).
   * A policy period is considered active if its effective period includes the current date.
   *
   * @param accountNumber the account number of the account
   * @return true if the account has active policies, false otherwise
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "The account number of the account to check for active policies")
  @WsiPermissions({SystemPermissionType.TC_VIEWACCOUNT})
  @Returns("True if the given account has active policies, false otherwise")
  function hasActivePolicies(accountNumber : String) : boolean {
    SOAPUtil.require(accountNumber, "accountNumber")
    var account = findRequiredAccount(accountNumber)
    var issuedPolicies : PolicyPeriodSummaryQuery = account.IssuedPolicies
    var today = Date.CurrentDate
    for (periodSummary in issuedPolicies) {
      if (periodSummary.PeriodEnd.after(today) and not periodSummary.PeriodStart.after(today)) {
        return true
      }
    }
    return false
  }

  /**
   * Returns the public ID of the account with the given accountNumber, or null if
   * there is no such account.
   *
   * @param accountNumber the account number of the account
   * @return the public ID of the found account, or null if the account was not found
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "The account number for which to look up the public ID")
  @WsiPermissions({SystemPermissionType.TC_VIEWACCOUNT})
  @Returns("The public ID of the account with the given account number, or null if the account was not found")
  function findAccountPublicIDByAccountNumber(accountNumber : String) : String {
    var account = entity.Account.finder.findAccountByAccountNumber(accountNumber)
    return account.PublicID
  }

  /**
   * Finds the accounts that match the properties in the provided AccountSearchInfo and
   * returns their account numbers.  If no accounts are found, then an empty array is returned.
   *
   * @param accountSearchInfo the search criteria to use in finding accounts
   * @return array of account numbers matching the given criteria; empty array if none found
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountSearchInfo", "The search criteria to use in locating accounts")
  @WsiPermissions({SystemPermissionType.TC_SEARCHACCOUNTS, SystemPermissionType.TC_VIEWACCOUNT})
  @Returns("An array of account numbers indicating which accounts matched the given criteria, or an empty array if none found")
  function findAccounts(accountSearchInfo : AccountSearchInfo) : String[] {
    SOAPUtil.require(accountSearchInfo, "accountSearchInfo")
    var foundAccountNumbers : String[]
    SOAPUtil.convertToSOAPException(PCLoggerCategory.ACCOUNT_API, \ -> {
        var accountQueryBuilder = new AccountQueryBuilder()
          .withAccountStatus(accountSearchInfo.AccountStatus)
          .withAccountNumber(accountSearchInfo.AccountNumber)
          .withProducer(getProducerByPublicID(accountSearchInfo.ProducerPublicID))
          .withProducerCode(getProducerCodeByCode(accountSearchInfo.ProducerCode))
          .withIndustryCode(getIndustryCodeByCode(accountSearchInfo.IndustryCode))
          .withAccountOrgType(accountSearchInfo.AccountOrgType)
          .withOriginationDate(accountSearchInfo.OriginationDate)
          .withPrimaryLanguage(accountSearchInfo.PrimaryLanguage)

        // account holder contact restrictions
        if (accountSearchInfo.FirstName.NotBlank
            or accountSearchInfo.LastName.NotBlank
            or accountSearchInfo.FirstNameKanji.NotBlank
            or accountSearchInfo.LastNameKanji.NotBlank
            or accountSearchInfo.Particle.NotBlank
            or accountSearchInfo.CompanyName.NotBlank
            or accountSearchInfo.CompanyNameKanji.NotBlank
            or accountSearchInfo.OfficialId.NotBlank
            or accountSearchInfo.Phone.NotBlank
            or accountSearchInfo.AddressLine1.NotBlank
            or accountSearchInfo.AddressLine2.NotBlank
            or accountSearchInfo.AddressLine1Kanji.NotBlank
            or accountSearchInfo.AddressLine2Kanji.NotBlank
            or accountSearchInfo.City.NotBlank
            or accountSearchInfo.Country != null
            or accountSearchInfo.County.NotBlank
            or accountSearchInfo.PostalCode.NotBlank
            or accountSearchInfo.State != null) {
          var contactQueryBuilder = new ContactQueryBuilder()
              .withFirstNameRestricted(accountSearchInfo.FirstName, StartsWithIgnoringCase)
              .withLastNameRestricted(accountSearchInfo.LastName, StartsWithIgnoringCase)
              .withFirstNameKanjiRestricited(accountSearchInfo.FirstNameKanji, StartsWithIgnoringCase)
              .withLastNameKanjiRestricted(accountSearchInfo.LastNameKanji, StartsWithIgnoringCase)
              .withParticleRestricted(accountSearchInfo.Particle, StartsWithIgnoringCase)
              .withCompanyNameRestricted(accountSearchInfo.CompanyName, StartsWithIgnoringCase)
              .withCompanyNameKanjiRestricted(accountSearchInfo.CompanyNameKanji, StartsWithIgnoringCase)
              .withOfficialId(accountSearchInfo.OfficialId)
              .withWorkPhone(accountSearchInfo.Phone)
              .withCityDenormStarting(accountSearchInfo.City)
              .withCityKanjiDenormStarting(accountSearchInfo.CityKanji)
              .withPostalCodeDenormStarting(accountSearchInfo.PostalCode)
              .withStateDenorm(accountSearchInfo.State)
          if (accountSearchInfo.AddressLine1.NotBlank
              or accountSearchInfo.AddressLine2.NotBlank
              or accountSearchInfo.AddressLine1Kanji.NotBlank
              or accountSearchInfo.AddressLine2Kanji.NotBlank
              or accountSearchInfo.Country != null
              or accountSearchInfo.County.NotBlank) {
            contactQueryBuilder.withPrimaryAddress(new AddressQueryBuilder()
                .withAddressLine1(accountSearchInfo.AddressLine1)
                .withAddressLine2(accountSearchInfo.AddressLine2)
                .withAddressLine1Kanji(accountSearchInfo.AddressLine1Kanji)
                .withAddressLine2Kanji(accountSearchInfo.AddressLine2Kanji)
                .withCountry(accountSearchInfo.Country)
                .withCountyStarting(accountSearchInfo.County)
            )
          }

          accountQueryBuilder.withAccountHolderContact(contactQueryBuilder)
        }
        foundAccountNumbers = (accountQueryBuilder.build() as ISelectQueryBuilder<Account>).select(\ a -> a.AccountNumber).toTypedArray()
    })
    return foundAccountNumbers
  }
  
  private function getIndustryCodeByCode(industryCode : String) : IndustryCode {
    var query = Query.make(entity.IndustryCode)
    query.compare(entity.IndustryCode#Code.PropertyInfo.Name, Equals, industryCode)
    return query.select().AtMostOneRow
  }

  private function getProducerCodeByCode(producerCode : String) : ProducerCode {
    var query = Query.make(entity.ProducerCode)
    query.compare(entity.ProducerCode#Code.PropertyInfo.Name, Equals, producerCode)
    return query.select().FirstResult
  }

  private function getProducerByPublicID(producerPublicID : String) : Organization {
    var query = Query.make(Organization)
    query.compare(Organization#PublicID.PropertyInfo.Name, Equals, producerPublicID)
    return query.select().FirstResult
  }
  
  /**
   * Adds an account to PolicyCenter.
   *
   * @param externalAccount the external account information to be used in creating the new Account
   * @return the account number of the newly added account
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(DBDuplicateKeyException, "If account number is duplicated")
  @Param("externalAccount", "The external account information to be used to create the new Account")
  @WsiPermissions({SystemPermissionType.TC_ACCOUNTCREATE})
  @Returns("The account number of the newly added account")
  function addAccount(externalAccount : gw.webservice.pc.pc800.gxmodel.accountmodel.types.complex.Account) : String {
    SOAPUtil.require(externalAccount, "externalAccount")
    SOAPUtil.require(externalAccount.AccountHolderContact, "accountHolderContact")
    var account : Account
    Transaction.runWithNewBundle(\ bundle -> {
      account = externalAccount.createAccount(bundle)
    })
    return account.AccountNumber
  }

  /**
   * Adds an account location to the account with the given account number.
   *
   * @param accountNumber the account number of the account to add the location to
   * @param externalLocation the account location to add to the specified account
   * @return the public ID of the newly added account location
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "The account number to which the account location should be added")
  @Param("externalLocation", "The location data to add to the account")
  @WsiPermissions({SystemPermissionType.TC_EDITACCOUNTSUMMARY})
  @Returns("The public ID of the newly added account location")
  function addLocationToAccount(accountNumber : String,
      externalLocation : gw.webservice.pc.pc800.gxmodel.accountlocationmodel.types.complex.AccountLocation) : String {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(externalLocation, "externalLocation")
    var accountLocation : AccountLocation
    var account = findRequiredAccount(accountNumber)
    Transaction.runWithNewBundle(\ bundle -> {
      accountLocation = new AccountLocation(bundle)
      SimpleValuePopulator.populate(externalLocation, accountLocation)
      bundle.add(account).addAndNumberAccountLocation(accountLocation)
    })
    return accountLocation.PublicID
  }

  /**
   * Moves an account contact into an account.
   *
   * @param accountNumber The account number of the account into which the account contact should be moved
   * @param accountContactID the public id of the account contact
   * @return the public ID of the moved accountContact, which should not have changed
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "The account number of the account into which the account contact should be moved")
  @Param("accountContactID", "The public ID of the account contact to move into the account")
  @WsiPermissions({SystemPermissionType.TC_EDITACCOUNTCONTACTS})
  @Returns("The public ID of the account contact to move into the account (should not have changed)")
  function moveAccountContactToAccount(accountNumber : String, accountContactID : String) : String {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(accountContactID, "accountContactID")
    var account = findRequiredAccount(accountNumber)

    Transaction.runWithNewBundle(\ bundle -> {
      var accountContact = bundle.add(PCBeanFinder.loadBeanByPublicID<AccountContact>(accountContactID, AccountContact))
      if (accountContact.hasRole("AccountHolder")) {
        throw new SOAPException(displaykey.AccountAPI.AddContact.Error.CannotAddAccountHolder)
      }
      accountContact.Account = account
    })
    return accountContactID
  }

  /**
   * Adds a contact to an account in PolicyCenter.
   *
   * @param externalContact The external contact information to add to the account
   * @param accountNumber The account number of the account to which the contact should be added
   * @return the public ID of the newly added Contact
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("externalContact", "The external contact information to add to the account")
  @Param("accountNumber", "The account number of the account to which the contact should be added")
  @WsiPermissions({SystemPermissionType.TC_EDITACCOUNTCONTACTS})
  @Returns("The public ID of the newly added Contact")
  function addContactToAccount(externalContact : gw.webservice.pc.pc800.gxmodel.contactmodel.types.complex.Contact,
      accountNumber : String) : String {
    SOAPUtil.require(externalContact, "externalContact")
    SOAPUtil.require(accountNumber, "accountNumber")
    var account = findRequiredAccount(accountNumber)
    var publicID : String
    Transaction.runWithNewBundle(\ bundle -> {
      var newContact = externalContact.isPersonContact() ? new Person(bundle) : new Company(bundle)
      externalContact.populateContact(newContact)
      account = bundle.add(account)
      account.addNewAccountContactForContact(newContact)
      publicID = newContact.PublicID
    })
    return publicID
  }

  /**
   * Updates the specified fields of an address on an account contact.
   *
   * @param addressPublicID the public ID of the address to update
   * @param externalAddress the external address data
   * @return the public ID of the updated address
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("addressPublicID", "The public ID of the address to update")
  @Param("externalAddress", "The external address information to update")
  @WsiPermissions({SystemPermissionType.TC_EDITACCOUNTCONTACTS})
  @Returns("The public ID of the updated address")
  function updateAccountContactsAddressFields(addressPublicID : String,
      externalAddress : gw.webservice.pc.pc800.gxmodel.addressmodel.types.complex.Address) : String {
    SOAPUtil.require(addressPublicID, "addressPublicID")
    SOAPUtil.require(externalAddress, "externalAddress")
    Transaction.runWithNewBundle(\ bundle -> {
      var address = bundle.add(PCBeanFinder.loadBeanByPublicID<Address>(addressPublicID, Address))
      SimpleValuePopulator.populate(externalAddress, address)
    })
    return addressPublicID
  }

  /**
   * Finds the contact with the given display name on the given account and returns the public ID of the found
   * contact, or null if no contact with the given name is on the Account
   *
   * @param accountNumber the public ID of the account to find the contact on
   * @param contactDisplayName the full display name of the contact to look for
   * @return the public ID of the found Contact, or null if no contact with the given name is on the account
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "The public ID of the account to search for the contact")
  @Param("contactDisplayName", "The full display name of the contact to look for")
  @WsiPermissions({SystemPermissionType.TC_ACCOUNTCONTACTS, SystemPermissionType.TC_SEARCHCONTACTS})
  @Returns("the public ID of the found Contact, or null if no contact with the given name is on the account")
  function findContactOnAccount(accountNumber : String, contactDisplayName : String) : String {
    SOAPUtil.require(accountNumber, "accountNumber");
    SOAPUtil.require(contactDisplayName, "contactDisplayName");
    var account = PCBeanFinder.loadBeanByPublicID<Account>(accountNumber, Account)
    var acctContact = account.AccountContacts.where(\ac -> ac.DisplayName == contactDisplayName)
    if (acctContact.Count == 0) {
      throw new SOAPException(displaykey.AccountAPI.Contact.Error.NotFound(contactDisplayName))
    } else if (acctContact.Count > 1) {
      throw new SOAPException(displaykey.AccountAPI.Contact.Error.MultipleMatches(contactDisplayName))
    }
    return acctContact.first().Contact.PublicID
  }

  /**
   * Moves the following items from their "from" Account to the given Account:
   * <ul>
   *   <li>Policies</li>
   *   <li>Activities</li>
   *   <li>Documents</li>
   *   <li>Notes</li>
   *   <li>* AccountLocations</li>
   *   <li>* AccountContacts</li>
   * </ul>
   *
   * * Equivalent AccountLocations and AccountContacts may be created if they do not already exist.
   *
   * The following actions occur:
   * <ul>
   *   <li>a "TransferPolicy" event is created</li>
   *   <li>a foreign key "MovedPolicySourceAccount" from the destination account
   * to the source account set</li>
   *   <li>the plugin method IAccountPlugin.transferPolicies so the policies can be
   * transferred on any external system.</li>
   *   <li>Performs all operations in a separate transaction.</li>
   * </ul>

   * @param policyPublicIDs public IDs of all policies to transfer
   * @param fromAccountNumber account number of the account that we are transferring from
   * @param toAccountNumber account number of the account that we are transferring to
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(IllegalArgumentException, "If any argument is illegal")
  @Param("policyPublicIDs", "public IDs of all policies to transfer")
  @Param("fromAccountNumber", "account number of the account that we are transferring from")
  @Param("toAccountNumber", "account number of the account that we are transferring to")
  @WsiPermissions({SystemPermissionType.TC_MERGEACCOUNTS})
  function transferPolicies(policyPublicIDs : String[], fromAccountNumber : String, toAccountNumber : String) {
    SOAPUtil.require(policyPublicIDs, "policyPublicIDs")
    SOAPUtil.require(fromAccountNumber, "fromAccountNumber")
    SOAPUtil.require(toAccountNumber, "toAccountNumber")
    if (fromAccountNumber == toAccountNumber) {
      throw new IllegalArgumentException(displaykey.AccountAPI.TransferPolicies.Error.SameAccount)
    }
    var fromAccount = findRequiredAccount(fromAccountNumber)
    var toAccount = findRequiredAccount(toAccountNumber)
    var policies = policyPublicIDs.map(\ policyPublicID -> getPolicyByPublicID(policyPublicID))
    Transaction.runWithNewBundle(\bundle -> {
      fromAccount = bundle.add(fromAccount)
      toAccount = bundle.add(toAccount)
      policies = toAccount.transferPolicies(policies, fromAccount)
    })
  }

  /**
   * Moves all AccountContacts, AccountLocations, AccountProducerCode, Activities,
   * Documents, JobGroups, Notes, Policys and UserRoleAssignments from the
   * "from" Account to the "to" Account, and deletes the "from" Account.
   * The "to" Account becomes the "merged" Account.  Accomplishes this
   * in a separate transaction (actually multiple transactions).
   * <br>
   *
   * @param fromAccountNumber public ID of the account that is destroyed as part of the merge
   * @param toaccountNumber public ID of the account that will become the merged account
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(IllegalArgumentException, "If any argument is invalid")
  @Param("fromAccountNumber", "public ID of the account that is destroyed as part of the merge")
  @Param("toAccountNumber", "public ID of the account that will become the merged account")
  @WsiPermissions({SystemPermissionType.TC_MERGEACCOUNTS})
  function mergeAccounts(fromAccountNumber : String, toAccountNumber : String) {
    SOAPUtil.require(fromAccountNumber, "fromAccountNumber")
    SOAPUtil.require(toAccountNumber, "toAccountNumber")
    var fromAccount = findRequiredAccount(fromAccountNumber)
    var toAccount = findRequiredAccount(toAccountNumber)
    toAccount.mergeWithAccount(fromAccount)
  }

  /**
   * Generates an account activity based on the 'activityType' and 'activityPatternCode'
   * and autoAssign the activity.
   *
   * @param accountNumber the account number of the account to retrieve for assignment
   * @param activityType the typekey of the activity
   * @param activityPatternCode the code of the activity pattern
   * @param externalActivity the external activity data to use in constructing the new Activity.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "the account number of the account to retrieve for assignment")
  @Param("activityType", "the typekey of the activity")
  @Param("activityPatternCode", "the code of the activity pattern")
  @Param("externalActivity", "the external activity data to use in constructing the new Activity.")
  @WsiPermissions({SystemPermissionType.TC_ACTEDITUNOWNED, SystemPermissionType.TC_ACTCREATE})
  function addAndAutoAssignActivityForAccount(accountNumber : String,
        activityType : ActivityType,
        activityPatternCode : String,
        externalActivity : gw.webservice.pc.pc800.gxmodel.activitymodel.types.complex.Activity) {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(activityType, "activityType")
    SOAPUtil.require(activityPatternCode, "activityPatternCode")
    SOAPUtil.require(externalActivity, "externalActivity")

    var account = findRequiredAccount(accountNumber)
    var activityPattern = ActivityPattern.finder.getActivityPattern(activityType, activityPatternCode)
    if(activityPattern == null){
      throw new BadIdentifierException(displaykey.PolicyAPI.ActivityPattern.NotFound(activityType, activityPatternCode))
    }
    Transaction.runWithNewBundle(\ bundle -> {
      var accountActivity = activityPattern.createAccountActivity(bundle, activityPattern, account, null, null, null, null, null, null, null)
      accountActivity.autoAssign() // auto assign activity
      SimpleValuePopulator.populate(externalActivity, accountActivity)
    })
  }

  /**
   * Adds the given 'document' to the account with the given public ID.
   *
   * @param accountNumber the account number of the account to add the document to
   * @param externalDocument the document to add to the account
   * @return the public ID of the newly added document.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "the account number of the account to add the document to")
  @Param("externalDocument", "the document to add to the account")
  @WsiPermissions({SystemPermissionType.TC_DOCCREATE, SystemPermissionType.TC_ACCOUNTDOCS})
  @Returns("the public ID of the newly added document")
  function addDocumentToAccount(accountNumber : String,
      externalDocument : gw.webservice.pc.pc800.gxmodel.documentmodel.types.complex.Document) : String {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(externalDocument, "externalDocument")
    var document : Document
    var account = findRequiredAccount(accountNumber)
    Transaction.runWithNewBundle(\ bundle -> {
      document = new Document(bundle)
      SimpleValuePopulator.populate(externalDocument, document)
      document.Level = account
    })
    return document.PublicID
  }

  private function findRequiredAccount(accountNumber : String) : Account{
    var account = Account.finder.findAccountByAccountNumber(accountNumber)
    if(account == null){
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindAccount(accountNumber))
    }
    return account
  }

  /**
   * Adds the given 'note' to the Account with the given public ID.
   *
   * @param accountNumber the account number of the account to add the note to
   * @param externalNote the note to add to the account
   * @return the public ID of the newly added note.
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "the account number of the account to add the note to")
  @Param("externalNote", "the note to add to the account")
  @WsiPermissions({SystemPermissionType.TC_ACCOUNTNOTES, SystemPermissionType.TC_NOTECREATE})
  @Returns("the public ID of the newly added note.")
  function addNoteToAccount(accountNumber : String,
      externalNote : gw.webservice.pc.pc800.gxmodel.notemodel.types.complex.Note) : String {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(externalNote, "externalNote")
    var note : Note
    var account = findRequiredAccount(accountNumber)
    Transaction.runWithNewBundle(\ bundle -> {
      note = new Note(bundle)
      note.Level = account
      SimpleValuePopulator.populate(externalNote, note)
    })
    return note.PublicID
  }

  /**
   * Activates or deactivates the account contact identified by accountNumber and contactPublicID.
   *
   * @param accountNumber the account number of the targeted Account
   * @param contactPublicID public ID of the contact on the account (n.b. Contact, not AccountContact)
   * @param activate whether to activate or deactivate (true to activate, false to deactivate)
   * @return the resulting active state of the contact
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "the account number of the targeted Account")
  @Param("contactPublicID", "public ID of the contact on the account (n.b. Contact, not AccountContact)")
  @Param("activate", "whether to activate or deactivate (true to activate, false to deactivate)")
  @WsiPermissions({SystemPermissionType.TC_EDITACCOUNTCONTACTS})
  @Returns("the resulting active state of the contact")
  public function activateAccountContact(accountNumber : String, contactPublicID : String, activate : boolean) : boolean {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(contactPublicID, "contactPublicID")
    SOAPUtil.require(activate, "activate")

    var account = findRequiredAccount(accountNumber)
    Transaction.runWithNewBundle(\ bundle -> {
      // find the AccountContact
      var accountContacts = account.AccountContacts.where(\ ac -> ac.Contact.PublicID == contactPublicID)
      if (accountContacts.Count == 0) {
        throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByPublicID(contactPublicID))
      }
      var accountContact = bundle.add(accountContacts.single())

      // don't deactivate the account holder
      if (account.AccountHolder.AccountContact == accountContact)
        throw new SOAPException(displaykey.Webservice.Error.CannotDeactivateAccountHolder)

      // update
      accountContact.Active = activate
    })

    return activate
  }

  /**
   * Adds an account contact role for the account and contact.
   *
   * @param accountNumber public ID of the account
   * @param contactPublicID public ID of the contact on the account (n.b. Contact, not AccountContact)
   * @param accountContactRoleInfo values specific to the AccountContactRole type
   * @return the new AccountContactRole's public ID
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "public ID of the account")
  @Param("contactPublicID", "public ID of the contact on the account (n.b. Contact, not AccountContact)")
  @Param("accountContactRoleInfo", "values specific to the AccountContactRole type")
  @WsiPermissions({SystemPermissionType.TC_EDITACCOUNTROLES})
  @Returns("the new AccountContactRole's public ID")
  function addAccountContactRole(
        accountNumber : String,
        contactPublicID : String,
        accountContactRoleInfo : gw.webservice.pc.pc800.gxmodel.accountcontactrolemodel.types.complex.AccountContactRole) : String {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(contactPublicID, "contactPublicID")
    SOAPUtil.require(accountContactRoleInfo, "accountContactRoleInfo")

    var accountContactRole : AccountContactRole
    Transaction.runWithNewBundle(\ bundle -> {
      // find the AccountContactRole type
      if (accountContactRoleInfo.Subtype == null) {
        throw new SOAPException(displaykey.AccountAPI.Error.AccountContactRoleInfo.Type.Required)
      }
      var accountContactRoleType = accountContactRoleInfo.Subtype
      if (accountContactRoleType == typekey.AccountContactRole.TC_ACCOUNTHOLDER) {
        throw new SOAPException(displaykey.AccountAPI.Error.Adding.AccountHolder.Not.Allowed)
      }

      // load Account
      var account = bundle.add(PCBeanFinder.loadBeanByPublicID<Account>(accountNumber, Account))
      if (account == null) {
        throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindAccount(accountNumber))
      }

      // find the AccountContact.  If there is none, create it
      var accountContacts = account.AccountContacts.where(\ ac -> ac.Contact.PublicID == contactPublicID)
      var accountContact : AccountContact
      if (accountContacts.Count == 0) {
        // find the Contact
        var contacts = Query.make(Contact)
              .compare("PublicID", Equals, contactPublicID)
              .select().toList()
        if (contacts.Count == 0) {
          throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByPublicID(contactPublicID))
        }

        accountContact = account.addNewAccountContactForContact(contacts.single())
      }

      else { // The AccountContact already exists
        accountContact = accountContacts.single()
      }

      SOAPUtil.convertToSOAPException(PCLoggerCategory.ACCOUNT_API, \ -> {  // unnecessary, but kept for backwards-compatibility
        // create the new AccountContactRole
        accountContactRole = accountContact.addNewRole(accountContactRoleType)
        accountContactRoleInfo.populateContactRole(accountContactRole)
      })
    })

    return accountContactRole.PublicID
  }

  /**
   * Updates field values for an AccountContactRole.
   *
   * @param accountNumber public ID of the account
   * @param contactPublicID public ID of the contact on the account (n.b. Contact, not AccountContact)
   * @param contactRoleInfo the account contact role data
   * @return The AccountContactRole's public ID
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "public ID of the account")
  @Param("contactPublicID", "public ID of the contact on the account (n.b. Contact, not AccountContact)")
  @Param("contactRoleInfo", "the account contact role data")
  @WsiPermissions({SystemPermissionType.TC_EDITACCOUNTCONTACTS})
  @Returns("The AccountContactRole's public ID")
  function updateAccountContactRoleFields(
      accountNumber : String,
      contactPublicID : String,
      contactRoleInfo : gw.webservice.pc.pc800.gxmodel.accountcontactrolemodel.types.complex.AccountContactRole) : String {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(contactPublicID, "contactPublicID")
    SOAPUtil.require(contactRoleInfo, "contactRoleInfo")
    SOAPUtil.require(contactRoleInfo.Subtype, "contactRoleInfo.Subtype")

    var accountContactRolePublicID : String
    Transaction.runWithNewBundle(\ bundle -> {
      SOAPUtil.convertToSOAPException(PCLoggerCategory.ACCOUNT_API, \ -> {  // unnecessary, but kept for backwards-compatibility
        // load AccountContactRole
        var accountContactRole = getAccountContactRole(
          bundle, accountNumber, contactPublicID, contactRoleInfo.Subtype)
        accountContactRolePublicID = accountContactRole.PublicID
        contactRoleInfo.populateContactRole(accountContactRole)
      })
    })

    return accountContactRolePublicID
  }

  /**
   * Deletes the AccountContact that points at the given contactPublicID from the account with
   * the given accountNumber.
   *
   * @param accountNumber account number of the Account
   * @param contactPublicID public ID of the contact on the account (n.b. Contact, not AccountContact)
   * @return the contact public ID
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(IllegalArgumentException, "If an argument is illegal")
  @Throws(IllegalStateException, "If cannot delete")
  @Param("accountNumber", "account number of the Account")
  @Param("contactPublicID", "public ID of the contact on the account (n.b. Contact, not AccountContact)")
  @WsiPermissions({SystemPermissionType.TC_EDITACCOUNTCONTACTS})
  @Returns("the contact public ID")
  function deleteAccountContact(accountNumber : String, contactPublicID : String) : String {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(contactPublicID, "contactPublicID")

    var account = findRequiredAccount(accountNumber)
    var contact = Query.make(Contact)
          .compare("PublicID", Equals, contactPublicID)
          .select().AtMostOneRow
    if (contact == null) {
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindContactByPublicID(contactPublicID))
    }

    var accountContact = account.AccountContacts.firstWhere(\ a -> a.Contact == contact)
    if (accountContact == null) {
      throw new IllegalArgumentException(displaykey.Webservice.Error.ContactNotOnAccount(contact, account))
    }

    if (account.AccountHolderContact == contact) {
      throw new IllegalArgumentException(displaykey.Webservice.Error.CannotRemoveAccountHolder(contact, account))
    }

    if (accountContact.Roles.hasMatch(\ a -> not a.canRemove())) {
      throw new IllegalStateException(displaykey.Webservice.Error.ContactToRemoveHasAtLeastOneRoleInUse(contact, accountContact.Roles.firstWhere(\ a -> not a.canRemove())))
    }
    Transaction.runWithNewBundle(\ bundle -> {
      bundle.add(accountContact).remove()
    })

    return contactPublicID
  }

  /**
   * Deletes an AccountContactRole.
   *
   * @param accountNumber public ID of the account
   * @param contactPublicID public ID of the contact on the account (n.b. Contact, not AccountContact)
   * @param roleTypeName Name of the AccountContactRole type, e.g. "Driver".  One
   *                     of typekey.AccountContactRole.TC_*.Code
   * @return the deleted AccountContactRole's public ID
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Param("accountNumber", "public ID of the account")
  @Param("contactPublicID", "public ID of the contact on the account (n.b. Contact, not AccountContact)")
  @Param("roleTypeName", "Name of the AccountContactRole type, e.g. \"Driver\". One of typekey.AccountContactRole.TC_*.Code")
  @WsiPermissions({SystemPermissionType.TC_ACCOUNTROLES, SystemPermissionType.TC_EDITACCOUNTROLES})
  @Returns("the deleted AccountContactRole's public ID")
  public function deleteAccountContactRole(
       accountNumber : String,
       contactPublicID : String,
       roleTypeName : typekey.AccountContactRole) : String {
    SOAPUtil.require(accountNumber, "accountNumber")
    SOAPUtil.require(contactPublicID, "contactPublicID")
    SOAPUtil.require(roleTypeName, "roleTypeName")

    // don't let them delete the account holder role
    if (roleTypeName ==
      typekey.AccountContactRole.TC_ACCOUNTHOLDER) {
      throw new SOAPException(displaykey.AccountAPI.Error.AccountContactRole.CannotDeleteAccountHolderRole)
    }

    var accountContactRolePublicID : String
    Transaction.runWithNewBundle(\ bundle -> {
      SOAPUtil.convertToSOAPException(PCLoggerCategory.ACCOUNT_API, \ -> {  // unnecessary, but kept for backwards-compatibility
        // load AccountContactRole
        var accountContactRole = getAccountContactRole(
          bundle, accountNumber, contactPublicID, roleTypeName)
        accountContactRolePublicID = accountContactRole.PublicID

        // make sure we can delete it.
        if (accountContactRole.AccountContact.Roles.Count == 1) {
          throw new gw.api.util.DisplayableException(displaykey.Web.AccountContactCV.Error.CannotRemoveOnlyRole)
        }

        if (not accountContactRole.canRemove()) {
          throw new gw.api.util.DisplayableException(displaykey.AccountAPI.Error.AccountContactRole.CannotRemoveInUseRole(accountContactRole))
        }

        // delete it.
        accountContactRole.AccountContact.removeFromRoles(accountContactRole)
      })
    })

    return accountContactRolePublicID
  }


  ///////////////////////  Private

  /**
   * Get an policy by public ID, or throw a {@link DataConversionException} if it doesn't exist.
   */
  private function getPolicyByPublicID(policyId : String) : Policy {
    var policy = Policy.finder.findPolicyByPublicId(policyId)
    if (policy == null) {
      throw new DataConversionException(displaykey.AccountAPI.Error.InvalidPolicyPublicID(policyId))
    }
    return policy
  }

  /**
   * Gets a AccountContactRole for the given args.  Thows a SOAPException if there
   * are zero, or multiple matches, i.e., there can only be one.
   *
   * @param accountNumber public ID of the account
   * @param contactPublicID public ID of the contact on the account (n.b. Contact, not AccountContact)
   * @param roleTypeName Name of the AccountContactRole type, e.g. "Driver".  One
   *                     of typekey.AccountContactRole.TC_*.Code
   */
  private function getAccountContactRole(
    bundle : Bundle,
    accountNumber : String, contactPublicID : String,
    roleType : typekey.AccountContactRole) : AccountContactRole {

    if (roleType == null) {
     throw new BadIdentifierException(displaykey.AccountAPI.Error.Unknown.AccountContactRole.Type( roleType))
    }

    var query = Query.make(AccountContactRole)
    query.compare("Subtype", Relop.Equals, roleType)
    var accountContactTable = query.join("AccountContact")
    var accountTable = accountContactTable.join("Account")
    accountTable.compare("PublicID",  Relop.Equals, accountNumber)
    var contactTable = accountContactTable.join("Contact")
    contactTable.compare("PublicID",  Relop.Equals, contactPublicID)

    var results = query.select().toList()
    if (results.Empty) {
     throw new BadIdentifierException(displaykey.AccountAPI.Error.AccountContactRole.NotFound(
       accountNumber, contactPublicID, roleType))
    }
    if (results.Count > 1) {
     throw new BadIdentifierException(displaykey.AccountAPI.Error.AccountContactRole.FoundMultiple(
       accountNumber, contactPublicID, roleType))
    }

    return bundle.add(results.single())
  }
}
