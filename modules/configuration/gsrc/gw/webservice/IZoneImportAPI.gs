package gw.webservice

uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.zone.ZoneImportHelper
uses java.lang.SuppressWarnings

/**
* IZoneImportAPI is a remote interface to a set of tools to import zone data (in csv format)
* into the staging tables.  See documentation for the zone data csv format.
*/
@RpcWebService
@Deprecated("Use WS-I webservice gw.wsi.pl.ZoneImportAPI.")
@SuppressWarnings("deprecation")
@Export
class IZoneImportAPI {

  /**
   * Import csv formatted data containg zone information.  See the documentation
   * for details of the expected csv format.
   * This gives you the option of clearing out the staging tables before loading the data.
   *
   * @param countryCode the code for the country to which this data belongs
   * @param zoneData     The data to import, passed as a String.
   * @param clearStaging Clears the staging tables before doing the import, this only clears the staging
   * tables of the data for the specified country, if all data needs to be cleared, use table import instead
   */
  @Throws(SOAPException, "If the country code provided does not correspond to a valid country that has a zone configuation defined.")
  public function importToStaging(countryCode : String, zoneData : String, clearStaging : boolean) : int {
    return ZoneImportHelper.importToStaging(countryCode, zoneData, clearStaging)
  }

  /**
   * Clears the production tables that contain zone data in preparation for
   * zone data to be imported from the staging tables via the Table Import Tools.
   * This should be called after the staging tables have gone through an integrity check
   * and any offending rows are excluded/corrected.
   *
   * @param countryCode a valid country code that has a zone configuartion defined or null.  A null value here will clear all zone information.
   */
  @Throws(SOAPException, "If the country code is not null and does not have a zone configuration defined or does not correspond to a valid country.") 
  public function clearProductionTables(countryCode : String) {
    ZoneImportHelper.clearProductionTables(countryCode)
  }

  /**
   * Clears the staging tables tables that contain zone data in preparation for
   * zone data to be imported to the staging tables.  If countryCode is specified
   * and is a valid value, only rows for that country are cleared.
   *
   * @param countryCode a valid country code or null. A null value here will clear all zone information.
   */
  @Throws(SOAPException, "If the country code is not null and does not correspond to a valid country.") 
  public function clearStagingTables(countryCode : String){
    ZoneImportHelper.clearStagingTables( countryCode )
  }
}
