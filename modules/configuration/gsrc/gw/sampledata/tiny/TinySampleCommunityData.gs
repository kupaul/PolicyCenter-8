package gw.sampledata.tiny

uses gw.sampledata.AbstractSampleDataCollection
uses gw.transaction.Transaction

/**
 * A tiny set of Users / Groups / Orgs / ProducerCodes, just enough for testing.
 */
@Export
class TinySampleCommunityData extends AbstractSampleDataCollection
{
  construct() { }

  /**
   * The name of this sample data collection, for logging and debugging
   */
  public override property get CollectionName() : String {
    return "Tiny Community"
  }
  
  /**
   * Checks the database, returning true if this set is already loaded (and thus doesn't need reloading)
   */
  public override property get AlreadyLoaded() : boolean {
    return credentialLoaded("aapplegate")
  }
  
  /**
   * Loads the contents of this sample data set into the DB
   */
  public override function load() {
    Transaction.runWithNewBundle( \bundle ->  {
    
      // ORGANIZATIONS
      var enigmaOrg = loadOrganization(bundle, "Enigma Fire & Casualty", "insurer", true, "Active", "HO UW")

      // A FEW ORGS HAVE COMPANY CONTACTS
      enigmaOrg.Contact = loadCompany(bundle, "info@enigma_fc.com", "213-555-1213", "Enigma Fire & Casualty", "143 Lake Ave. Suite 500", "Pasadena", "CA", "91253", "US")

      // AUTHORITY PROFILES
     
      var tinySampleUWAuthData = new TinySampleUWAuthorityData().load(bundle)
      var agent1 = tinySampleUWAuthData.Agent1
      var agent2 = tinySampleUWAuthData.Agent2
      var portal = tinySampleUWAuthData.PortalProfile
      var underwriter1 = tinySampleUWAuthData.Underwriter1
      var underwriter2 = tinySampleUWAuthData.Underwriter2
      var underwriterManager = tinySampleUWAuthData.UnderwriterManager
      
      
      // Make sure su has all the roles
      var su = findUser("su")
      su.addToUserAuthorityProfiles( new UserAuthorityProfile(bundle){:UWAuthorityProfile = agent1} )
      su.addToUserAuthorityProfiles( new UserAuthorityProfile(bundle){:UWAuthorityProfile = agent2} )
      su.addToUserAuthorityProfiles( new UserAuthorityProfile(bundle){:UWAuthorityProfile = underwriter1} )
      su.addToUserAuthorityProfiles( new UserAuthorityProfile(bundle){:UWAuthorityProfile = underwriter2} )
      su.addToUserAuthorityProfiles( new UserAuthorityProfile(bundle){:UWAuthorityProfile = underwriterManager} )
      
      // Add in the renewal daemon user
      loadUser(bundle, {"superuser"}, "other", enigmaOrg, false, false,
               "renewal_daemon", null, "Renewal", "Daemon", "213-555-8164",
               null, null, null, null, null, {agent1, agent2, underwriter1})

      // Add in the policy change daemon user
      loadUser(bundle, {"superuser"}, "other", enigmaOrg, false, false,
               "policychange_daemon", null, "PolicyChange", "Daemon", "213-555-8164", 
               null, null, null, null, null, {agent1, agent2, underwriter1, underwriter2, underwriterManager})


      // Add the Portal User
      var iportal = loadUser(bundle, {"producer"}, "producer", enigmaOrg, false, false, 
                                "portal", "portal@enigma_fc.com", "internet", "portal", "650-555-1212", 
                                "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {portal})


      // USERS
      var iadmin = loadUser(bundle, { "community_admin", "toolview" }, "other", enigmaOrg, false, false, 
                            "iadmin", "iadmin@enigma_fc.com", "Internal", "Admin", "才谷", "梅太郎", "213-555-8164",
                            "143 Lake Ave. Suite 501", null,"Pasadena",null, "CA", "91253", "US", {})
      var aapplegate = loadUser(bundle, {"underwriter", "reinsurance_manager"}, "underwriter", enigmaOrg, false, false, 
                                "aapplegate", "aapplegate@enigma_fc.com", "Alice", "Applegate", "213-555-8164", 
                                "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      var bbaker = loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, 
                            "bbaker", "bbaker@enigma_fc.com", "Bruce", "Baker", "213-555-8164", 
                            "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      var ccraft = loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, 
                            "ccraft", "ccraft@enigma_fc.com", "Christine", "Craft", "213-555-8164", 
                            "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      var dhenson = loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, 
                             "dhenson", "dhenson@enigma_fc.com", "Danielle", "Henson", "213-555-8164", 
                             "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      var pprocessor = loadUser(bundle, "processor", "other", enigmaOrg, false, false, 
                                "pprocessor", "pprocessor@enigma_fc.com", "Percival", "Processor", "213-555-8172", 
                                "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      var ssmith = loadUser(bundle, {"underwriter_supervisor"}, "underwriter", enigmaOrg, false, false, 
                            "ssmith", "ssmith@enigma_fc.com", "Steve", "Smith", "213-555-8164", 
                            "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter2})
      var svisor = loadUser(bundle, {"underwriter_supervisor", "forms_admin"}, "underwriter", enigmaOrg, false, false, 
                            "svisor", "svisor@enigma_fc.com", "Super", "Visor", "213-555-8164", 
                            "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1, underwriter2, underwriterManager})
      var awhite = loadUser(bundle, {"producer"}, "producer", enigmaOrg, true, false, 
                            "awhite", "awhite@enigma_fc.com", "Amy", "White", "916-323-3047",
                            "1 Capitol Ave.", "Sacramento", "CA", "95811", "US", {agent1})
      var bwhite = loadUser(bundle, {"producer"}, "producer", enigmaOrg, true, true,
                            "bwhite", "bwhite@enigma_fc.com", "Ben", "White", "916-323-3047", 
                            "1 Capitol Ave.", "Sacramento", "CA", "95811", "US", {agent1, agent2})
      var tallen = loadUser(bundle, "audit_examiner", "underwriter", enigmaOrg, false, false, 
                            "tallen", "tallen@enigma_fc.com", "Tamara", "Allen", "213-555-8164", 
                            "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      var aauditor = loadUser(bundle, "premium_auditor",  "auditor", enigmaOrg, false, false, 
                              "aauditor", "aauditor@enigma_fc.com", "Adam", "Auditor", "213-553-8164", 
                              "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      var avisor = loadUser(bundle, "audit_supervisor", "auditor", enigmaOrg, false, false, 
                            "avisor", "avisor@enigma_fc.com", "Alice", "AuditSuper", "213-556-8164", 
                            "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      loadUser(bundle, {"reinsurance_admin", "underwriter_asst"}, "underwriter", enigmaOrg, false, false,
                            "mvu", "mvu@enigma_fc.com", "Mike", "Vu", "213-555-8164", 
                            "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter2})
      loadUser(bundle, "superuser", "underwriter", enigmaOrg, false, false, 
               "admin", "admin@enigma_fc.com", "System", "Admin", "213-555-8164", 
               "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      loadUser(bundle, {"underwriter_supervisor", "reinsurance_manager"}, "underwriter", enigmaOrg, false, true, 
               "elee", "elee@enigma_fc.com", "Edward", "Lee", "213-555-8164", 
               "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriterManager})
      loadUser(bundle, {"underwriter"}, "underwriter", enigmaOrg, false, false, 
               "cclark", "cclark@enigma_fc.com", "Carl", "Clark", "213-555-8164", 
               "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {underwriter1})
      loadUser(bundle, "underwriter_asst", "other", enigmaOrg, false, false, 
               "dright", "dright@enigma_fc.com", "Dennis", "Right", "213-555-8164", 
               "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      loadUser(bundle, "rating_analyst", "other", enigmaOrg, false, false, 
               "rrutherford", "rrutherford@enigma_fc.com", "Ronald", "Rutherford", "213-555-8164", 
               "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      loadUser(bundle, "rating_supervisor", "other", enigmaOrg, false, false, 
               "rrenforth", "rrenforth@enigma_fc.com", "Rachel", "Renforth", "213-555-8164", 
               "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")

      // GROUPS
      var busProdOffsUsGrp = loadGroup(bundle, "Business Production Offices - U.S.", enigmaOrg.RootGroup, "producer", "HO UW", null, new User[] { awhite, bwhite }, "", enigmaOrg, "")
      var eastRgnGrp = loadGroup(bundle, "Eastern Region", enigmaOrg.RootGroup, "region", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Eastern Region")
      /*var eastRgnGrpUW =*/ loadGroup(bundle, "Eastern Region Underwriting", eastRgnGrp, "regionuw", "Eastern Region", ssmith, new User[] { ssmith, aapplegate, bbaker, dhenson  }, "", enigmaOrg, "Eastern Region")
      var westRgnGrp = loadGroup(bundle, "Western Region", enigmaOrg.RootGroup, "region", "HO UW", svisor, new User[] { iadmin, svisor, iportal }, "", enigmaOrg, "Western Region")
      var losAngBrnchGrp = loadGroup(bundle, "Los Angeles Branch", westRgnGrp, "branch", "HO UW", svisor, new User[] { svisor }, "", enigmaOrg, "Los Angeles Branch - HI")
      var losAngBrnchUwGrp = loadGroup(bundle, "Los Angeles Branch UW", losAngBrnchGrp, "branchuw", "Western Region", ssmith, new User[] { aapplegate, ssmith, bbaker, ccraft}, "501", enigmaOrg, "")
      loadGroup(bundle, "Sacramento Branch", westRgnGrp, "branch", "HO UW", svisor, new User[] { svisor, awhite, bwhite }, "", enigmaOrg, "Sacramento Branch")
      loadGroup(bundle, "Western Region Audit", westRgnGrp, "regionaudit", "Western Region", avisor, new User[] { avisor, tallen, aauditor }, "", enigmaOrg, "Western Region")
      loadGroup(bundle, "Los Angeles Branch Admin", losAngBrnchGrp, "clerical", "Western Region", svisor, new User[] { svisor, pprocessor }, "", enigmaOrg, "")

      // ASSIGNABLE QUEUES
      loadAssignableQueue(bundle, losAngBrnchUwGrp, "Sample Queue 1", true)
      loadAssignableQueue(bundle, losAngBrnchUwGrp, "Sample Queue 2", true)

      // PRODUCER CODES
      loadProducerCode(bundle, "Standard Code", "Internal Producer Code - 1", losAngBrnchUwGrp, enigmaOrg, new Group[] { busProdOffsUsGrp }, new User[] { awhite, bwhite }, "1 Capitol Ave.", "Sacramento", "CA", "95811", "US")
      loadProducerCode(bundle, "QA1PRODUCERCODE01", "Internal Producer Code - 2", losAngBrnchUwGrp, enigmaOrg, new Group[] { busProdOffsUsGrp }, new User[] { awhite, bwhite }, "1 Capitol Ave.", "Sacramento", "CA", "95811", "US")
      loadProducerCode(bundle, "INT-3", "Internal Producer Code - 3", losAngBrnchUwGrp, enigmaOrg, new Group[] {  }, new User[] { awhite }, "1 Capitol Ave.", "Sacramento", "CA", "95811", "US")
      loadProducerCode(bundle, "INT-4", "Internal Producer Code - 4", losAngBrnchUwGrp, enigmaOrg, new Group[] {  }, new User[] { bwhite }, "1 Capitol Ave.", "Sacramento", "CA", "95811", "US")
      loadProducerCode(bundle, "portal", "Internal Portal Code", losAngBrnchUwGrp, enigmaOrg, new Group[] {  }, new User[] { iportal}, "1 Capitol Ave.", "Sacramento", "CA", "95811", "US")

      // External orgs
      var armstrongOrg = loadOrganization(bundle, "Armstrong and Company", "agency", false, "Active", "Western Region")
      armstrongOrg.Contact = loadCompany(bundle, "contact@armstrong.com", "317-333-5900", "Armstrong and Sons", "610 Fifth Avenue", "Indianapolis", "IN", "46201", "US")
      var aarmstrong = loadUser(bundle, {"producer"}, "producer", armstrongOrg, true, false, 
                                "aarmstrong", "aarmstrong@armstrong.com", "Archie", "Armstrong", "650-413-5705", 
                                "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent2})
      loadUser(bundle, "user_admin", "other", armstrongOrg, true, true, "eadmin", "eadmin@armstrong.com", "External", "Admin", "317-333-5800", "1500 Maple Ave.", "Evanston", "CA", "91253", "US")
      var parmstrong = loadUser(bundle, {"producer"}, "producer", armstrongOrg, true, false, 
                                "parmstrong", "parmstrong@armstrong.com", "Peyton", "Armstrong", "317-333-5800", 
                                "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent2})
      var ejames = loadUser(bundle, { "producer", "user_admin" }, "producer", armstrongOrg, true, false, 
                            "ejames", "ejames@armstrong.com", "Edgerrin", "James", "317-333-5800", 
                            "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      var earmstrong = loadUser(bundle, {"producer"}, "assistant", armstrongOrg, true, false, 
                                "earmstrong", "earmstrong@armstrong.com", "Eli", "Armstrong", "212-555-1451", 
                                "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent2})
      var armstrongGrp = loadGroup(bundle, "Shared Producers", armstrongOrg.RootGroup, "producer", "Western Region", ejames, new User[] { ejames, aarmstrong }, "", armstrongOrg, "")
      var armstrongGrp2 = loadGroup(bundle, "Los Angeles Producers", armstrongOrg.RootGroup, "producer", "Western Region", ejames, new User[] { parmstrong }, "", armstrongOrg, "")
      var armstrongGrp3 = loadGroup(bundle, "San Diego Producers", armstrongOrg.RootGroup, "producer", "Western Region", ejames, new User[] { earmstrong }, "", armstrongOrg, "")
      var armstrongGrp4 = loadGroup(bundle, "Premium Producers", armstrongOrg.RootGroup, "producer", "Western Region", aarmstrong, new User[] { aarmstrong }, "", armstrongOrg, "")
      loadProducerCode(bundle, "100-002541", "Armstrong (Premier)", losAngBrnchUwGrp, armstrongOrg, new Group[] { armstrongGrp4 }, new User[] { aarmstrong }, "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      loadProducerCode(bundle, "501-002542", "Armstrong - Los Angeles", losAngBrnchUwGrp, armstrongOrg, new Group[] {  armstrongGrp, armstrongGrp2 }, new User[] { ejames, aarmstrong, parmstrong }, "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      loadProducerCode(bundle, "501-002543", "Armstrong - San Diego", losAngBrnchUwGrp, armstrongOrg, new Group[] { armstrongGrp, armstrongGrp3 }, new User[] { ejames, aarmstrong, earmstrong }, "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      loadProducerCode(bundle, "501-002544", "Armstrong - Prof Liab Srvcs", losAngBrnchUwGrp, armstrongOrg, new Group[] {  armstrongGrp, armstrongGrp2, armstrongGrp3 }, new User[] { ejames, aarmstrong, parmstrong, earmstrong }, "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      loadProducerCode(bundle, "501-002545", "Armstrong - Employer Srvcs", losAngBrnchUwGrp, armstrongOrg, new Group[] {  armstrongGrp, armstrongGrp2, armstrongGrp3 }, new User[] { ejames, aarmstrong, parmstrong, earmstrong }, "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")
      loadProducerCode(bundle, "501-002546", "Armstrong - Cayman Captive Srvs", losAngBrnchUwGrp, armstrongOrg, new Group[] {  armstrongGrp4 }, new User[] { aarmstrong }, "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")

      var kennedyOrg = loadOrganization(bundle, "Kennedy Insurance Group", "broker", false, "Active", "Eastern Region")
      kennedyOrg.Contact = loadCompany(bundle, "info@kennedygroup.com", "813-974-1010", "Kennedy Insurance Group", "4460 Boulder Drive", "Tampa", "FL", "33605", "US")
      var dkennedy = loadUser(bundle, { "producer", "user_admin" }, "producer", kennedyOrg, true, true, 
                              "dkennedy", "dkennedy@kennedygroup.com", "David", "Kennedy", "813-974-1000", 
                              "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      var mlincoln = loadUser(bundle, {"producer"}, "assistant", kennedyOrg, true, false, 
                              "mlincoln", "mlincoln@kennedygroup.com", "Michelle", "Lincoln", "813-974-1000", 
                              "1500 Maple Ave.", "Evanston", "CA", "91253", "US", {agent1})
      var kennedyGrp = loadGroup(bundle, "Producers", kennedyOrg.RootGroup, "producer", "Eastern Region", mlincoln, new User[] { mlincoln, dkennedy }, "", kennedyOrg, "")
      loadProducerCode(bundle, "100-002547", "Kennedy (Premier)", null, kennedyOrg, new Group[] { kennedyGrp }, new User[] { dkennedy, mlincoln }, "1500 Maple Ave.", "Evanston", "IL", "60201", "US")
        .PreferredUnderwriter = aapplegate
      loadProducerCode(bundle, "501-002548", "Kennedy Mass Market", null, kennedyOrg, new Group[] { kennedyGrp }, new User[] { dkennedy, mlincoln }, "1500 Maple Ave.", "Evanston", "IL", "60201", "US")
        .PreferredUnderwriter = aapplegate
      loadProducerCode(bundle, "501-002549", "Kennedy Strategic Risks", null, kennedyOrg, new Group[] { kennedyGrp }, new User[] { dkennedy, mlincoln }, "1500 Maple Ave.", "Evanston", "IL", "60201", "US")
        .PreferredUnderwriter = aapplegate

      //Adding code for Multicurrency lab to so that policy can be quoted in EUR currency
      loadProducerCode(bundle, "500-002516EUR", "Kennedy Group Services", null, kennedyOrg, new Group[]
      { kennedyGrp }, new User[] { dkennedy, mlincoln }, "1500 Maple Ave.", null, "Evanston", null, "IL", "60201", "US",
          Currency.TC_EUR).PreferredUnderwriter = aapplegate

      // end of code added for training

      loadProducerCode(bundle, "501-002550", "Kennedy Group Services", null, kennedyOrg, new Group[] { kennedyGrp }, new User[] { dkennedy, mlincoln }, "1500 Maple Ave.", "Evanston", "IL", "60201", "US")
        .PreferredUnderwriter = aapplegate

      var org = loadOrganization(bundle, "Careful Auditors", "feeaudit", false, null, "Western Region")
      loadUser(bundle, { "loss_control", "user_admin" }, "auditor", org, true, false, 
               "tjohnson", "tjohnson@Careful.com", "Terence", "Johnson", "213-555-8164", 
               "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US", {})
      loadUser(bundle, "user_admin", "other", org, true, true, 
               "acareful", "admin@Careful.com", "Admin", "Careful", "213-555-8164", 
               "143 Lake Ave. Suite 501", "Pasadena", "CA", "91253", "US")   
    })
  }
}
