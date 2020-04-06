package gw.cmdline.util

uses gw.lang.cli.*

class MessagingToolsArgs {

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

  /**
   * Purge completed messages before this date (in MM/dd/yyyy form)
   */
   static var _purge : String as Purge

  /**
   * Retry message with the given ID
   */
   static var _retry : java.lang.Integer as Retry

  /**
   * Skip message with the given ID
   */
   static var _skip : java.lang.Integer as Skip

  /**
   * Suspend the destination for the given destination ID
   */
   static var _suspend : java.lang.Integer as Suspend

  /**
   * Resume the destination for the given destination ID
   */
   static var _resume : java.lang.Integer as Resume

  /**
   * Retry all retryable messages for the given destination ID
   */
   @ShortName( "retrydest" )
   static var _retryAll : java.lang.Integer as RetryDest

  /**
   * Resync a account against a destination (requires the -account and -destination options)
   */
   static var _resync : Boolean as Resync

  /**
   * The account number to resync
   */
   static var _account : String as Account

  /**
   * The destination ID to resync
   */
   static var _destination : java.lang.Integer as Destination

  /**
   * Print the statistics for the destination with the given destination ID
   */
   static var _statistics : java.lang.Integer as Statistics

  /** This is a command to print the current configuration of the given destination ID
  */
  static var _config : java.lang.Integer as Config

  /** This is a command to restart a given destination ID, additional parameters
   * wait, retries, initial, backoff, poll, threads, chunk
   */
  static var _restart : java.lang.Integer as Restart
  /** How long to wait for work in progress to finish before forcing the change */
  static var _timeToWaitInSec        : java.lang.Integer as Wait;
  /** the maximum number of retry attempts */
  static var _maxretries             : java.lang.Integer as Retries;
  /** the initial period to wait before retrying */
  static var _initialretryinterval   : java.lang.Integer as Initial;
  /** how much to back off before the next retry attempt */
  static var _retrybackoffmultiplier : java.lang.Integer as Backoff;
  /** how often to poll (from start to start) */
  static var _pollinterval           : java.lang.Integer as Poll;
  /** the number of sender threads */
  static var _numsenderthreads       : java.lang.Integer as Threads;
  /** the number of messages to process in each query */
  static var _chunksize              : java.lang.Integer as Chunk;

}
