package gw.cmdline.util

uses gw.lang.cli.*

class TemplateToolsArgs {

  /**
   * Specify a directory so that relative paths can be used for file arguments
   */
   static var _workingDir : String as WorkingDir

  /**
   * convert a single file
   */
   static var _convertFile : String as ConvertFile

  /**
   * convert all the templates in a directory
   */
   static var _convertDir : String as ConvertDir

  /**
   * validate a single template
   */
   static var _validateTemplate : String as ValidateTemplate

  /**
   * validate all the templates
   */
   static var _validateAll : Boolean as ValidateAll

  /**
   * lists all of the templates available to be validated
   */
   static var _listTemplates : Boolean as ListTemplates

  /**
   * import context objects, form field groups, and form fields into a single template
   */
   static var _importFiles : String[] as ImportFiles

  /**
   * import context objects and form fields into all the templates in a directory
   */
   static var _importDir : String[] as ImportDir

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
