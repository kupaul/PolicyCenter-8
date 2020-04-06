package gw.cmdline.util

uses gw.lang.cli.*

class ImportToolsArgs {

  /**
   * A comma-separated list of files to import.
   * You can provide a file that contains the list of files by prepending the file name with an @ sign.  E.g. -import @files.lst
   */
  static var _import : String as Import

  /**
   * Dump .XML to specified file then stop.  No data imported into the server.  Input files should be in .CSV format.
   */
  static var _outputXml : String as OutputXml

  /**
   * Dump .CSV to specified file then stop.  No data imported into the server.  Input files should be in .XML format.
   */
  static var _outputCsv : String as OutputCsv

  /**
   * Tells the import tool ignore violations of null constraints in .CSV input
   */
  static var _ignoreNullViolations : Boolean as IgnoreNullViolations

  /**
   * Tells the import tool ignore all errors in .CSV input
   */
  static var _ignoreAllErrors : Boolean as IgnoreAllErrors

  /**
   * Tells the import tool which dataset should be imported from .CSV input
   */
  static var _dataset : String as Dataset

  /**
   * Rebuild the role privileges
   */
  static var _privileges : Boolean as Privileges

  /**
   * Charset that the files are encoded in
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
