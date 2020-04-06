package gw.cmdline.util

uses gw.lang.cli.*

class WorkflowToolsArgs {

  /**
   * resume all workflows in the Error or Suspended state
   */
   static var _resumeAll : Boolean as ResumeAll

  /**
   * resume workflow in the Error or Suspended state
   */
   static var _resumeOpt : String as Resume

  /**
   * complete running workflow
   */
   static var _completeOpt : String as Complete

  /**
   * suspend running workflow
   */
   static var _suspendOpt : String as Suspend

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
