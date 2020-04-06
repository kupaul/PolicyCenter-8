package gw.sampledata.small

uses gw.sampledata.AbstractSampleDataCollection
uses gw.transaction.Transaction
uses gw.api.database.Query

/**
 * A larger set of Users / Groups / Orgs / ProducerCodes.
 */
@Export
class SmallSampleCommunityData extends AbstractSampleDataCollection
{
  private static var busProdOffsUsGrp : entity.Group
  private static var westRgnGrp : entity.Group
  private static var eastRgnGrp : entity.Group
  private static var losAngBrnchGrp : entity.Group
  private static var losAngBrnchUwGrp : entity.Group
  private static var homeOffUwGrp : entity.Group
  private static var homeOffLcGrp : entity.Group
  private static var homeOffMktngGrp : entity.Group
  private static var homeOffAdmSrvcsGrp : entity.Group
  private static var sltnsGrp : entity.Group
  private static var westMidWestRgnGrp : entity.Group
  private static var eastMidWestRgnGrp : entity.Group
  private static var alxBrnchGrp : entity.Group
  private static var birmBrnchGrp : entity.Group
  private static var bostBrnchGrp : entity.Group
  private static var bridgeBrnchGrp : entity.Group
  private static var tmpaBrnchGrp : entity.Group
  private static var trenBrnchGrp : entity.Group
  private static var boisBrnchGrp : entity.Group
  private static var phnxBrnchGrp : entity.Group
  private static var portBrnchGrp : entity.Group
  private static var sacrBrnchGrp : entity.Group
  private static var sltLakeCtyBrnchGrp : entity.Group
  private static var dlsBrnchGrp : entity.Group
  private static var dnvBrnchGrp : entity.Group
  private static var stLousBrnchGrp : entity.Group
  private static var cleveBrnchGrp : entity.Group
  private static var minnBrnchGrp : entity.Group
  private static var minnBrnchUwGrp : entity.Group



  construct() { }

  /**
   * The name of this sample data collection, for logging and debugging
   */
  public override property get CollectionName() : String {
    return "Small Community"
  }
  
  /**
   * Checks the database, returning true if this set is already loaded (and thus doesn't need reloading)
   */
  public override property get AlreadyLoaded() : boolean {
    return credentialLoaded("enyugen")
  }
  
  /**
   * Loads the contents of this sample data set into the DB
   */
  public override function load() {
    var underwriter1 = Query.make(UWAuthorityProfile).compare("Name", Equals, "Underwriter 1").select().single()
    var underwriter2 = Query.make(UWAuthorityProfile).compare("Name", Equals, "Underwriter 2").select().single()
    var agent1 = Query.make(UWAuthorityProfile).compare("Name", Equals, "Agent 1").select().single()
    
    var enigmaOrg = findOrganization("Enigma Fire & Casualty")
    var svisor = findUser("svisor")
    var ccraft = findUser("ccraft")
      
    var enyugen : User  
    var fwagner : User
    var gwang : User
    var hjohnson : User
    var mmaples : User
      
    Transaction.runWithNewBundle( \bundle ->  {
      // carrier     
      loadUser(bundle, "superuser", "other", enigmaOrg, false, false, "system", "guidewire@enigma_fc.com ", "Guidewire", "System", "213-555-8164", "143 Lake Ave. Suite 500", "Pasadena", "CA", "91253", "US")
      enyugen = loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, 
                             "enyugen", "enyugen@enigma_fc.com", "Elizabith", "Nyugen", "213-555-8164", 
                             "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      fwagner = loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, 
                             "fwagner", "fwagner@enigma_fc.com", "Felicien", "Wagner", "213-555-8164", 
                             "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      gwang = loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, 
                           "gwang", "gwang@enigma_fc.com", "Gracy", "Wang", "213-555-8164", 
                           "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      hjohnson = loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, 
                              "hjohnson", "hjohnson@enigma_fc.com", "Harold", "Johnson", "213-555-8164", 
                              "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      mmaples = loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, 
                             "mmaples", "mmaples@enigma_fc.com", "Mary", "Maples", "213-555-8164", 
                             "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter2})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, 
               "jwork", "jwork@enigma_fc.com", "Jane", "Work", "213-555-8164", 
               "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, 
               "kraftly", "kraftly@enigma_fc.com", "Ken", "Raftly", "213-555-8164", 
               "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "ldonahue", "ldonahue@enigma_fc.com", "Larry", "Donahue", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "mikeshaw", "mshaw@enigma_fc.com", "Mandy", "Shaw", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "ndrew", "ndrew@enigma_fc.com", "Ned", "Drew", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "oyoung", "oyoung@enigma_fc.com", "Olive", "Young", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "pgrimes", "pgrimes@enigma_fc.com", "Patricia", "Grimes", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "rwest", "rwest@enigma_fc.com", "Raylene", "West", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "sfarley", "sfarley@enigma_fc.com", "Sharon", "Farley", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "wmann", "wmann@enigma_fc.com", "Wendy", "Mann", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "alevin", "alevin@enigma_fc.com", "Adele", "Levin", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "bhunter", "bhunter@enigma_fc.com", "Branda", "Hunter", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "ctersley", "ctersley@enigma_fc.com", "Clara", "Tersley", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "devans", "devans@enigma_fc.com", "Donald", "Evans", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "dmyers", "dmyers@enigma_fc.com", "Doug", "Myers", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "erogers", "erogers@enigma_fc.com", "Erica", "Rogers", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "fford", "fford@enigma_fc.com", "Francoise", "Ford", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "gearnhart", "gearnhart@enigma_fc.com", "Gilbert", "Earnhart", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "alee", "alee@enigma_fc.com", "Allie", "Lee", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "amunoz", "amunoz@enigma_fc.com", "Albert", "Munoz", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "jhendricks", "jhendricks@enigma_fc.com", "Jana", "Hendricks", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "jcumberland", "jcumberland@enigma_fc.com", "Jill", "Cumberland", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "jroberts", "jroberts@enigma_fc.com", "Jacob", "Roberts", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "clevitt", "clevitt@enigma_fc.com", "Chris", "Levitt", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "sbain", "sbain@enigma_fc.com", "Stan", "Bain", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "tmcdermott", "tmcdermott@enigma_fc.com", "Terry", "McDermott", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "cbeaumont", "cbeaumont@enigma_fc.com", "Claudia", "Beaumont", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "rdavis", "rdavis@enigma_fc.com", "Ray", "Davis", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "kbrown", "kbrown@enigma_fc.com", "Karen", "Brown", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "lquinn", "lquinn@enigma_fc.com", "Laura", "Quinn", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "vpignano", "vpignano@enigma_fc.com", "Vince", "Pignano", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "abaxter", "abaxter@enigma_fc.com", "Amy", "Baxter", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "jcalhoon", "jcalhoon@enigma_fc.com", "James", "Calhoon", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "ddederick", "ddederick@enigma_fc.com", "Don", "Dederick", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "revans", "revans@enigma_fc.com", "Rachel", "Evans", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "bfawcett", "bfawcett@enigma_fc.com", "Beth", "Fawcett", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "wgompers", "wgompers@enigma_fc.com", "Wendy", "Gompers", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "bhamilton", "bhamilton@enigma_fc.com", "Burt", "Hamilton", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "sjacobs", "sjacobs@enigma_fc.com", "Sandra", "Jacobs", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "wkennison", "wkennison@enigma_fc.com", "Wesley", "Kennison", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "gloch", "gloch@enigma_fc.com", "Gwenn", "Loch", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "tmazzon", "tmazzon@enigma_fc.com", "Terence", "Mazzon", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "inumin", "inumin@enigma_fc.com", "Isabel", "Numin", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "coppley", "coppley@enigma_fc.com", "Carlos", "Oppley", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "epasquale", "epasquale@enigma_fc.com", "Ernie", "Pasquale", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "rralston", "rralston@enigma_fc.com", "Rick", "Ralston", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "tsanders", "tsanders@enigma_fc.com", "Thomas", "Sanders", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "fthomson", "fthomson@enigma_fc.com", "Faith", "Thomson", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "sulveling", "sulveling@enigma_fc.com", "Sylvia", "Ulveling", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "pvance", "pvance@enigma_fc.com", "Pam", "Vance", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "kwinslow", "kwinslow@enigma_fc.com", "Kerrie", "Winslow", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "jyancy", "jyancy@enigma_fc.com", "Jill", "Yancy", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "bzimmerson", "bzimmerson@enigma_fc.com", "Becky", "Zimmerson", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "hatley", "hatley@enigma_fc.com", "Harry", "Atley", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "pbenson", "pbenson@enigma_fc.com", "Paulette", "Benson", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "tcrawford", "tcrawford@enigma_fc.com", "Todd", "Crawford", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "sdunn", "sdunn@enigma_fc.com", "Spencer", "Dunn", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "jegertson", "jegertson@enigma_fc.com", "Jonah", "Egertson", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "lfarrell", "lfarrell@enigma_fc.com", "Lynzi", "Farrell", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "tgunderson", "tgunderson@enigma_fc.com", "Trevor", "Gunderson", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "shenson", "shenson@enigma_fc.com", "Scott", "Henson", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "gickes", "gickes@enigma_fc.com", "Gerald", "Ickes", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "ljames", "ljames@enigma_fc.com", "Lana", "James", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "fkillian", "fkillian@enigma_fc.com", "Francis", "Killian", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "ilang", "ilang@enigma_fc.com", "Ilene", "Lang", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "wmotley", "wmotley@enigma_fc.com", "Warren", "Motley", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "jnafferty", "jnafferty@enigma_fc.com", "Janet", "Nafferty", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "dolsen", "dolsen@enigma_fc.com", "Darlene", "Olsen", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "cpayne", "cpayne@enigma_fc.com", "Candice", "Payne", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "mrickter", "mrickter@enigma_fc.com", "Molly", "Rickter", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "ntamden", "ntamden@enigma_fc.com", "Nick", "Tamden", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "aclinton", "aclinton@enigma_fc.com", "Amy", "Clinton", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "jdole", "jdole@enigma_fc.com", "James", "Dole", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "dbush", "dbush@enigma_fc.com", "Don", "Bush", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "rreagan", "rreagan@enigma_fc.com", "Rachel", "Reagan", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "bcarter", "bcarter@enigma_fc.com", "Beth", "Carter", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "weisenhower", "weisenhower@enigma_fc.com", "Wendy", "Eisenhower", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "bnixon", "bnixon@enigma_fc.com", "Burt", "Nixon", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "struman", "struman@enigma_fc.com", "Sandra", "Truman", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, "wroosevelt", "wroosevelt@enigma_fc.com", "Wesley", "Roosevelt", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, "nmyrick", "nmyrick@enigma_fc.com", "Nomi", "Myrick", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {underwriter1})
    })
    
    Transaction.runWithNewBundle( \bundle ->  {
      // GROUPS 
      busProdOffsUsGrp = findGroup( "Business Production Offices - U.S.")
      westRgnGrp = findGroup( "Western Region")
      eastRgnGrp = findGroup( "Eastern Region")
      losAngBrnchGrp = findGroup( "Los Angeles Branch")
      losAngBrnchUwGrp = findGroup( "Los Angeles Branch UW")
      homeOffUwGrp = loadGroup(bundle, "Home Office U.W.", enigmaOrg.RootGroup, "homeofficeuw", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      homeOffLcGrp = loadGroup(bundle, "Home Office L.C.", enigmaOrg.RootGroup, "homeofficelc", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      homeOffMktngGrp = loadGroup(bundle, "Home Office Marketing", enigmaOrg.RootGroup, "homeofficemkt", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      homeOffAdmSrvcsGrp = loadGroup(bundle, "Home Office Admin Services", enigmaOrg.RootGroup, "homeofficeadmin", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      sltnsGrp = loadGroup(bundle, "Solutions Group", homeOffMktngGrp, "solutions", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      westMidWestRgnGrp = loadGroup(bundle, "Western Mid-West Region", busProdOffsUsGrp, "region", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Western Part of Mid-west")
      eastMidWestRgnGrp = loadGroup(bundle, "Eastern Mid-West Region", busProdOffsUsGrp, "region", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Eastern Part of Mid-west")
      alxBrnchGrp = loadGroup(bundle, "Alexandria Branch ", eastRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Alexandria Branch")
      birmBrnchGrp = loadGroup(bundle, "Birmingham Branch ", eastMidWestRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Birmingham Branch")
      bostBrnchGrp = loadGroup(bundle, "Boston Branch ", eastRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Boston Branch")
      bridgeBrnchGrp = loadGroup(bundle, "Bridgeport Branch ", eastRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Bridgeport Branch")
      tmpaBrnchGrp = loadGroup(bundle, "Tampa Branch ", eastRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Tampa Branch")
      trenBrnchGrp = loadGroup(bundle, "Trenton Branch ", eastRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Trenton Branch")
      boisBrnchGrp = loadGroup(bundle, "Boise Branch ", westRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Boise Branch")
      phnxBrnchGrp = loadGroup(bundle, "Phoenix Branch ", westRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Phoenix Branch")
      portBrnchGrp = loadGroup(bundle, "Portland Branch ", westRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Portland Branch")
      sacrBrnchGrp = findGroup( "Sacramento Branch")
      sltLakeCtyBrnchGrp = loadGroup(bundle, "Salt Lake City Branch ", westRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Salt Lake City Branch")
      dlsBrnchGrp = loadGroup(bundle, "Dallas Branch ", westMidWestRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Dallas Branch")
      dnvBrnchGrp = loadGroup(bundle, "Denver Branch ", westRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Denver Branch")
      stLousBrnchGrp = loadGroup(bundle, "St. Louis Branch ", westMidWestRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "St. Louis Branch")
      cleveBrnchGrp = loadGroup(bundle, "Cleveland Branch ", eastMidWestRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Cleveland Branch")
      minnBrnchGrp = loadGroup(bundle, "Minneapolis Branch ", westMidWestRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Minneapolis Branch")
      minnBrnchUwGrp = loadGroup(bundle, "Minneapolis Branch UW", minnBrnchGrp, "branchuw", "E. Mid-West", fwagner, new User[] { enyugen, fwagner, gwang, hjohnson }, "301", enigmaOrg, "")
      loadGroup(bundle, "Eastern Mid-West Underwriting", homeOffUwGrp, "regionuw", "E. Mid-West", ccraft, new User[] { ccraft }, "", enigmaOrg, "Eastern Part of Mid-west")
      loadGroup(bundle, "Finance & Treasury", enigmaOrg.RootGroup, "finance", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Actuary Unit", enigmaOrg.RootGroup, "actuary", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "System administrators", enigmaOrg.RootGroup, "systemadmin", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Policy Services", homeOffUwGrp, "policyserve", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Premium Accounting", homeOffUwGrp, "premacct", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Customer Service", homeOffUwGrp, "custserv", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Western Region Underwriting", homeOffUwGrp, "regionuw", "Western Region", mmaples, new User[] { mmaples }, "", enigmaOrg, "Western Region")
      loadGroup(bundle, "Western Mid-West Underwriting", homeOffUwGrp, "regionuw", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "Western Part of Mid-west")
      loadGroup(bundle, "Eastern Region Audit", homeOffUwGrp, "regionaudit", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "Eastern Region")
      loadGroup(bundle, "Western Mid-West Audit", homeOffUwGrp, "regionaudit", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "Western Part of Mid-west")
      loadGroup(bundle, "Eastern Mid-West Audit", homeOffUwGrp, "regionaudit", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "Eastern Part of Mid-west")
      loadGroup(bundle, "Eastern Region Marketing", homeOffMktngGrp, "regionmkt", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "Eastern Region")
      loadGroup(bundle, "Western Region Marketing", homeOffMktngGrp, "regionmkt", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "Western Region")
      loadGroup(bundle, "Western Mid-West Marketing", homeOffMktngGrp, "regionmkt", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "Western Part of Mid-west")
      loadGroup(bundle, "Eastern Mid-West Marketing", homeOffMktngGrp, "regionmkt", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "Eastern Part of Mid-west")
      loadGroup(bundle, "Eastern Region Loss Control", homeOffLcGrp, "regionlc", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "Eastern Region")
      loadGroup(bundle, "Western Region Loss Control", homeOffLcGrp, "regionlc", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "Western Region")
      loadGroup(bundle, "Western Mid-West Loss Control", homeOffLcGrp, "regionlc", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "Western Part of Mid-west")
      loadGroup(bundle, "Eastern Mid-West Loss Control", homeOffLcGrp, "regionlc", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "Eastern Part of Mid-west")
      loadGroup(bundle, "Alexandria Branch UW", alxBrnchGrp, "branchuw", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Birmingham Branch UW", birmBrnchGrp, "branchuw", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Boston Branch UW", bostBrnchGrp, "branchuw", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Bridgeport Branch UW", bridgeBrnchGrp, "branchuw", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Tampa Branch UW", tmpaBrnchGrp, "branchuw", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Trenton Branch UW", trenBrnchGrp, "branchuw", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Boise Branch UW", boisBrnchGrp, "branchuw", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Phoenix Branch UW", phnxBrnchGrp, "branchuw", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Portland Branch UW", portBrnchGrp, "branchuw", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Sacramento Branch UW", sacrBrnchGrp, "branchuw", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Salt Lake City Branch UW", sltLakeCtyBrnchGrp, "branchuw", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Dallas Branch UW", dlsBrnchGrp, "branchuw", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Denver Branch UW", dnvBrnchGrp, "branchuw", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "St. Louis Branch UW", stLousBrnchGrp, "branchuw", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Cleveland Branch UW", cleveBrnchGrp, "branchuw", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Alexandria Branch Audit", alxBrnchGrp, "branchaudit", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Birmingham Branch Audit", birmBrnchGrp, "branchaudit", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Boston Branch Audit", bostBrnchGrp, "branchaudit", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Bridgeport Branch Audit", bridgeBrnchGrp, "branchaudit", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Tampa Branch Audit", tmpaBrnchGrp, "branchaudit", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Trenton Branch Audit", trenBrnchGrp, "branchaudit", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Boise Branch Audit", boisBrnchGrp, "branchaudit", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Los Angeles Branch Audit", losAngBrnchGrp, "branchaudit", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Phoenix Branch Audit", phnxBrnchGrp, "branchaudit", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Portland Branch Audit", portBrnchGrp, "branchaudit", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Sacramento Branch Audit", sacrBrnchGrp, "branchaudit", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Salt Lake City Branch Audit", sltLakeCtyBrnchGrp, "branchaudit", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Dallas Branch Audit", dlsBrnchGrp, "branchaudit", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Denver Branch Audit", dnvBrnchGrp, "branchaudit", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "St. Louis Branch Audit", stLousBrnchGrp, "branchaudit", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Cleveland Branch Audit", cleveBrnchGrp, "branchaudit", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Minneapolis Branch Audit", minnBrnchGrp, "branchaudit", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Alexandria Branch LC", alxBrnchGrp, "branchlc", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Birmingham Branch LC", birmBrnchGrp, "branchlc", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Boston Branch LC", bostBrnchGrp, "branchlc", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Bridgeport Branch LC", bridgeBrnchGrp, "branchlc", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Tampa Branch LC", tmpaBrnchGrp, "branchlc", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Trenton Branch LC", trenBrnchGrp, "branchlc", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Boise Branch LC", boisBrnchGrp, "branchlc", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Los Angeles Branch LC", losAngBrnchGrp, "branchlc", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Phoenix Branch LC", phnxBrnchGrp, "branchlc", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Portland Branch LC", portBrnchGrp, "branchlc", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Sacramento Branch LC", sacrBrnchGrp, "branchlc", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Salt Lake City Branch LC", sltLakeCtyBrnchGrp, "branchlc", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Dallas Branch LC", dlsBrnchGrp, "branchlc", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Denver Branch LC", dnvBrnchGrp, "branchlc", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "St. Louis Branch LC", stLousBrnchGrp, "branchlc", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Cleveland Branch LC", cleveBrnchGrp, "branchlc", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Minneapolis Branch LC", minnBrnchGrp, "branchlc", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Alexandria Branch Admin", alxBrnchGrp, "clerical", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Birmingham Branch Admin", birmBrnchGrp, "clerical", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Boston Branch Admin", bostBrnchGrp, "clerical", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Bridgeport Branch Admin", bridgeBrnchGrp, "clerical", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Tampa Branch Admin", tmpaBrnchGrp, "clerical", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Trenton Branch Admin", trenBrnchGrp, "clerical", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Boise Branch Admin", boisBrnchGrp, "clerical", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Phoenix Branch Admin", phnxBrnchGrp, "clerical", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Portland Branch Admin", portBrnchGrp, "clerical", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Sacramento Branch Admin", sacrBrnchGrp, "clerical", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Salt Lake City Branch Admin", sltLakeCtyBrnchGrp, "clerical", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Dallas Branch Admin", dlsBrnchGrp, "clerical", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Denver Branch Admin", dnvBrnchGrp, "clerical", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "St. Louis Branch Admin", stLousBrnchGrp, "clerical", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Cleveland Branch Admin", cleveBrnchGrp, "clerical", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Minneapolis Branch Admin", minnBrnchGrp, "clerical", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Eastern Region Clerical", homeOffAdmSrvcsGrp, "clerical", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Western Region Clerical", homeOffAdmSrvcsGrp, "clerical", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Western Mid-West Clerical", homeOffAdmSrvcsGrp, "clerical", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Eastern Mid-West Clerical", homeOffAdmSrvcsGrp, "clerical", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Alexandria Branch Marketing", alxBrnchGrp, "branchmkt", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Birmingham Branch Marketing", birmBrnchGrp, "branchmkt", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Boston Branch Marketing", bostBrnchGrp, "branchmkt", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Bridgeport Branch Marketing", bridgeBrnchGrp, "branchmkt", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Tampa Branch Marketing", tmpaBrnchGrp, "branchmkt", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Trenton Branch Marketing", trenBrnchGrp, "branchmkt", "Eastern Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Boise Branch Marketing", boisBrnchGrp, "branchmkt", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Los Angeles Branch Marketing", losAngBrnchGrp, "branchmkt", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Phoenix Branch Marketing", phnxBrnchGrp, "branchmkt", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Portland Branch Marketing", portBrnchGrp, "branchmkt", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Sacramento Branch Marketing", sacrBrnchGrp, "branchmkt", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Salt Lake City Branch Marketing", sltLakeCtyBrnchGrp, "branchmkt", "Western Region", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Dallas Branch Marketing", dlsBrnchGrp, "branchmkt", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Denver Branch Marketing", dnvBrnchGrp, "branchmkt", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "St. Louis Branch Marketing", stLousBrnchGrp, "branchmkt", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Cleveland Branch Marketing", cleveBrnchGrp, "branchmkt", "W. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Minneapolis Branch Marketing", minnBrnchGrp, "branchmkt", "E. Mid-West", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Fac Reinsurance Unit", homeOffUwGrp, "facre", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
      loadGroup(bundle, "Web Services Unit", sltnsGrp, "eservices", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "")
    })
    
    Transaction.runWithNewBundle( \bundle ->  {
      // External 
      var org : Organization
      var user1 : User
      var group1 : Group

      org = loadOrganization(bundle, "ACV Property Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "carkle", "carkle@ACVProperty.com", "Charles", "Arkle", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008578", "ACV Property Insurance", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Allrisk Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "chart", "chart@AllriskIns.com", "Carlos", "Hart", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      loadProducerCode(bundle, "501-002552", "Allrisk Insurance", losAngBrnchUwGrp, org, null, new User[]{ user1 }, "4460 Boulder Drive", "Tampa", "FL", "33605", "US")

      org = loadOrganization(bundle, "Bluto Janckowiz Independent Agent", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "emazuch", "emazuch@Bluto.com", "Edward", "Mazuch", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008586", "Bluto Janckowiz Independent Agent", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Boiler Specialists", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "rbarnes", "rbarnes@BoilerSpec.com", "Ronald", "Barnes", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008579", "Boiler Specialists", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Builders' Risk brokers", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "edean", "edean@Builders.com", "Ernie", "Dean", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002553", "Builders' Risk brokers", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Carpenters Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "rkerrey", "rkerrey@Carpenters.com", "Rick", "Kerrey", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002554", "Carpenters Insurance", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Cid Vicious agency", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "fdwight", "fdwight@CidVicious.com", "Frederick", "Dwight", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008597", "Cid Vicious agency", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Claus Workmanuberseer agency", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "pgebhardt", "pgebhardt@ClausWorkman.com", "Paul", "Gebhardt", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008598", "Claus Workmanuberseer agency", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Commercial insurers", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "ccarley", "ccarley@Commercial.com", "Cheryl", "Carley", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008580", "Commercial insurers", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Derrick Crane agency", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "tedwards", "tedwards@Derrick.com", "Thomas", "Edwards", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002555", "Derrick Crane agency", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Dimitrios Xenopolus agency", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "tgrant", "tgrant@Dimitrios.com", "Tamara", "Grant", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008575", "Dimitrios Xenopolus agency", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Drivers' Choice Truckers' Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "wdufraine", "wdufraine@Drivers.com", "William", "Dufraine", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008581", "Drivers' Choice Truckers' Insurance", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Effective Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "rgregoire", "rgregoire@Effective.com", "Robert", "Gregoire", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008582", "Effective Insurance", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Exceptional Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "fdonahue", "fdonahue@Exceptional.com", "Faith", "Donahue", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002556", "Exceptional Insurance", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Farmowners Group", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "jjosloff", "jjosloff@Farmowners.com", "John", "Josloff", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008583", "Farmowners Group", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Finalist Insurance Group", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "slieberman", "slieberman@Finalist.com", "Sylvia", "Lieberman", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002557", "Finalist Insurance Group", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Garagemen Insurance brokerage", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "mking", "mking@Garagemen.com", "Michele", "King", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008584", "Garagemen Insurance brokerage", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Greatwest Bonds and Surety", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "pmoseley", "pmoseley@Greatwest.com", "Pam", "Moseley", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002558", "Greatwest Bonds and Surety", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Harliquin and Daughter Insurance", "agency", false, "Active", "Western Region")
      loadProducerCode(bundle, "501-002559", "Harliquin and Daughter Insurance", losAngBrnchUwGrp, org, null, null)

      org = loadOrganization(bundle, "Hu, Harmless, Hier Partners", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "pmansur", "pmansur@HuHarmlesss.com", "Phyllis", "Mansur", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008585", "Hu, Harmless, Hier Partners", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Independence Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "jrandolph", "jrandolph@Independent.com", "Jill", "Randolph", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002560", "Independence Insurance", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Jillian Losttime Workers Comp", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "cnorris", "cnorris@Jillian.com", "Carl", "Norris", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008588", "Jillian Losttime Workers Comp", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Johnson and Johnson", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "bhearst", "bhearst@Johnson.com", "Becky", "Hearst", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002561", "Johnson and Johnson", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Kearney and O'Shaugnessy agency", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "rmyette", "rmyette@Kearney.com", "Richard", "Myette", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008587", "Kearney and O'Shaugnessy agency", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Killarney Creek agency", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "hdienstfrey", "hdienstfrey@Killarney.com", "Harry", "Dienstfrey", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002562", "Killarney Creek agency", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Lemon Growers", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "pflores", "pflores@LemonGrowers.com", "Paulette", "Flores", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002563", "Lemon Growers", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Manufacturers' Risk", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "twilson", "twilson@Manufacturers.com", "Todd", "Wilson", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002564", "Manufacturers' Risk", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Market Share Managing agency", "mga", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "iharkin", "iharkin@Market.com", "Isabel", "Harkin", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002551", "Market Share Managing agency", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 }, "610 Fifth Avenue", "Indianapolis", "IN", "46201", "US")

      org = loadOrganization(bundle, "Monoline brokers", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "krice", "krice@Monoline.com", "Kirk", "Rice", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008589", "Monoline brokers", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "No Fault Group", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "shoover", "shoover@NoFault.com", "Spencer", "Hoover", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002565", "No Fault Group", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Nolocontendere brokers", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "jruhl", "jruhl@Nolocontendre.com", "Jerome", "Ruhl", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008590", "Nolocontendere brokers", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Occurrence Group", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "csherman", "csherman@Occurrence.com", "Chonghyo", "Sherman", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008591", "Occurrence Group", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Omniscient Inspections", "feeinspect", false, null, "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "gkennedy", "gkennedy@Omniscient.com", "Gwenn", "Kennedy", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})

      org = loadOrganization(bundle, "Openhand brokers", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "jcoolidge", "jcoolidge@Openhand.com", "Jonah", "Coolidge", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002566", "Openhand brokers", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Package Partners", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "mspanbauer", "mspanbauer@Package.com", "Mark", "Spanbauer", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008592", "Package Partners", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Premier Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "ltaft", "ltaft@PremierIns.com", "Lynzi", "Taft", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002567", "Premier Insurance", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Quad Cities Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "twilkie", "twilkie@QuadCities.com", "Trevor", "Wilkie", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002568", "Quad Cities Insurance", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Quick Quote Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "jstreeter", "jstreeter@QuickQuote.com", "James", "Streeter", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008593", "Quick Quote Insurance", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Risk Management Group", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "sarthur", "sarthur@RiskManagement.com", "Scott", "Arthur", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002569", "Risk Management Group", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Rubicon Flood Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "lwhipple", "lwhipple@Rubicon.com", "Lawrence", "Whipple", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008594", "Rubicon Flood Insurance", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Security Group", "agency", false, "Active", "Western Region")
      var dhayes = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "dhayes", "dhayes@Security.com", "Danny", "Hayes", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      var asecure = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, false, "asecure", "asecure@secure.com", "Able", "Secure", "213-555-8164", "143 Lake Ave. Suite 500", "Pasadena", "CA", "91253", "US", {agent1})
      var bsecure = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, false, "bsecure", "bsecure@secure.com", "Betty", "Secure", "213-555-8164", "143 Lake Ave. Suite 500", "Pasadena", "CA", "91253", "US", {agent1})
      var secAblGrp = loadGroup(bundle, "Security Group Able", org.RootGroup, "producer", "Western Region", dhayes, new User[] { dhayes, asecure }, "", org, "")
      var secBkrGrp = loadGroup(bundle, "Security Group Baker", org.RootGroup, "producer", "Western Region", dhayes, new User[] { dhayes, bsecure }, "", org, "")
      loadProducerCode(bundle, "501-002570", "Security Group", losAngBrnchUwGrp, org, null, new User[] { dhayes })
      loadProducerCode(bundle, "502-002570", "Security Group Able", losAngBrnchUwGrp, org, new Group[] { secAblGrp }, new User[] { asecure, dhayes })
      loadProducerCode(bundle, "503-002570", "Security Group Baker", losAngBrnchUwGrp, org, new Group[] { secBkrGrp }, new User[] { bsecure, dhayes })
      
      org = loadOrganization(bundle, "Special Form Property brokers", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "jfilipkowski", "jfilipkowski@SpecialForm.com", "John", "Filipkowski", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008595", "Special Form Property brokers", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Thomson Jones agency", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "tgarfield", "tgarfield@Thomson.com", "Tony", "Garfield", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "501-002571", "Thomson Jones agency", losAngBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Uninsurable brokers", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "wcummings", "wcummings@Uninsurable.com", "Walter", "Cummings", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008596", "Uninsurable brokers", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Universal Insurance ", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "slincoln", "slincoln@Universal.com", "Sarah", "Lincoln", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008572", "Universal Insurance ", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Verity Bonds and Surety", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "sbuchanan", "sbuchanan@VerityBond.com", "Susan", "Buchanan", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008573", "Verity Bonds and Surety", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Whiplash Bros. Auto Insurance", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "pharrison", "pharrison@Whiplash.com", "Phillip", "Harrison", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008574", "Whiplash Bros. Auto Insurance", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Xoria Farm Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "dguest", "dguest@XoriaFarm.com", "Debra", "Guest", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008599", "Xoria Farm Insurance", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Yellowcreek Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "akim", "akim@Yellowcreek.com", "Alan", "Kim", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      var frdUnitGrp = loadGroup(bundle, "Fraud Unit", org.RootGroup, "clerical", "Western Region", user1, new User[] {  }, "", org, "")
      loadGroup(bundle, "Commercial Fraud Unit", frdUnitGrp, "clerical", "Western Region", user1, new User[] {  }, "", org, "")
      loadGroup(bundle, "Personal Fraud Unit", frdUnitGrp, "clerical", "Western Region", user1, new User[] {  }, "", org, "")
      loadProducerCode(bundle, "301-008600", "Yellowcreek Insurance", minnBrnchUwGrp, org, null, new User[]{ user1 })

      org = loadOrganization(bundle, "Youngblood Insurance", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "spierce", "spierce@Youngblood.com", "Sally", "Pierce", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008576", "Youngblood Insurance", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Zorba Przmeleski Specialty Lines", "broker", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "btyler", "btyler@Zorba.com", "Beth", "Tyler", "213-555-8164", "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle,"Producers", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008577", "Zorba Przmeleski Specialty Lines", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })

      org = loadOrganization(bundle, "Zealot and Zaire Insurance Partners", "agency", false, "Active", "Western Region")
      user1 = loadUser(bundle, { "producer", "user_admin" }, "producer", org, true, true, "bmalouin", "bmalouin@ZealotandZ.com", "Brian", "Malouin", "847-555-8164", "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      group1 = loadGroup(bundle, "Fraud Unit", org.RootGroup, "producer", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadGroup(bundle, "Commercial Fraud Unit", group1, "clerical", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadGroup(bundle, "Personal Fraud Unit", group1, "clerical", "Western Region", user1, new User[] { user1 }, "", org, "")
      loadProducerCode(bundle, "301-008601", "Zealot and Zaire Insurance Partners", minnBrnchUwGrp, org, new Group[] { group1 }, new User[]{ user1 })
    })
  }
}
