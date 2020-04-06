package gw.sampledata

uses gw.api.builder.AccountBuilder
uses gw.api.builder.AccountContactBuilder
uses gw.api.builder.AccountLocationBuilder
uses gw.api.builder.ActivityBuilder
uses gw.api.builder.AddressBuilder
uses gw.api.builder.CompanyBuilder
uses gw.api.builder.CoverageBuilder
uses gw.api.builder.PersonBuilder
uses gw.api.builder.PolicyAddlNamedInsuredBuilder
uses gw.api.builder.PolicyChangeBuilder
uses gw.api.builder.PolicyLocationBuilder
uses gw.api.builder.PolicySecNamedInsuredBuilder
uses gw.api.builder.SubmissionBuilder
uses gw.api.database.InOperation
uses gw.api.database.Query
uses gw.api.databuilder.ba.BAJurisdictionBuilder
uses gw.api.databuilder.ba.BAVehicleBuilder
uses gw.api.databuilder.ba.BusinessAutoLineBuilder
uses gw.api.databuilder.bop.BOPBuildingBuilder
uses gw.api.databuilder.bop.BOPLineBuilder
uses gw.api.databuilder.bop.BOPLocationBuilder
uses gw.api.databuilder.bop.BuildingBuilder
uses gw.api.databuilder.pa.PAVehicleBuilder
uses gw.api.databuilder.pa.PersonalAutoLineBuilder
uses gw.api.databuilder.pa.PolicyDriverBuilder
uses gw.api.databuilder.pa.VehicleDriverBuilder
uses gw.api.databuilder.wc.WCCoveredEmployeeBuilder
uses gw.api.databuilder.wc.WCJurisdictionBuilder
uses gw.api.databuilder.wc.WorkersCompLineBuilder
uses gw.api.plugin.policyadmin.InvalidPolicyRetrievalException
uses gw.api.productmodel.Product
uses gw.api.system.PCDependenciesGateway
uses gw.api.system.PLDependenciesGateway
uses gw.api.system.database.SequenceUtil
uses gw.api.util.JurisdictionMappingUtil
uses gw.api.util.StateJurisdictionMappingUtil
uses gw.pl.persistence.core.Bundle
uses gw.policy.PolicyPeriodValidation
uses gw.transaction.Transaction
uses gw.transaction.Transaction.BlockRunnable

uses java.lang.Integer
uses java.lang.Runnable
uses java.lang.Throwable
uses java.util.ArrayList
uses java.util.Date
uses java.util.concurrent.atomic.AtomicInteger

/**
 * A "collection" in this context is one PART of a SampleDataSet, for instance
 * all the community entities in the Foo data set.
 */
@Export
abstract class AbstractSampleDataCollection
{
  protected construct() { }

  private static var _publicIdCounter = new AtomicInteger(1)

  /**
   * Return the name of this collection.  Subclasses must override.
   */
  public abstract property get CollectionName() : String

  /**
   * Return true if this data collection has already been loaded into the DB.
   * Subclasses should check this using finders.  Subclasses must override.
   */
  public abstract property get AlreadyLoaded() : boolean

  /**
   * The user we should run as when loading the data.  Subclasses can override
   */
  property get RunAsUser() : String {
    return "su"
  }

  /** This method will run a block of code as a specific user, if that user is specified
   * and is different from the current user. It is still worth it to call this method as it will
   * wrap any exception so that the added information is available in the stack trace.
   *
   * @param userName this is the string with the username (the login name), null will default to the current user
   * @param blk anything gosu expression
   */
  protected static function runBlockAsUser(userName : String, title : String, blk : Runnable) {
    var oldToken = PLDependenciesGateway.getCommonDependencies().getServiceToken()
    try {
      if (userName != null and oldToken.User.Credential.UserName != userName) {
        var user = PLDependenciesGateway.getUserFinder().findByCredentialName(userName)
        var token = PLDependenciesGateway.getServiceTokenManager().createAuthenticatedToken(user as Key)
        PLDependenciesGateway.getCommonDependencies().setServiceToken(token)
      }
      blk.run()
    } catch (e : Throwable) {
      print("Uncaught throwable in runBlockAsUser while running ${title}")
      e.printStackTrace()
    } finally {
      PLDependenciesGateway.getCommonDependencies().setServiceToken(oldToken)
    }
  }

  /** This method will run a block of code, with a provided bundle, as a specific user, if that user is specified
   * and is different from the current user.  It is still worth it to call this method as it will
   * wrap any exception so that the added information is available in the stack trace.
   *
   * @param userName this is the string with the username (the login name), null will default to the current user
   * @param title this is a string added to the runtime exception thrown,
   *        use it it will make debugging load problems more managable
   * @param blk any gosu expression, it will be supplied a bundle
   */
  protected static function runTransactionAsUser(userName : String, title : String, blk : BlockRunnable) {
    runBlockAsUser(userName, title, \ -> Transaction.runWithNewBundle( blk ))
  }

  /**
   * Loads all the data in this collection.  Subclasses must override.
   */
  public abstract function load()

  // ============================================= REGION CREATION HELPERS

  protected static function securityZoneLoaded(name : String) : boolean {
    var securityZoneQuery = Query.make(SecurityZone).compare("Name", Equals, name)
    return securityZoneQuery.select().HasElements
  }

  protected static function loadSecurityZone(bundle : Bundle, name : String, description : String)  : SecurityZone{
    var secZone = new SecurityZone(bundle)
    secZone.Name = name
    secZone.Description = description
    return secZone
  }

  protected static function loadRegion(bundle : Bundle, name : String, zones : RegionZone[]) : Region {
    var region = new Region(bundle)
    region.Name = name
    for (zone in zones) {
      region.addToRegionZones(zone)
    }
    return region
  }

  protected static function loadRegionZone(bundle : Bundle, code : String, country : String, zoneType : ZoneType) : RegionZone {
    var regZone = new RegionZone(bundle)
    regZone.Code = code
    regZone.Country = country
    regZone.ZoneType = zoneType
    return regZone
  }

  // ============================================= COMMUNITY CREATION HELPERS

  // Try to get the SSN reused when the name is reused.  (This is not strictly required).
  private static var repeatedSSNs = {"John Smith" ->"987-65-4321", "Ray Newton" ->"342-56-8729", "Helen Delancy" -> "475-10-6923"}

  // generated SSNs will start with 989 and be ODD
  static var ssnGenVal : int = 1
  protected static function genSSN(firstName : String, lastName : String) : String {
    var ssn = repeatedSSNs.get(firstName + " "  + lastName)
    if (ssn == null) {
      ssn = String.format("989-%02d-%04d", {new Integer(ssnGenVal/ 10000), new Integer(ssnGenVal % 10000)})
      ssnGenVal += 2
      repeatedSSNs.put(firstName + " " + lastName, ssn)
    }
    return ssn
  }

  private static var repeatedFEINs = {"Wright Construction" -> "23-2345678"}
  // generated FEINs will start with 77 and be EVEN
  static var feinGenVal : int = 2
  protected static function genFEIN(name : String) : String {
    var fein = repeatedFEINs.get(name)
    if (fein == null) {
      fein = String.format("77-%07d", {new Integer(feinGenVal)})
      feinGenVal = feinGenVal + 2
      repeatedFEINs.put(name, fein)
    }
    return fein
  }

  protected static function buildDriver(firstName : String, lastName : String) : PersonBuilder {
    return buildDriver(firstName, lastName, TC_CA)
  }

  protected static function buildDriver(firstName : String, lastName : String, licenseState : State) : PersonBuilder {
    var ssn = genSSN(firstName, lastName)
    return buildPerson(firstName, lastName, null, null, ssn)
        .withLicenseNumber(ssn.replaceAll("-","")).withLicenseState(StateJurisdictionMappingUtil
        .getJurisdictionMappingForState(licenseState))
  }

  protected static function credentialLoaded(username : String) : boolean {
    var credentialQuery = Query.make(Credential).compare("UserName", Equals, username)
    return credentialQuery.select().HasElements
  }

  static function loadOrganization(bundle : Bundle, name : String, type : BusinessType, carrier : boolean,
                                   producerStatus : ProducerStatus, securityZone : String) : Organization {
    return loadOrganization(bundle, name, null, type, carrier, producerStatus, securityZone)
  }
  static function loadOrganization(bundle : Bundle, name : String, nameKanji : String, type : BusinessType, carrier : boolean,
                                   producerStatus : ProducerStatus, securityZone : String) : Organization {
    var org : Organization
    if (carrier) {
      if (type != "insurer") {
        throw "For Organization " + name + " attempting to set carrier to " + type
      }
      var organizationQuery = Query.make(Organization).compare("Carrier", Equals, true)
      org = bundle.add(organizationQuery.select().AtMostOneRow)
    } else {
      if (type == "insurer") {
        throw "For Organization " + name + " attempting to set non carrier to insurer"
      }
      org = new Organization(bundle)
      // make sure sample organizations are created with the same publicIDs
      org.PublicID = "pc:" + SequenceUtil.next( 1, "ORGANIZATION" )
    }

    org.setNameAndRootGroupName(name)
    org.NameKanji = nameKanji
    org.RootGroup.NameKanji = nameKanji
    org.Type = type
    org.ProducerStatus = producerStatus
    org.RootGroup.SecurityZone = findSecurityZone(securityZone)
    return org
  }

  static function loadUser(bundle : Bundle, role : String, usertype : UserType, org : Organization,
                           usePCodeSecurity : boolean, isOrgSupervisor : boolean, username : String, email : String,
                           firstName : String, lastName : String, phone : String, addressLine1 : String, city : String,
                           state : State, zip : String, country : String) : User {
    return loadUser(bundle, { role }, usertype, org, usePCodeSecurity, isOrgSupervisor, username, email, firstName, lastName, phone, addressLine1, city, state, zip, country, {})
  }

  static function loadUser(bundle : Bundle, roles : String[], usertype : UserType, org : Organization,
                           usePCodeSecurity : boolean, isOrgSupervisor : boolean, username : String, email : String,
                           firstName : String, lastName : String, phone : String, addressLine1 : String, city : String,
                           state : State, zip : String, country : String, profiles : UWAuthorityProfile[]) : User {
    return loadUser(bundle, roles, usertype, org, usePCodeSecurity, isOrgSupervisor, username, email,
        firstName, lastName, null, null, phone, addressLine1, null, city, null, state, zip, country, profiles)
  }
  static function loadUser(bundle : Bundle, roles : String[], usertype : UserType, org : Organization,
                           usePCodeSecurity : boolean, isOrgSupervisor : boolean, username : String, email : String,
                           firstName : String, lastName : String, firstNameKanji : String, lastNameKanji : String,
                           phone : String, addressLine1 : String, addressLine1Kanji : String, city : String, cityKanji : String, state : State, zip : String,
                           country : String, profiles : UWAuthorityProfile[]) : User {
    var credentialQuery = Query.make(Credential).compare("UserName", Equals, username)
    var userQuery = Query.make(User).subselect("Credential", InOperation.CompareIn, credentialQuery, "ID")
    var user = userQuery.select().AtMostOneRow
    if (user == null) {
      user = createNewUser(bundle, roles, usertype, org, usePCodeSecurity, isOrgSupervisor, username, email,
          firstName, lastName, firstNameKanji, lastNameKanji, phone,
          addressLine1, addressLine1Kanji, city, cityKanji, state, zip, country)
    }
    else {
      user = bundle.add(user)
    }
    for (p in profiles) {
      var userProfile = new UserAuthorityProfile(user)
      userProfile.UWAuthorityProfile = p
      user.addToUserAuthorityProfiles( userProfile )
    }

    return user
  }

  private static function createNewUser(bundle : Bundle, roles : String[], usertype : UserType, org : Organization,
                                        usePCodeSecurity : boolean, isOrgSupervisor : boolean, username : String, email : String,
                                        firstName : String, lastName : String, phone : String, addressLine1 : String, city : String,
                                        state : State, zip : String, country : String) : User {
    return createNewUser(bundle, roles, usertype, org, usePCodeSecurity, isOrgSupervisor, username, email,
        firstName, lastName, null, null, phone, addressLine1, null, city, null,
        state, zip, country)
  }

  private static function createNewUser(bundle : Bundle, roles : String[], usertype : UserType, org : Organization,
                                        usePCodeSecurity : boolean, isOrgSupervisor : boolean, username : String, email : String,
                                        firstName : String, lastName : String, firstNameKanji : String, lastNameKanji : String,
                                        phone : String, addressLine1 : String, addressLine1Kanji : String, city : String, cityKanji : String,
                                        state : State, zip : String, country : String) : User {
    var user = new User(bundle)
    user.ExternalUser = not org.Carrier
    user.OrganizationWithUpdate = org
    if (isOrgSupervisor) {
      org.RootGroup.Supervisor = user
    }
    user.UserType = usertype
    user.UseProducerCodeSecurity = usePCodeSecurity
    user.Credential.UserName = username
    user.Credential.Password = PLDependenciesGateway.getCryptUtil().hashPasswordString("gw")
    user.Contact.EmailAddress1 = email
    user.Contact.FirstName = firstName
    user.Contact.FirstNameKanji = firstNameKanji
    user.Contact.LastName = lastName
    user.Contact.LastNameKanji = lastNameKanji
    user.Contact.WorkPhone = phone
    user.Contact.PrimaryPhone = "work"
    setAddressFields(user.Contact.PrimaryAddress, "business", "Work address", addressLine1, addressLine1Kanji, city, cityKanji, state, zip, country)
    for (role in roles) {
      if (role != null) {
        var userRole = new UserRole(user)
        userRole.User = user
        var roleQuery = Query.make(entity.Role).compare("PublicID", Equals, role)
        userRole.Role = roleQuery.select().AtMostOneRow
        if (userRole.Role == null) {
          throw "For user " + username + " Could not find user role " + role + "."
        }
      }
    }
    return user
  }
  protected static function loadGroup(bundle : Bundle, name : String, parent : Group, type : GroupType, securityZone : String,
                                      supervisor : User, users : User[], branchCode : String, org : Organization, region : String) : Group {
    return loadGroup(bundle, name, null, parent, type, securityZone, supervisor, users, branchCode, org, region)
  }

  protected static function loadGroup(bundle : Bundle, name : String, nameKanji : String, parent : Group, type : GroupType, securityZone : String,
                                      supervisor : User, users : User[], branchCode : String, org : Organization, region : String) : Group {
    var group = new Group(bundle)
    group.Name = name
    group.NameKanji = nameKanji
    group.Parent = parent
    group.GroupType = type
    group.SecurityZone = findSecurityZone(securityZone)
    group.Supervisor = supervisor
    for (user in users) {
      joinUserToGroup(user, group)
    }
    if (type == "branchuw") {
      group.BranchCode = branchCode
    }
    group.Organization = org
    if (region != "") {
      var groupRegion = new GroupRegion(group)
      groupRegion.Group = group
      groupRegion.Region = findRegion(region)
    }
    return group
  }

  protected static function loadProducerCode(bundle : Bundle, code : String, description : String, branch : Group,
                                             org : Organization, groups : Group[], users : User[]) : ProducerCode {
    return loadProducerCode(bundle, code, description, branch, org, groups, users, Currency.TC_USD)
  }

  protected static function loadProducerCode(bundle : Bundle, code : String, description : String, branch : Group,
                                             org : Organization, groups : Group[], users : User[], currency: Currency) : ProducerCode {
    var pc = new ProducerCode(bundle)
    pc.PublicID = "pc:" + SequenceUtil.next( 1, "PRODUCERCODE" )
    pc.Code = code
    pc.Description = description
    pc.ProducerStatus = "Active"
    pc.Organization = org
    // If we already have a commission plan for the requested currency, don't try to create it
    // This can happen in single-currency mode because we add a default CommissionPlan with the default Currency when we create a ProducerCode
    if(pc.CommissionPlans.where( \ elt -> elt.Currency == currency).IsEmpty) {
      pc.addCommissionPlanForCurrency(currency)
    }
    var currCommPlan = pc.findCommissionPlanByCurrency(currency)

    if (branch != null and branch.BranchCode == null) {
      throw "On ProducerCode " + code + " branch '" + branch + "' is not a branch"
    }
    if (branch != null and branch.Organization != Organization.finder.findCarrierOrganization()) {
      throw "On ProducerCode " + code + " branch '" + branch + "' is not in carrier organization"
    }
    pc.Branch = branch
    joinGroupToProducerCode(org.RootGroup, pc)
    for (user in users) {
      joinUserToProducerCode(user, pc)
    }
    for (group in groups) {
      joinGroupToProducerCode(group, pc)
    }
    var pcRole = new ProducerCodeRole(pc)
    pcRole.ProducerCode = pc
    var roleQuery = Query.make(Role).compare("PublicID", Equals, "producer")
    pcRole.Role = roleQuery.select().AtMostOneRow
    if (pcRole.Role == null) {
      throw "On ProducerCode " + code + " Cannot find Role \"producercode\""
    }
    return pc
  }

  protected static function loadProducerCode(bundle : Bundle, code : String, description : String, branch : Group,
                                             org : Organization, groups : Group[], users : User[],
                                             addressLine1 : String, city : String, state : State, zip : String, country : String) : ProducerCode {
    return loadProducerCode(bundle, code, description, branch, org, groups, users, addressLine1, null,
        city, null, state, zip, country, Currency.TC_USD)
  }

  protected static function loadProducerCode(bundle : Bundle, code : String, description : String, branch : Group,
                                             org : Organization, groups : Group[], users : User[],
                                             addressLine1 : String, addressLine1Kanji : String, city : String, cityKanji : String,
                                             state : State, zip : String, country : String, currency : Currency) : ProducerCode {
    var pc = loadProducerCode(bundle, code, description, branch, org, groups, users, currency)
    var address = new Address(pc)
    pc.Address = address
    setAddressFields(address, "business", "Work address", addressLine1, city, state, zip, country)
    return pc
  }

  protected static function loadCompany(bundle : Bundle, email : String, phone : String, name : String, addressLine1 : String,
                                        city : String, state : String, zip : String, country : String) : Company {
    return loadCompany(bundle, email, phone, name, null, addressLine1, null, city, null, state, zip, country)
  }

  /**
   * Overload for Japan.
   */
  protected static function loadCompany(bundle : Bundle, email : String, phone : String, name : String, nameKanji : String, addressLine1 : String, addressLine1Kanji : String,
                                        city : String, cityKanji : String, state : String, zip : String, country : String) : Company {
    var company = new Company(bundle)
    company.Name = name
    company.NameKanji = nameKanji
    company.EmailAddress1 = email
    company.WorkPhone = phone
    company.FaxPhone = phone
    company.PrimaryPhone = "work"
    company.PrimaryAddress = new Address(company)
    setAddressFields(company.PrimaryAddress, "business", "Work address", addressLine1, addressLine1Kanji, city, cityKanji, state, zip, country)
    return company
  }

  protected static function loadAssignableQueue(bundle : Bundle, group : Group, name : String, subGroupVisible : boolean) : AssignableQueue {
    var queue = new AssignableQueue(bundle)
    queue.Group = group
    queue.Name = name
    queue.SubGroupVisible = subGroupVisible
    return queue
  }

  protected static function setAddressFields(addr : Address, type : AddressType, desc : String, line1 : String, city : String,
                                             state : State, zip : String, country : String) {
    setAddressFields(addr, type, desc, line1, null, city, null, state, zip, country)
  }

  /**
   * Overload for Japan.
   */
  protected static function setAddressFields(addr : Address, type : AddressType, desc : String, line1 : String, line1Kanji : String, city : String, cityKanji : String,
                                             state : State, zip : String, country : String) {
    addr.AddressType = type
    addr.Description = desc
    addr.AddressLine1 = line1
    addr.AddressLine1Kanji = line1Kanji
    addr.City = city
    addr.CityKanji = cityKanji
    addr.State = state
    addr.PostalCode = zip
    addr.Country = country
  }

  protected static function joinUserToGroup(user : User, group : Group) {
    var join = new GroupUser(user)
    join.User = user
    join.Group = group
  }

  protected static function joinUserToProducerCode(user : User, pc : ProducerCode) {
    var join = new UserProducerCode(user)
    join.User = user
    join.ProducerCode = pc
    var roleQuery = Query.make(Role).compare("PublicID", Equals, "producer")
    join.Role = roleQuery.select().AtMostOneRow
    if (join.Role == null) {
      throw "Cannot find Role \"producercode\""
    }
  }

  protected static function joinGroupToProducerCode(group : Group, pc : ProducerCode) {
    var join = new GroupProducerCode(group)
    join.Group = group
    join.ProducerCode = pc
  }

  protected static function findUser(credentialName : String) : User {
    var user = PLDependenciesGateway.getUserFinder().findByCredentialName(credentialName)
    if (user == null) {
      throw "Could not find user " + credentialName + "."
    }
    return user
  }

  protected static function findGroup(name : String) : Group {
    var groupQuery = Query.make(Group).compare("Name", Equals, name)
    var group = groupQuery.select().getFirstResult()
    if (group == null) {
      throw "Could not find group " + name + "."
    }
    return group
  }

  protected static function findOrganization(name : String) : Organization {
    var organizationQuery = Query.make(Organization).compare("Name", Equals, name)
    var org = organizationQuery.select().getFirstResult()
    if (org == null) {
      throw "Could not find organization " + name + "."
    }
    return org
  }

  protected static function findSecurityZone(zone : String) : SecurityZone {
    var securityZoneQuery = Query.make(SecurityZone).compare("Name", Equals, zone)
    var secZone = securityZoneQuery.select().getFirstResult()
    if (secZone == null) {
      throw "Could not find security zone " + zone + "."
    }
    return secZone
  }

  protected static function findRegion(name : String) : Region {
    var regionQuery = Query.make(Region).compare("Name", Equals, name)
    var region = regionQuery.select().getFirstResult()
    if (region == null) {
      throw "Could not find Region " + name + "."
    }
    return region
  }

  // ============================================= CONTACT CREATION HELPERS

  protected static function companyLoaded(name : String) : boolean {
    var companyQuery = Query.make(Company).compare("Name", Equals, name)
    return companyQuery.select().HasElements
  }

  protected static function buildPerson(firstName : String, lastName : String, firstNameKanji : String,
                                        lastNameKanji : String, ssn : String) : PersonBuilder {
    if (ssn == null) {
      ssn = genSSN(firstName, lastName)
    } else if (not repeatedSSNs.containsKey(firstName + " " +lastName)) {
      repeatedSSNs.put(firstName + " " + lastName, ssn)
    }

    var builder = new PersonBuilder(Integer.parseInt(ssn.substring(7)), false).withFirstName(firstName)
        .withLastName(lastName).withFirstNameKanji(firstNameKanji).withLastNameKanji(lastNameKanji)

    builder.withOfficialID(OfficialIDType.TC_SSN, ssn)
    builder.withTaxID(ssn)
    return builder
  }

  protected static function loadPerson(bundle : Bundle, prefix : NamePrefix, firstName : String, lastName : String,
                                       firstNameKanji : String, lastNameKanji : String,
                                       primaryPhone : PrimaryPhoneType, phoneNumber : String, vendorType : VendorType,
                                       addressType : AddressType, addressLine1 : String,
                                       addressCity : String, addressCityKanji : String, addressState : State, addressZIP : String,
                                       addressCountry : String, ssn : String, doAdditions : block(b : PersonBuilder)) {
    loadPerson(bundle, prefix, firstName, lastName, firstNameKanji, lastNameKanji, primaryPhone, phoneNumber, vendorType,
        addressType, addressLine1, null, addressCity, addressCityKanji, addressState, addressZIP, addressCountry, ssn, \ p -> {})
  }

  protected static function loadPerson(bundle : Bundle, prefix : NamePrefix, firstName : String, lastName : String,
                                       primaryPhone : PrimaryPhoneType, phoneNumber : String, vendorType : VendorType,
                                       addressType : AddressType, addressLine1 : String, addressCity : String,
                                       addressState : State, addressZIP : String, addressCountry : String,
                                       ssn : String, doAdditions : block(b : PersonBuilder)) {
    loadPerson(bundle, prefix, firstName, lastName, null, null, primaryPhone, phoneNumber, vendorType,
        addressType, addressLine1, null, addressCity, null, addressState, addressZIP, addressCountry, ssn, \ p -> {})
  }

  protected static function loadPerson(bundle : Bundle, prefix : NamePrefix, firstName : String, lastName : String,
                                       firstNameKanji : String, lastNameKanji : String,
                                       primaryPhone : PrimaryPhoneType, phoneNumber : String, vendorType : VendorType,
                                       addressType : AddressType, addressLine1 : String, addressLine1Kanji: String,
                                       addressCity : String, addressCityKanji : String, addressState : State, addressZIP : String,
                                       addressCountry : String, ssn : String, doAdditions : block(b : PersonBuilder)) {

    var builder = buildPerson(firstName, lastName, firstNameKanji, lastNameKanji, ssn)

    builder.withPrefix(prefix)
        .withVendorType(vendorType)
        .withAddress(makeAddressBuilder(addressType, addressLine1, addressLine1Kanji, addressCity, addressCityKanji, addressState, addressZIP, addressCountry))

    if (primaryPhone == "work") {
      builder.withWorkPhone( phoneNumber )
    } else if (primaryPhone == "home") {
      builder.withHomePhone( phoneNumber )
    } else if (primaryPhone == "mobile") {
      builder.withCellPhone( phoneNumber )
    }

    builder.withPrimaryPhone(primaryPhone)
    doAdditions(builder)

    var person = builder.create(bundle)
    person.PublicID = "test_pp:" + _publicIdCounter.AndIncrement
    person.AutoSync = AutoSync.TC_SUSPENDED // stop creating message for sample contacts
  }

  protected static function loadPerson(bundle : Bundle, prefix : NamePrefix, firstName : String, lastName : String,
                                       primaryPhone : PrimaryPhoneType, phoneNumber : String, vendorType : VendorType,
                                       addressType : AddressType, addressLine1 : String, addressCity : String,
                                       addressState : State, addressZIP : String, addressCountry : String, ssn : String) {
    loadPerson(bundle, prefix, firstName, lastName, null, null, primaryPhone, phoneNumber, vendorType,
        addressType, addressLine1, null, addressCity, null, addressState, addressZIP, addressCountry, ssn, \ p -> {})
  }

  protected static function loadPerson(bundle : Bundle, prefix : NamePrefix, firstName : String, lastName : String,
                                       primaryPhone : PrimaryPhoneType, phoneNumber : String, vendorType : VendorType,
                                       addressType : AddressType, addressLine1 : String, addressCity : String,
                                       addressState : State, addressZIP : String, addressCountry : String) {

    loadPerson(bundle, prefix, firstName, lastName, primaryPhone, phoneNumber, vendorType, addressType, addressLine1, addressCity, addressState, addressZIP, addressCountry, null)
  }

  protected static function buildCompany(name : String, taxID : String) : CompanyBuilder {
    if (taxID == null) {
      taxID = genFEIN(name)
    } else if (not repeatedFEINs.containsKey(name)) {
      repeatedFEINs.put(name, taxID)
    }

    return new CompanyBuilder(Integer.parseInt(taxID.substring(6)), false)
        .withCompanyName(name)
        .withOfficialID(OfficialIDType.TC_FEIN, taxID)
        .withTaxID(taxID)
  }

  protected static function loadCompany(bundle : Bundle, name : String, nameKanji : String, workPhone : String,
                                        vendorType : VendorType, preferred : boolean, addressType : AddressType,
                                        addressLine1 : String, addressCity : String, addressCityKanji : String,
                                        addressState : State, addressZIP : String, addressCountry : String,
                                        taxID : String, doAdditions : block(cb : CompanyBuilder)) {
    loadCompany(bundle, name, nameKanji, workPhone, vendorType, preferred, addressType, addressLine1, null,
        addressCity, addressCityKanji,addressState, addressZIP, addressCountry, taxID, doAdditions)
  }
  protected static function loadCompany(bundle : Bundle, name : String, nameKanji : String, workPhone : String,
                                        vendorType : VendorType, preferred : boolean, addressType : AddressType,
                                        addressLine1 : String, addressLine1Kanji : String, addressCity : String, addressCityKanji : String,
                                        addressState : State, addressZIP : String, addressCountry : String,
                                        taxID : String, doAdditions : block(cb : CompanyBuilder)) {
    var builder = buildCompany(name, taxID)

    builder.withCompanyName(name).withCompanyNameKanji(nameKanji)
        .withWorkPhone(workPhone)
        .withPreferred(preferred)
        .withAddress(makeAddressBuilder(addressType, addressLine1, addressLine1Kanji, addressCity, addressCityKanji, addressState,
        addressZIP, addressCountry))

    doAdditions(builder)

    var company = builder.create(bundle)
    company.PublicID = "test_pc:" + _publicIdCounter.AndIncrement
    company.AutoSync = AutoSync.TC_SUSPENDED // stop creating message for sample contacts
  }

  protected static function loadCompany(bundle : Bundle, name : String, workPhone : String, vendorType : VendorType,
                                        preferred : boolean, addressType : AddressType, addressLine1 : String,
                                        addressCity : String, addressState : State, addressZIP : String, addressCountry : String,
                                        taxID : String) {
    loadCompany(bundle, name, null, workPhone, vendorType, preferred,
        addressType, addressLine1, null, addressCity, null, addressState, addressZIP, addressCountry, taxID, \ c -> {})
  }

  protected static function loadCompany(bundle : Bundle, name : String, workPhone : String, vendorType : VendorType,
                                        preferred : boolean, addressType : AddressType, addressLine1 : String,
                                        addressCity : String, addressState : State, addressZIP : String, addressCountry : String) {
    loadCompany(bundle, name, workPhone, vendorType, preferred, addressType, addressLine1, addressCity, addressState, addressZIP, addressCountry, null)
  }

  protected static function makeAddressBuilder(addressType : AddressType, addressLine1 : String, addressLine1Kanji : String, addressCity : String,
                                               addressCityKanji : String, addressState : State, addressZIP : String,
                                               addressCountry : String) : AddressBuilder {
    return new AddressBuilder()
        .asType(addressType)
        .withAddressLine1(addressLine1 )
        .withAddressLine1Kanji(addressLine1Kanji )
        .withCity(addressCity)
        .withCityKanji(addressCityKanji)
        .withState(addressState)
        .withPostalCode(addressZIP)
        .withCountry(addressCountry)
  }

  // ============================================= ACCOUNT CREATION HELPERS

  /**
   * Returns true if a account with the given accunt number exists, false otherwise.
   * @param accountNumber the account number to search against.
   */
  protected static function accountLoaded(accountNumber : String) : boolean {
    var accountQuery = Query.make(Account).compare("AccountNumber", Equals, accountNumber)
    return accountQuery.select().HasElements
  }

  protected static function loadCompanyAccount(accountNumber: String, publicID: String, companyName: String,
                                               industryCode: String, phoneNumber: String, companyNames : String[]): Account {

    return loadCompanyAccount(accountNumber, publicID, companyName, industryCode, phoneNumber, \ accountBuilder -> {
      addLocations(accountBuilder, {State.TC_TX, State.TC_NY})

      addDrivers(accountBuilder, {buildDriver("John", "Smith")})

      addCompanyContacts(accountBuilder, companyNames)
    })

  }

  protected static function findCompany(name : String, workPhone : String) : Company {
    var query = Query.make(Company)
    query.compare("Name", Equals, name)
    query.compare("WorkPhone", Equals, workPhone)
    return query.select().AtMostOneRow
  }

  protected static function loadCompanyAccount(accountNumber: String, publicID: String, companyName: String,
                                               industryCode: String, phoneNumber: String,
                                               doAccountAdditions : block(ab : AccountBuilder)): Account {

    var existingContact = findCompany(companyName, phoneNumber)

    var result : Account
    runTransactionAsUser(null, "CompanyAccount " + accountNumber, \b -> {
      var builder = new AccountBuilder(false)
          .withPublicId(publicID)
          .withAccountNumber(accountNumber)
          .withIndustryCode(findIndustryCode(industryCode))

      if (existingContact == null) {
        var companyBuilder = buildCompany(companyName, null).withWorkPhone(phoneNumber)
        builder.withAccountHolderContact(companyBuilder)
      } else {
        builder.withAccountHolderContact(existingContact)
      }

      doAccountAdditions(builder)

      result = builder.create(b)
    })

    return result
  }

  protected static function loadPersonAccount(accountNumber: String, firstName: String, lastName: String, companyNames : String[]): Account {
    return loadPersonAccount(accountNumber, firstName, lastName, \ accountBuilder -> {
      addLocations(accountBuilder, {State.TC_TX, State.TC_NY})

      addDrivers(accountBuilder, {buildDriver("John", "Smith")})

      addCompanyContacts(accountBuilder, companyNames)
    })
  }

  protected static function findPerson(firstName : String, lastName : String, ssn : String = null) : Person {
    var query = Query.make(Person)
    query.compare("FirstName", Equals, firstName)
    query.compare("LastName", Equals, lastName)
    if (ssn != null) {
      query.compare("TaxID", Equals, ssn)
    }
    return query.select().AtMostOneRow
  }

  protected static function loadPersonAccount(accountNumber: String, firstName: String, lastName: String,
                                              doAccountAdditions : block(ab : AccountBuilder)): Account {
    var existingContact = findPerson(firstName, lastName)

    var result : Account

    runTransactionAsUser(null, "PersonalAccount " + accountNumber, \b -> {
      var builder = new AccountBuilder(false)
          .withAccountNumber(accountNumber)
      if (existingContact == null) {
        var personBuilder = buildPerson(firstName, lastName, null, null, null)
        builder.withAccountHolderContact(personBuilder)
      } else {
        builder.withAccountHolderContact(existingContact)
      }

      doAccountAdditions(builder)

      result = builder.create(b)
    })

    return result
  }

  protected static function addDrivers(accountBuilder : AccountBuilder, accountDrivers : PersonBuilder[], asNamedInsured : boolean = false) {
    for (driver in accountDrivers) {
      var acb = new AccountContactBuilder().asDriver().withContact(driver)
      if (asNamedInsured) acb.asNamedInsured()
      accountBuilder.withAccountContact(acb)
    }
  }

  protected static function addPersonsAsDrivers(accountBuilder : AccountBuilder, accountDrivers : Person[], asNamedInsured : boolean = false) {
    for (driver in accountDrivers) {
      var acb = new AccountContactBuilder().asDriver().withContact(driver)
      if (asNamedInsured) acb.asNamedInsured()
      accountBuilder.withAccountContact(acb)
    }
  }

  protected static function addLocations(accountBuilder : AccountBuilder, accountLocations : List<State>) {
    for (location in accountLocations) {
      accountBuilder.withAccountLocation(new AccountLocationBuilder().withState(location))
    }
  }

  protected static function addCompanyContacts(accountBuilder: AccountBuilder, companyNames : String[]) {
    for (companyName in companyNames) {
      accountBuilder.withAccountContact(new AccountContactBuilder().asNamedInsured()
          .withContact(buildCompany(companyName, null))
      )
    }
  }

  protected static function findIndustryCode(code: String): IndustryCode {
    return PCDependenciesGateway.getIndustryCodeFinder().findIndustryCodeByCodeAndType(code, IndustryCodeType.TC_SIC, true)
  }

  // ============================================= POLICY CREATION HELPERS

  protected static function jobLoaded(jobNumber : String) : boolean {
    var jobQuery = Query.make(Job).compare("JobNumber", Equals, jobNumber)
    return jobQuery.select().HasElements
  }

  protected static function loadPolicyChange(basedOnJobNumber: String, jobNumber: String) {
    runTransactionAsUser(null, "PolicyChange " + jobNumber, \bundle -> {
      new PolicyChangeBuilder().withBasedOnPeriod(findPeriodByJobNumber(basedOnJobNumber, bundle)).withJobNumber(jobNumber).create(bundle)
    })
  }

  protected static function findAccount(accountNumber : String) : Account {
    var accountQuery = Query.make(Account).compare("AccountNumber", Equals, accountNumber)
    return accountQuery.select().AtMostOneRow
  }

  protected static function loadSubmission(jobNumber: String, accountNumber: String, product: Product, effDate: DateTime,
                                           insuredNames : String[], bound : Boolean, publicID : String = null) : PolicyPeriod {

    var account = findAccount(accountNumber)
    if (account == null) {
      throw "Cannot find account #" + accountNumber + " for generating Submission " + jobNumber
    }
    var policyPeriod : PolicyPeriod

    runTransactionAsUser(null, "Submission " + jobNumber, \b -> {
      account = b.loadBean(account as Key) as Account

      var builder = new SubmissionBuilder()
          .withAccount(account)
          .withProduct(product)
          .withEffectiveDate(effDate)
          .withJobNumber(jobNumber)
          .withProducerSelection(new SubmissionBuilder().makeProducerSelection(b))

      if (publicID != null) {
        builder.withPublicId(publicID)
      }

      if (!bound) {
        builder = builder.isQuoted()
      }

      var accountContacts = new ArrayList<AccountContact> ()
      for (insuredName in insuredNames) {
        var accountContact = findAccountContact(account, typekey.AccountContactRole.TC_NAMEDINSURED, insuredName)
        accountContacts.add(accountContact)
      }

      var txLocation : AccountLocation
      var nyLocation : AccountLocation
      var txLoc : PolicyLocationBuilder
      var nyLoc : PolicyLocationBuilder

      if (product == "PersonalAuto") {
        var baseState = account.PrimaryLocation.State
        // drivers must be licensed in the base state of the line and all vehicles must be garaged in
        // that state as well so since drivers are licensed in CA vehicles must be in CA as well which
        // is the primary account location assigned to vehicles by default
        var accountDriver = findAccountContact(account, typekey.AccountContactRole.TC_DRIVER)
        var vehicleDriver1 = new VehicleDriverBuilder()
        var vehicleDriver2 = new VehicleDriverBuilder()
        var vehicle1 = new PAVehicleBuilder().withVehicleDriver(vehicleDriver1)
        var vehicle2 = new PAVehicleBuilder().withVIN("2").withVehicleDriver(vehicleDriver2)
        var driver = new PolicyDriverBuilder().withAccountContactRole(accountDriver.getRole("Driver"))

        builder
            .withBaseState(baseState)
            .withPolicyLine(new PersonalAutoLineBuilder().withVehicle(vehicle1)
            .withVehicle(vehicle2)
            .withPolicyDriver(driver))
            .withPolicyContactRole(driver.withVehicleDriver(vehicleDriver1)
            .withVehicleDriver(vehicleDriver2)
        )

        if(accountContacts.HasElements){
          var firstContact = accountContacts.sortBy(\ a -> a.DisplayName).first()
          //if it's personal auto, we add secondary name insured
          builder.withSecondaryNamedInsured(new PolicySecNamedInsuredBuilder().withAccountContactRole(firstContact.getRole("NamedInsured")))
        }
      } else {
        for(accountContact in accountContacts) {
          //every other line, we add additional name insured
          builder.withPolicyContactRole(new PolicyAddlNamedInsuredBuilder().withAccountContactRole(accountContact.getRole("NamedInsured")))
        }
        // commercial policies require TX and NY locations
        txLocation = findOrAddAccountLocation(account, "TX", b)
        nyLocation = findOrAddAccountLocation(account, "NY", b)
        txLoc = new PolicyLocationBuilder().withAccountLocation(txLocation).withName( "TXLocation" )
        nyLoc = new PolicyLocationBuilder().withAccountLocation(nyLocation).withName( "NYLocation" )
        builder
            .withPolicyLocation(txLoc)
            .withPolicyLocation(nyLoc)
      }

      if (product == "BusinessOwners") {
        builder.withPolicyLine(new BOPLineBuilder()
            .withBOPLocation(new BOPLocationBuilder()
                .withBuilding( new BOPBuildingBuilder().withBuilding(new BuildingBuilder()))) // BOPLocationEU for primary location
            .withBOPLocation(new BOPLocationBuilder().withLocation(txLoc)
                .withBuilding( new BOPBuildingBuilder().withBuilding(new BuildingBuilder())))
            .withBOPLocation(new BOPLocationBuilder().withLocation(nyLoc)
                .withBuilding( new BOPBuildingBuilder().withBuilding(new BuildingBuilder())))
        )
      }

      if (product == "BusinessAuto") {
        builder.withPolicyLine(new BusinessAutoLineBuilder()
            .withCoverage(new CoverageBuilder(BAOwnedLiabilityCov).withPatternCode("BAOwnedLiabilityCov"))
            .withJurisdiction(new BAJurisdictionBuilder().withState(TC_TX))
            .withJurisdiction(new BAJurisdictionBuilder().withState(TC_NY))
            .withVehicle(new BAVehicleBuilder().withLocation(txLoc))
            .withVehicle(new BAVehicleBuilder().withLocation(nyLoc))
        )
      }

      if (product == "WorkersComp") {
        builder.withPolicyLine(new WorkersCompLineBuilder()
            .withJurisdiction( new WCJurisdictionBuilder(JurisdictionMappingUtil.getJurisdiction(txLocation)) )
            .withJurisdiction( new WCJurisdictionBuilder(JurisdictionMappingUtil.getJurisdiction(nyLocation) ))
            .withWCCoveredEmployee(new WCCoveredEmployeeBuilder())
            .withWCCoveredEmployee(new WCCoveredEmployeeBuilder().withLocation(txLoc))
            .withWCCoveredEmployee(new WCCoveredEmployeeBuilder().withLocation(nyLoc))
        )
            .withReportingPlan() // need this so we can test audits in batch load
      }

      policyPeriod = builder.create(b)
    })

    // validatePeriod(policyPeriod)
    return policyPeriod
  }

  protected static function validatePeriod(policyPeriod: PolicyPeriod) {
    var result = PolicyPeriodValidation.validatePeriod( policyPeriod, "bindable" )
    if (result.hasErrors()) {
      throw new InvalidPolicyRetrievalException(policyPeriod, result.Errors.toArray(new gw.api.validation.ValidationIssue[result.Errors.size()]))
    }
  }

  protected static function findAccountContact(account: Account, role: typekey.AccountContactRole, displayName : String = null): AccountContact {
    var ret = account.getAccountContactsWithRole(role).where(\ ac -> displayName == null or ac.DisplayName == displayName).first()
    if (ret == null) {
      throw "Cannot find AccountContact for \"" + displayName + "\" and role \"" + role + "\" on account \"" + account + "\""
    }
    return ret
  }

  protected static function findAccountLocation(account: Account, state: State): AccountLocation {
    var locations = account.AccountLocations
    for (location in locations) {
      if (location.State == state) {
        return location
      }
    }
    throw "Cannot find AccountLocation for " + state + " on account " + account
  }

  protected static function findOrAddAccountLocation(account: Account, state: State, bundle : Bundle): AccountLocation {
    var locations = account.AccountLocations
    for (location in locations) {
      if (location.State == state) {
        return location
      }
    }
    account.addAndNumberAccountLocation(new AccountLocationBuilder().withState(state).create(bundle))
    return findAccountLocation(account, state)
  }

  protected static function findPeriodByJobNumber(jobNumber : String, intoBundle : Bundle) : PolicyPeriod {
    var job = Job.finder.findJobByJobNumber( jobNumber )
    if (job == null) {
      throw "Cannot find job with number \"" + jobNumber + "\""
    }
    return intoBundle.add(job.LatestPeriod)
  }

  protected static function loadJobActivity(jobNumber : String, subject : String, username : String) : Activity {
    var user = PLDependenciesGateway.getUserFinder().findByCredentialName(username)
    if (user == null) {
      throw "Could not find user with credential name " + username + " for JobActivity '" + subject + "'" + " on job " + jobNumber
    }
    var job = Job.finder.findJobByJobNumber(jobNumber)
    if (job == null) {
      throw "Could not find job with number " + jobNumber + " for JobActivity '" + subject + "'"
    }
    var activity : Activity
    runTransactionAsUser(null, "JobActivity '" + subject + "' on job " + jobNumber, \b -> {
      activity = new ActivityBuilder().withOpenStatus().on(job).withSubject(subject).assignedToUser(user).isAssigned().create(b)
    })
    return activity
  }

  protected static function loadPolicyActivity(policyNumber : String, subject : String, username : String) : Activity {
    var user = PLDependenciesGateway.getUserFinder().findByCredentialName(username)
    if (user == null) {
      throw "Could not find user with credential name " + username + " for PolicyActivity" + subject + "'" + " on job " + policyNumber
    }
    var policy = Policy.finder.findPolicyByPolicyNumber(policyNumber)
    if (policy == null) {
      throw "Could not find policy with number " + policyNumber + " for PolicyActivity '" + subject + "'"
    }
    var activity : Activity
    runTransactionAsUser(null, "PolicyActivity '" + subject + "' on job " + policyNumber, \b -> {
      activity = new ActivityBuilder().withOpenStatus().on(policy).on(policy.Account).withSubject(subject).assignedToUser(user).isAssigned().create(b)
    })
    return activity
  }
}
