package gw.sampledata.tiny

uses gw.api.database.Query
uses gw.api.system.PLDependenciesGateway
uses gw.api.util.DataImportTestUtil
uses gw.api.webservice.zone.ZoneImportHelper
uses gw.sampledata.AbstractSampleDataCollection

/**
 * A tiny set of Zones, just enough for testing.
 */
@Export
class TinyZoneData extends AbstractSampleDataCollection {
  construct() { }

  /**
   * The name of this sample data collection, for logging and debugging
   */
  public override property get CollectionName() : String {
    return "Tiny Zone Data"
  }

  /**
   * Checks the database, returning true if this set is already loaded (and thus doesn't need reloading)
   */
  public override property get AlreadyLoaded() : boolean {
    return zoneDataLoaded("99501")
  }

  /**
   * Loads the contents of this sample data set into the DB
   */
  public override function load() {
    importZoneData()
  }

  protected function zoneDataLoaded(data : String) : boolean {
    var zoneQuery = Query.make(Zone).compare("Code", Equals, data)
    return zoneQuery.select().HasElements
  }

  protected static function importZoneData() {
    if (ZoneImportHelper.appSupportsZoneData()) {
      PLDependenciesGateway.getZoneConfiguration().start()
      DataImportTestUtil.importZoneData()
    }
  }
}