package gw.sampledata.small

uses gw.sampledata.AbstractSampleDataCollection
uses gw.transaction.Transaction

/**
 * A larger set of Regions and SecurityZones.
 */
@Export
class SmallSampleRegionData extends AbstractSampleDataCollection
{
  construct() { }

  /**
   * The name of this sample data collection, for logging and debugging
   */
  public override property get CollectionName() : String {
    return "Small Regions"
  }
  
  /**
   * Checks the database, returning true if this set is already loaded (and thus doesn't need reloading)
   */
  public override property get AlreadyLoaded() : boolean {
    return securityZoneLoaded("Commercial Lines")
  }
  
  /**
   * Loads the contents of this sample data set into the DB
   */
  public override function load() {
    Transaction.runWithNewBundle( \bundle -> {
      
      // ZONES
      loadSecurityZone(bundle, "Commercial Lines", "Commercail Standard Lines")
      loadSecurityZone(bundle, "Personal Lines", "Personal Lines Underwriting")
      loadSecurityZone(bundle, "Specialty Lines", "Special Lines Underwriting")
      loadSecurityZone(bundle, "W. Mid-West", "W. Mid-West")
      loadSecurityZone(bundle, "E. Mid-West", "E. Mid-West")
    
      // REGIONS
      loadRegion(bundle, "Eastern Part of Mid-west", {
        loadRegionZone(bundle, "AL", "US", "State"),
        loadRegionZone(bundle, "IL", "US", "State"),
        loadRegionZone(bundle, "IN", "US", "State"),
        loadRegionZone(bundle, "KY", "US", "State"),
        loadRegionZone(bundle, "MI", "US", "State"),
        loadRegionZone(bundle, "MS", "US", "State"),
        loadRegionZone(bundle, "TN", "US", "State"),
        loadRegionZone(bundle, "OH", "US", "State"),
        loadRegionZone(bundle, "WI", "US", "State")
      })
      loadRegion(bundle, "Western Part of Mid-west", {
        loadRegionZone(bundle, "AR", "US", "State"),
        loadRegionZone(bundle, "IA", "US", "State"),
        loadRegionZone(bundle, "KS", "US", "State"),
        loadRegionZone(bundle, "LA", "US", "State"),
        loadRegionZone(bundle, "MN", "US", "State"),
        loadRegionZone(bundle, "OK", "US", "State"),
        loadRegionZone(bundle, "MO", "US", "State"),
        loadRegionZone(bundle, "ND", "US", "State"),
        loadRegionZone(bundle, "NE", "US", "State"),
        loadRegionZone(bundle, "SD", "US", "State"),
        loadRegionZone(bundle, "TX", "US", "State")
      })
      loadRegion(bundle, "Alexandria Branch", {
        loadRegionZone(bundle, "DC", "US", "State"),
        loadRegionZone(bundle, "MD", "US", "State"),
        loadRegionZone(bundle, "NC", "US", "State"),
        loadRegionZone(bundle, "VA", "US", "State"),
        loadRegionZone(bundle, "WV", "US", "State")
      })
      loadRegion(bundle, "Birmingham Branch", {
        loadRegionZone(bundle, "AL", "US", "State"),
        loadRegionZone(bundle, "KY", "US", "State"),
        loadRegionZone(bundle, "MS", "US", "State"),
        loadRegionZone(bundle, "TN", "US", "State")
      })
      loadRegion(bundle, "Boise Branch", {
        loadRegionZone(bundle, "ID", "US", "State"),
        loadRegionZone(bundle, "MT", "US", "State")
      })
      loadRegion(bundle, "Boston Branch", {
        loadRegionZone(bundle, "MA", "US", "State"),
        loadRegionZone(bundle, "ME", "US", "State"),
        loadRegionZone(bundle, "NH", "US", "State"),
        loadRegionZone(bundle, "VT", "US", "State")
      })
      loadRegion(bundle, "Bridgeport Branch", {
        loadRegionZone(bundle, "CT", "US", "State"),
        loadRegionZone(bundle, "NY", "US", "State"),
        loadRegionZone(bundle, "RI", "US", "State")
      })
      loadRegion(bundle, "Cleveland Branch", {
        loadRegionZone(bundle, "IL", "US", "State"),
        loadRegionZone(bundle, "IN", "US", "State"),
        loadRegionZone(bundle, "MI", "US", "State"),
        loadRegionZone(bundle, "OH", "US", "State"),
        loadRegionZone(bundle, "WI", "US", "State")
      })
      loadRegion(bundle, "Dallas Branch", {
        loadRegionZone(bundle, "AR", "US", "State"),
        loadRegionZone(bundle, "LA", "US", "State"),
        loadRegionZone(bundle, "OK", "US", "State"),
        loadRegionZone(bundle, "TX", "US", "State")
      })
      loadRegion(bundle, "Denver Branch", {
        loadRegionZone(bundle, "CO", "US", "State"),
        loadRegionZone(bundle, "WY", "US", "State")
      })
      loadRegion(bundle, "Los Angeles Branch - SoCal", {
        loadRegionZone(bundle, "CA:Imperial", "US", "County"),
        loadRegionZone(bundle, "CA:Kern", "US", "County"),
        loadRegionZone(bundle, "CA:Los Angeles", "US", "County"),
        loadRegionZone(bundle, "CA:Orange", "US", "County"),
        loadRegionZone(bundle, "CA:Riverside", "US", "County"),
        loadRegionZone(bundle, "CA:San Bernardino", "US", "County"),
        loadRegionZone(bundle, "CA:San Diego", "US", "County"),
        loadRegionZone(bundle, "CA:San Luis Obispo", "US", "County"),
        loadRegionZone(bundle, "CA:Santa Barbara", "US", "County"),
        loadRegionZone(bundle, "CA:Ventura", "US", "County")
      })
      loadRegion(bundle, "Minneapolis Branch", {
        loadRegionZone(bundle, "MN", "US", "State"),
        loadRegionZone(bundle, "ND", "US", "State"),
        loadRegionZone(bundle, "SD", "US", "State")
      })
      loadRegion(bundle, "Phoenix Branch", {
        loadRegionZone(bundle, "AZ", "US", "State"),
        loadRegionZone(bundle, "NM", "US", "State")
      })
      loadRegion(bundle, "Portland Branch", {
        loadRegionZone(bundle, "AK", "US", "State"),
        loadRegionZone(bundle, "OR", "US", "State"),
        loadRegionZone(bundle, "WA", "US", "State")
      })
      loadRegion(bundle, "Salt Lake City Branch", {
        loadRegionZone(bundle, "NV", "US", "State"),
        loadRegionZone(bundle, "UT", "US", "State")
      })
      loadRegion(bundle, "St. Louis Branch", {
        loadRegionZone(bundle, "IA", "US", "State"),
        loadRegionZone(bundle, "KS", "US", "State"),
        loadRegionZone(bundle, "MO", "US", "State"),
        loadRegionZone(bundle, "NE", "US", "State")
      })
      loadRegion(bundle, "Tampa Branch", {
        loadRegionZone(bundle, "FL", "US", "State"),
        loadRegionZone(bundle, "GA", "US", "State"),
        loadRegionZone(bundle, "PR", "US", "State"),
        loadRegionZone(bundle, "SC", "US", "State")
      })
      loadRegion(bundle, "Trenton Branch", {
        loadRegionZone(bundle, "DE", "US", "State"),
        loadRegionZone(bundle, "NJ", "US", "State"),
        loadRegionZone(bundle, "PA", "US", "State")
      })
      loadRegion(bundle, "LA Local Area", {
        loadRegionZone(bundle, "CA:Kern", "US", "County"),
        loadRegionZone(bundle, "CA:Los Angeles", "US", "County"),
        loadRegionZone(bundle, "CA:Orange", "US", "County"),
        loadRegionZone(bundle, "CA:Riverside", "US", "County"),
        loadRegionZone(bundle, "CA:San Bernardino", "US", "County"),
        loadRegionZone(bundle, "CA:San Luis Obispo", "US", "County"),
        loadRegionZone(bundle, "CA:Santa Barbara", "US", "County"),
        loadRegionZone(bundle, "CA:Ventura", "US", "County")
      })
      loadRegion(bundle, "San Diego Local Area", {
        loadRegionZone(bundle, "CA:Imperial", "US", "County"),
        loadRegionZone(bundle, "CA:San Diego", "US", "County")
      })
      loadRegion(bundle, "Chicago Local Area", {
        loadRegionZone(bundle, "IL:Lake", "US", "County"),
        loadRegionZone(bundle, "IL:Cook", "US", "County"),
        loadRegionZone(bundle, "IL:McHenry", "US", "County"),
        loadRegionZone(bundle, "IL:Boone", "US", "County"),
        loadRegionZone(bundle, "IL:DeKalb", "US", "County"),
        loadRegionZone(bundle, "IL:Kane", "US", "County"),
        loadRegionZone(bundle, "IL:Kendall", "US", "County"),
        loadRegionZone(bundle, "IL:DuPage", "US", "County"),
        loadRegionZone(bundle, "IL:Will", "US", "County"),
        loadRegionZone(bundle, "IL:Bureau", "US", "County"),
        loadRegionZone(bundle, "IL:Carroll", "US", "County"),
        loadRegionZone(bundle, "IL:Ford", "US", "County"),
        loadRegionZone(bundle, "IL:Grundy", "US", "County"),
        loadRegionZone(bundle, "IL:Henry", "US", "County"),
        loadRegionZone(bundle, "IL:Iroquois", "US", "County"),
        loadRegionZone(bundle, "IL:Jo Daviess", "US", "County"),
        loadRegionZone(bundle, "IL:Kankakee", "US", "County"),
        loadRegionZone(bundle, "IL:Knox", "US", "County"),
        loadRegionZone(bundle, "IL:La Salle", "US", "County"),
        loadRegionZone(bundle, "IL:Lee", "US", "County"),
        loadRegionZone(bundle, "IL:Livingston", "US", "County"),
        loadRegionZone(bundle, "IL:Marshall", "US", "County"),
        loadRegionZone(bundle, "IL:Mercer", "US", "County"),
        loadRegionZone(bundle, "IL:Ogle", "US", "County"),
        loadRegionZone(bundle, "IL:Peoria", "US", "County"),
        loadRegionZone(bundle, "IL:Putnam", "US", "County"),
        loadRegionZone(bundle, "IL:Rock Island", "US", "County"),
        loadRegionZone(bundle, "IL:Stark", "US", "County"),
        loadRegionZone(bundle, "IL:Stephenson", "US", "County"),
        loadRegionZone(bundle, "IL:Whiteside", "US", "County"),
        loadRegionZone(bundle, "IL:Winnebago", "US", "County")
      })
      loadRegion(bundle, "Southwest Illinois Local Area", {
        loadRegionZone(bundle, "IL:Adams", "US", "County"),
        loadRegionZone(bundle, "IL:Alexander", "US", "County"),
        loadRegionZone(bundle, "IL:Bond", "US", "County"),
        loadRegionZone(bundle, "IL:Brown", "US", "County"),
        loadRegionZone(bundle, "IL:Calhoun", "US", "County"),
        loadRegionZone(bundle, "IL:Cass", "US", "County"),
        loadRegionZone(bundle, "IL:Champaign", "US", "County"),
        loadRegionZone(bundle, "IL:Christian", "US", "County"),
        loadRegionZone(bundle, "IL:Clark", "US", "County"),
        loadRegionZone(bundle, "IL:Clay", "US", "County"),
        loadRegionZone(bundle, "IL:Clinton", "US", "County"),
        loadRegionZone(bundle, "IL:Coles", "US", "County"),
        loadRegionZone(bundle, "IL:Crawford", "US", "County"),
        loadRegionZone(bundle, "IL:Cumberland", "US", "County"),
        loadRegionZone(bundle, "IL:De Witt", "US", "County"),
        loadRegionZone(bundle, "IL:Douglas", "US", "County"),
        loadRegionZone(bundle, "IL:Edgar", "US", "County"),
        loadRegionZone(bundle, "IL:Edwards", "US", "County"),
        loadRegionZone(bundle, "IL:Effingham", "US", "County"),
        loadRegionZone(bundle, "IL:Fayette", "US", "County"),
        loadRegionZone(bundle, "IL:Franklin", "US", "County"),
        loadRegionZone(bundle, "IL:Fulton", "US", "County"),
        loadRegionZone(bundle, "IL:Gallatin", "US", "County"),
        loadRegionZone(bundle, "IL:Greene", "US", "County"),
        loadRegionZone(bundle, "IL:Hamilton", "US", "County"),
        loadRegionZone(bundle, "IL:Hancock", "US", "County"),
        loadRegionZone(bundle, "IL:Hardin", "US", "County"),
        loadRegionZone(bundle, "IL:Henderson", "US", "County"),
        loadRegionZone(bundle, "IL:Jackson", "US", "County"),
        loadRegionZone(bundle, "IL:Jasper", "US", "County"),
        loadRegionZone(bundle, "IL:Jefferson", "US", "County"),
        loadRegionZone(bundle, "IL:Jersey", "US", "County"),
        loadRegionZone(bundle, "IL:Johnson", "US", "County"),
        loadRegionZone(bundle, "IL:Kendall", "US", "County"),
        loadRegionZone(bundle, "IL:Lawrence", "US", "County"),
        loadRegionZone(bundle, "IL:Logan", "US", "County"),
        loadRegionZone(bundle, "IL:Macon", "US", "County"),
        loadRegionZone(bundle, "IL:Macoupin", "US", "County"),
        loadRegionZone(bundle, "IL:Madison", "US", "County"),
        loadRegionZone(bundle, "IL:Marion", "US", "County"),
        loadRegionZone(bundle, "IL:Mason", "US", "County"),
        loadRegionZone(bundle, "IL:Massac", "US", "County"),
        loadRegionZone(bundle, "IL:McDonough", "US", "County"),
        loadRegionZone(bundle, "IL:McLean", "US", "County"),
        loadRegionZone(bundle, "IL:Menard", "US", "County"),
        loadRegionZone(bundle, "IL:Monroe", "US", "County"),
        loadRegionZone(bundle, "IL:Montgomery", "US", "County"),
        loadRegionZone(bundle, "IL:Morgan", "US", "County"),
        loadRegionZone(bundle, "IL:Moultrie", "US", "County"),
        loadRegionZone(bundle, "IL:Perry", "US", "County"),
        loadRegionZone(bundle, "IL:Piatt", "US", "County"),
        loadRegionZone(bundle, "IL:Pike", "US", "County"),
        loadRegionZone(bundle, "IL:Pope", "US", "County"),
        loadRegionZone(bundle, "IL:Pulaski", "US", "County"),
        loadRegionZone(bundle, "IL:Randolph", "US", "County"),
        loadRegionZone(bundle, "IL:Richland", "US", "County"),
        loadRegionZone(bundle, "IL:Saline", "US", "County"),
        loadRegionZone(bundle, "IL:Sangamon", "US", "County"),
        loadRegionZone(bundle, "IL:Schuyler", "US", "County"),
        loadRegionZone(bundle, "IL:Scott", "US", "County"),
        loadRegionZone(bundle, "IL:Shelby", "US", "County"),
        loadRegionZone(bundle, "IL:St. Clair", "US", "County"),
        loadRegionZone(bundle, "IL:Tazewell", "US", "County"),
        loadRegionZone(bundle, "IL:Union", "US", "County"),
        loadRegionZone(bundle, "IL:Vermilion", "US", "County"),
        loadRegionZone(bundle, "IL:Wabash", "US", "County"),
        loadRegionZone(bundle, "IL:Warren", "US", "County"),
        loadRegionZone(bundle, "IL:Washington", "US", "County"),
        loadRegionZone(bundle, "IL:Wayne", "US", "County"),
        loadRegionZone(bundle, "IL:White", "US", "County"),
        loadRegionZone(bundle, "IL:Will", "US", "County"),
        loadRegionZone(bundle, "IL:Williamson", "US", "County"),
        loadRegionZone(bundle, "IL:Woodford", "US", "County")
      })
    
    })
  }
  
}
