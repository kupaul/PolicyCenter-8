package gw.sampledata.tiny

uses gw.sampledata.AbstractSampleDataCollection
uses gw.transaction.Transaction

/**
 * A tiny set of Regions and SecurityZones, just enough for testing.
 */
@Export
class TinySampleRegionData extends AbstractSampleDataCollection
{
  construct() { }

  /**
   * The name of this sample data collection, for logging and debugging
   */
  public override property get CollectionName() : String {
    return "Tiny Regions"
  }
  
  /**
   * Checks the database, returning true if this set is already loaded (and thus doesn't need reloading)
   */
  public override property get AlreadyLoaded() : boolean {
    return securityZoneLoaded("HO UW")
  }
  
  /**
   * Loads the contents of this sample data set into the DB
   */
  public override function load() {
    Transaction.runWithNewBundle( \bundle -> {
    
      // ZONES
      loadSecurityZone(bundle, "HO UW", "HO Underwriting")
      loadSecurityZone(bundle, "Eastern Region", "Eastern Region")
      loadSecurityZone(bundle, "Western Region", "Western Region")
      
      // REGIONS
      loadRegion(bundle, "Western Region", {
        loadRegionZone(bundle, "AK", "US", "State"),
        loadRegionZone(bundle, "AZ", "US", "State"),
        loadRegionZone(bundle, "CA", "US", "State"),
        loadRegionZone(bundle, "CO", "US", "State"),
        loadRegionZone(bundle, "HI", "US", "State"),
        loadRegionZone(bundle, "ID", "US", "State"),
        loadRegionZone(bundle, "MT", "US", "State"),
        loadRegionZone(bundle, "NM", "US", "State"),
        loadRegionZone(bundle, "NV", "US", "State"),
        loadRegionZone(bundle, "OR", "US", "State"),
        loadRegionZone(bundle, "UT", "US", "State"),
        loadRegionZone(bundle, "WA", "US", "State"),
        loadRegionZone(bundle, "WY", "US", "State")
      })
      loadRegion(bundle, "Eastern Region", {
        loadRegionZone(bundle, "CT", "US", "State"),
        loadRegionZone(bundle, "DC", "US", "State"),
        loadRegionZone(bundle, "DE", "US", "State"),
        loadRegionZone(bundle, "FL", "US", "State"),
        loadRegionZone(bundle, "GA", "US", "State"),
        loadRegionZone(bundle, "MA", "US", "State"),
        loadRegionZone(bundle, "MD", "US", "State"),
        loadRegionZone(bundle, "ME", "US", "State"),
        loadRegionZone(bundle, "NC", "US", "State"),
        loadRegionZone(bundle, "NH", "US", "State"),
        loadRegionZone(bundle, "NJ", "US", "State"),
        loadRegionZone(bundle, "NY", "US", "State"),
        loadRegionZone(bundle, "PA", "US", "State"),
        loadRegionZone(bundle, "PR", "US", "State"),
        loadRegionZone(bundle, "RI", "US", "State"),
        loadRegionZone(bundle, "SC", "US", "State"),
        loadRegionZone(bundle, "VA", "US", "State"),
        loadRegionZone(bundle, "VT", "US", "State"),
        loadRegionZone(bundle, "WV", "US", "State")
      })
      loadRegion(bundle, "Los Angeles Branch - HI", {
        loadRegionZone(bundle, "HI", "US", "State")
      })
      loadRegion(bundle, "Sacramento Branch", {
        loadRegionZone(bundle, "CA:Alameda", "US", "County"),
        loadRegionZone(bundle, "CA:Alpine", "US", "County"),
        loadRegionZone(bundle, "CA:Amador", "US", "County"),
        loadRegionZone(bundle, "CA:Butte", "US", "County"),
        loadRegionZone(bundle, "CA:Calaveras", "US", "County"),
        loadRegionZone(bundle, "CA:Colusa", "US", "County"),
        loadRegionZone(bundle, "CA:Contra Costa", "US", "County"),
        loadRegionZone(bundle, "CA:Del Norte", "US", "County"),
        loadRegionZone(bundle, "CA:El Dorado", "US", "County"),
        loadRegionZone(bundle, "CA:Fresno", "US", "County"),
        loadRegionZone(bundle, "CA:Glenn", "US", "County"),
        loadRegionZone(bundle, "CA:Humboldt", "US", "County"),
        loadRegionZone(bundle, "CA:Inyo", "US", "County"),
        loadRegionZone(bundle, "CA:Kings", "US", "County"),
        loadRegionZone(bundle, "CA:Lake", "US", "County"),
        loadRegionZone(bundle, "CA:Lassen", "US", "County"),
        loadRegionZone(bundle, "CA:Madera", "US", "County"),
        loadRegionZone(bundle, "CA:Marin", "US", "County"),
        loadRegionZone(bundle, "CA:Mariposa", "US", "County"),
        loadRegionZone(bundle, "CA:Mendocino", "US", "County"),
        loadRegionZone(bundle, "CA:Merced", "US", "County"),
        loadRegionZone(bundle, "CA:Modoc", "US", "County"),
        loadRegionZone(bundle, "CA:Mono", "US", "County"),
        loadRegionZone(bundle, "CA:Monterey", "US", "County"),
        loadRegionZone(bundle, "CA:Napa", "US", "County"),
        loadRegionZone(bundle, "CA:Nevada", "US", "County"),
        loadRegionZone(bundle, "CA:Placer", "US", "County"),
        loadRegionZone(bundle, "CA:Plumas", "US", "County"),
        loadRegionZone(bundle, "CA:Sacramento", "US", "County"),
        loadRegionZone(bundle, "CA:San Benito", "US", "County"),
        loadRegionZone(bundle, "CA:San Francisco", "US", "County"),
        loadRegionZone(bundle, "CA:San Joaquin", "US", "County"),
        loadRegionZone(bundle, "CA:San Mateo", "US", "County"),
        loadRegionZone(bundle, "CA:Santa Clara", "US", "County"),
        loadRegionZone(bundle, "CA:Santa Cruz", "US", "County"),
        loadRegionZone(bundle, "CA:Shasta", "US", "County"),
        loadRegionZone(bundle, "CA:Sierra", "US", "County"),
        loadRegionZone(bundle, "CA:Siskiyou", "US", "County"),
        loadRegionZone(bundle, "CA:Solano", "US", "County"),
        loadRegionZone(bundle, "CA:Sonoma", "US", "County"),
        loadRegionZone(bundle, "CA:Stanislaus", "US", "County"),
        loadRegionZone(bundle, "CA:Sutter", "US", "County"),
        loadRegionZone(bundle, "CA:Tehama", "US", "County"),
        loadRegionZone(bundle, "CA:Trinity", "US", "County"),
        loadRegionZone(bundle, "CA:Tulare", "US", "County"),
        loadRegionZone(bundle, "CA:Tuolumne", "US", "County"),
        loadRegionZone(bundle, "CA:Yolo", "US", "County"),
        loadRegionZone(bundle, "CA:Yuba", "US", "County")
      })

    })
  }
  
}
