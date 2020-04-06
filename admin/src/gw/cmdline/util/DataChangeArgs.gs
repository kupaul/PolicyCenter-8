package gw.cmdline.util

uses gw.lang.cli.*

class DataChangeArgs {

  /**
   * This permits adding or replacing the gosu for the data change.  The argument is the unique id of the external reference for this change. In addition to this argument, the gosu argument is required and description argument is optional.
   */
  @ShortName( "edit" )
  static var _edit : String as Edit

  /**
   * The file containing the gosu code. This is a required argument used with edit argument.
   */
  @ShortName( "gosu" )
  static var _gosuFile : String as GosuFile

  /**
   * A description of the data change.  This is optional argument used with edit argument.
   */
  @ShortName( "description" )
  static var _description : String as Description

  /**
   * The reference to the change you want result on.
   */
  @ShortName( "result" )
  static var _result : String as Result

  /**
   * The reference to the change you want status on.
   */
  @ShortName( "status" )
  static var _status : String as Status

  /**
   * The reference to the change you want to discard.
   */
  @ShortName( "discard" )
  static var _discard : String as Discard

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
    @DefaultValue( "gw" )
    static var _password : String as Password

}
