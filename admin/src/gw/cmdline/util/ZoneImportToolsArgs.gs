package gw.cmdline.util

uses gw.lang.cli.*

class ZoneImportToolsArgs {

  /**
   * the country
   */
  static var _country : String as Country

  /**
   * file containing zone data to import; must specify 'country', can optionally specify 'clearstaging' in which case data in staging tables for the specified country are first cleared before importing.
   */
  static var _import : String as Import

  /**
   * clears the zone data production tables; can optionally specify 'country' to only clear the data for the particular country
   */
  static var _clearProduction : Boolean as Clearproduction

  /**
   * clears the zone staging tables; can optionally specify 'country' in which case only data for that country is cleared; can be specified in conjunction with 'import'
   */
  static var _clearStaging : Boolean as Clearstaging

  /**
   * Charset that the files are encoded in (default is UTF-8)
   */
  static var _charset : String as Charset

  /**
   * The root server URL to access
   */
  @DefaultValue( 
          "http://localhost:8180/pc" )
  static var _server : String as Server

  /**
   * The user to log in as
   */
  @DefaultValue( "su" )
  static var _user : String as User

  /**
   * The password to use
   */
  @Required
  static var _password : String as Password

}
