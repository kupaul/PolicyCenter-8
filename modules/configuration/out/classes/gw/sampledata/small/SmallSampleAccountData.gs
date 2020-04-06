package gw.sampledata.small

uses gw.sampledata.AbstractSampleDataCollection
uses gw.api.builder.*
uses gw.sampledata.SampleDataConstants
uses gw.api.database.Query

/**
 * A small set of sample Accounts.
 */
@Export
class SmallSampleAccountData extends AbstractSampleDataCollection {
  
  construct() { }

  /**
   * The name of this sample data collection, for logging and debugging
   */
  public override property get CollectionName() : String {
    return "Small Accounts"
  }
  
  /**
   * Checks the database, returning true if this set is already loaded (and thus doesn't need reloading)
   */
  public override property get AlreadyLoaded() : boolean {
    return accountLoaded("C000212105")
  }
    
  /**
   * Loads the contents of this sample data set into the DB
   */
  public override function load() {
    
    // Wright Construction
    runTransactionAsUser("bbaker", "Account C000212105", \b -> { 
      var wrightConstructionAddress = new AddressBuilder()
                             .withAddressLine1("846 Yount Ln.")
                             .withCity("Hollywood")
                             .withState("CA")
                             .withPostalCode("91357")
       var wrightConstruction = buildCompany("Wright Construction", "23-2345678")
                             .withAddress(wrightConstructionAddress)
                             .withWorkPhone("818-446-1206")
       var builder = new AccountBuilder(false)
                             .withPublicId("pc:ds:1")
                             .withAccountHolderContact(wrightConstruction)
                             .withAccountNumber("C000212105")                            
                             .withIndustryCode(findIndustryCode("1522"))
                             .withAccountLocation(new AccountLocationBuilder(1).withState("TX"))
                             .withAccountLocation(new AccountLocationBuilder(2).withState("NY"))
                             .withAccountContact(new AccountContactBuilder().asDriver().withContact(buildDriver("John","Smith")))
       addCompanyContacts(builder, SampleDataConstants.ACCOUNT_COMPANY_NAMES)
       builder.create(b)
    })

    // Ray Newton
    var query = Query.make(Person)
    query.compare("FirstName", Equals, "Ray")
    query.compare("LastName", Equals, "Newton")
    var rayNewtonContact = query.select().single()
    runTransactionAsUser("aapplegate", "Account C000143542", \b -> { 
      var builder = new AccountBuilder(false)
                             .withAccountContact(new AccountContactBuilder().asDriver().asAccountHolder().withContact(rayNewtonContact))                             
                             .withAccountNumber("C000143542")
                             .withAccountLocation(new AccountLocationBuilder(1).withState("TX"))
                             .withAccountLocation(new AccountLocationBuilder(2).withState("NY"))
                             .withAccountContact(new AccountContactBuilder().asDriver().withContact(buildDriver("John","Smith")))
      addCompanyContacts(builder, SampleDataConstants.ACCOUNT_COMPANY_NAMES)
      builder.create(b)
    })
     
    loadCompanyAccount("S000212121", "pc:ds2", "Armstrong Cleaners", "1522", "626-473-9576", SampleDataConstants.ACCOUNT_COMPANY_NAMES)
    loadCompanyAccount("C000456352", null, "Monrovia Metalworking", "3444", null, SampleDataConstants.ACCOUNT_COMPANY_NAMES)
    loadPersonAccount("C000456354", "Wendell", "Jackson", SampleDataConstants.ACCOUNT_COMPANY_NAMES)
    loadPersonAccount("C000456355", "Helen", "Delancy", SampleDataConstants.ACCOUNT_COMPANY_NAMES)
    
    // Give aapplegate some account history
    runTransactionAsUser(null, "User history aapplegate", \b -> {
      var aapplegate = findUser("aapplegate")
      var settings = b.add(aapplegate.getOrCreateUserSettings())
      settings.LastAccounts = "C000212105|C000143542|S000212121"
    })
  }
    
}
