package gw.sampledata.tiny

uses gw.sampledata.AbstractSampleDataCollection
uses gw.transaction.Transaction

/**
 * A tiny set of Persons and Companies, just enough for testing.
 */
@Export
class TinySampleContactData extends AbstractSampleDataCollection
{
  construct() { }

  /**
   * The name of this sample data collection, for logging and debugging
   */
  public override property get CollectionName() : String {
    return "Tiny Contacts"
  }
  
  /**
   * Checks the database, returning true if this set is already loaded (and thus doesn't need reloading)
   */
  public override property get AlreadyLoaded() : boolean {
    return companyLoaded("Wright Construction")
  }
  
  /**
   * Loads the contents of this sample data set into the DB
   */
  public override function load() {
    Transaction.runWithNewBundle(\bundle -> {
    
      // PEOPLE
      loadPerson(bundle, "ms", "Nancy", "Furman", "work", "818-446-1206", null, "business", "846 Yount Ln.", "Hollywood", "CA", "91357", "US")
      loadPerson(bundle, "mr", "Ray", "Newton", "work", "818-446-1206", null, "home", "1253 Paloma Ave", "Arcadia", "CA", "91007", "US")
      loadPerson(bundle, "mr", "Stan", "Newton", "work", "818-446-1206", null, "home", "1253 Paloma Ave", "Arcadia", "CA", "91007", "US")
      loadPerson(bundle, "mr", "Dirk", "Lamparter", "work", "626-473-9576", null, "business", "12534 Ocean View Blvd. #2F", "Santa Monica", "CA", "91112", "US")
      loadPerson(bundle, "mr", "Bill", "Kinman", "home", "502-897-3038", null, "home", "4040 Elmwood Ave", "Louisville", "KY", "40207", "US")
      
      // COMPANIES
      loadCompany(bundle, "Wright Construction", "818-446-1206", null, false, "business", "846 Yount Ln.", "Hollywood", "CA", "91357", "US")
      loadCompany(bundle, "Armstrong Cleaners", "626-473-9576", null, false, "business", "1 Energy Drive", "San Ramon", "CA", "94833", "US")
      loadCompany(bundle, "Monrovia Metalworking", "626-473-9576", null, false, "business", "3465 E Foothill Blvd", "Monrovia", "CA", "91006", "US")
      loadCompany(bundle, "Calloway Cheese Factory", "608-833-5798", null, false, "business", "6604 Odana Rd", "Madison", "WI", "53719", "US")
      loadCompany(bundle, "Big Lake Bakery", "920-208-6733", null, false, "business", "826 N 8th St", "Sheboygan", "WI", "53081", "US")
      
    })
  }
    
}
