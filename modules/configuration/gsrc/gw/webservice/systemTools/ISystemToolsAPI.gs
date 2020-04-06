package gw.webservice.systemTools

uses gw.api.webservice.exception.PermissionException
uses gw.api.webservice.exception.ServerStateException
uses gw.api.webservice.systemTools.ServerVersion
uses gw.api.webservice.systemTools.DBConsistencyCheckResult
uses gw.api.database.AWRReportUserSettings
uses gw.api.database.DatabaseSnapshotInfo
uses gw.api.tools.ProcessID
uses gw.api.webservice.systemTools.SystemToolsImpl
uses gw.api.webservice.systemTools.SystemRunlevel
uses gw.api.webservice.systemTools.SessionData
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.SOAPServerException
uses gw.api.webservice.WSRunlevel
uses gw.api.webservice.exception.RequiredFieldException
uses java.lang.String
uses java.lang.Throwable
uses java.lang.SuppressWarnings

/**
* System maintenance interface.
*/
@RpcWebService(WSRunlevel.SHUTDOWN, {SystemPermissionType.TC_TOOLSINFOVIEW})
@Deprecated("Use WS-I webservice gw.wsi.pl.SystemToolsAPI instead.")
@SuppressWarnings("deprecation")
@Export
class ISystemToolsAPI {

  /**
   * Get the version of the server, including application version and schema version.
   * The application version is in the format: <tt>[major].[minor].[build]</tt>.
   * The scheme version is in the format: <tt>[base].[vertical]</tt>.
   *
   * @return  Version of the server, including application version and schema version.
   */
  @Throws(SOAPException, "")
  public function getVersion() : ServerVersion {
    var version :ServerVersion
    try {
      version = new SystemToolsImpl().getVersion()
    } catch(e : Throwable){
      throw new SOAPException(e.Message)
    }
    return version
  }

  /**
   * Check the consistency of the underlying physical database.
   *
   * @param returnAllResults true - DBConsistencyCheckResult is returned for every check
   * false - DBConsistencyCheckResults returned only for failures.
   * @return DBConsistencyCheckResult[] Describes results of consistency checks
   * (All checks if returnAllResults=true, otherwise all failures.)
   */
  @Throws(SOAPException, "")
  public function checkDatabaseConsistency(returnAllResults : boolean) : DBConsistencyCheckResult[] {
    return new SystemToolsImpl().checkDatabaseConsistency(returnAllResults)
  }
  
  /**
   * Run a subset of the consistency checks on the underlying physical database.
   *
   * @param returnAllResults             true - DBConsistencyCheckResult is returned for every check
   *                                      false - DBConsistencyCheckResults returned only for failures.
   * @param tablesToCheck                null - check all tables, else array of tables names to check
   * @param consistencyCheckTypesToCheck null - check all types, else array of types to check
   *                                     Must be valid <code>ConsistencyCheckType</code>s.
   * @return DBConsistencyCheckResult[]  Describes results of consistency checks
   * @throws gw.api.webservice.exception.PermissionException SOAPException
   */
   @Throws(SOAPException, "")
   public function checkPartialDatabaseConsistency(returnAllResults : boolean, tablesToCheck : String[], 
       consistencyCheckTypesToCheck : String[]) : DBConsistencyCheckResult[]{
    return new SystemToolsImpl().checkPartialDatabaseConsistency( returnAllResults, tablesToCheck, 
        consistencyCheckTypesToCheck)
   }

  /**
   * Submit the consistency checks batch job on the underlying physical database.
   *
   * @param tablesToCheck                null - check all tables, else array of tables names to check
   * @param consistencyCheckTypesToCheck null - check all types, else array of types to check
   *                                     Must be valid <code>ConsistencyCheckType</code>s.
   * @return ProcessID  Describes results of consistency checks
   * @throws gw.api.webservice.exception.PermissionException SOAPException
   */
   @Throws(SOAPException, "")
   public function submitDBCCBatchJob(tablesToCheck : String[], consistencyCheckTypesToCheck : String[]) : ProcessID {
    return new SystemToolsImpl().submitDBCCBatchJob( tablesToCheck, consistencyCheckTypesToCheck )
   }

  /**
   * Returns the state of the consistency checks process. Only one set of consistency checks can be running at
   * any given moment.
   *
   * @return the state of the consistency checks process
   * @throws gw.api.webservice.exception.PermissionException SOAPException
   */
   @Throws(SOAPException, "")
  public function getDBCCState() : WorkItemSetState {
    return new SystemToolsImpl().getDBCCState()
  }

  /**
   * Run the update stats process on the underlying physical database. Please use isUpdateStatsRunning() to check on
   * the state of the run.
   *
   * @param description null - Description of the job
   * @param incremental true: the process should perform an incremental update; false: the process should perform a full upgrade
   * @throws gw.api.webservice.exception.PermissionException SOAPException
   */
  @Throws(SOAPException, "")
  public function submitUpdateStats(description : String, incremental : boolean) {
    new SystemToolsImpl().submitUpdateStats( description, incremental )
  }

  /**
   * Cancel the update stats process if running. Please use getUpdateStatsState() to check on the state of the run.
   */
  @Throws(SOAPException, "")
  public function cancelUpdateStats() {
    new SystemToolsImpl().cancelUpdateStats()
  }

  /**
   * Checks whether the update stats process is currently running. Only one set of update stats statements can be
   * Returns the state of the update stats process. Only one update stats process can be running at
   * any given moment.
   *
   * @return the state of the update stats process
   * @throws gw.api.webservice.exception.PermissionException SOAPException
   */
  @Throws(SOAPException, "")
  public function getUpdateStatsState() : WorkItemSetState {
    return new SystemToolsImpl().getUpdateStatsState()
  }

  /**
   * Submit the SQL Server DMV Performance Report batch job using defaults values for
   * includeDatabaseStatistics (true)
   *
   * @return ProcessID  pid of batch job
   * @throws gw.api.webservice.exception.PermissionException SOAPException
   */
   @Throws(SOAPException, "")
   public function submitDmvReportBatchJob() : ProcessID {
    return new SystemToolsImpl().submitDmvReportBatchJob( true )
   }

  /**
   * Submit the SQL Server DMV Performance Report batch job with parameters.
   *
   * @param numTopQueries                The default is 400.
   * @param numHotObjects                The default is 400
   * @param includeDatabaseStatistics    The default is true.
   *
   * @return ProcessID  pid of batch job
   * @throws gw.api.webservice.exception.PermissionException SOAPException
   */
   @Throws(SOAPException, "")
   public function submitDmvReportBatchJobWithParams(includeDatabaseStatistics : boolean) : ProcessID {
    return new SystemToolsImpl().submitDmvReportBatchJob( includeDatabaseStatistics )
   }

  /**
   * Retrieve the latest N Oracle AWR snapshots.
   *
   * @param numSnapshots                 Number of snapshots to retrieve.
   *
   * @return String[]                    Requested AWR snapshot information
   * @throws gw.api.webservice.exception.PermissionException SOAPException
   */
   @Throws(SOAPException, "")
   public function getRecentAWRSnapshotInfo(numSnapshots : int) : DatabaseSnapshotInfo[] {
    return new SystemToolsImpl().getRecentAWRSnapshotInfo(numSnapshots)
   }

  /**
   * Submit the Oracle AWR Performance Report batch job
   *
   * @param awrReportUserSettings        All the settings to run the AWR report
   *
   * @return ProcessID  pid of batch job
   * @throws gw.api.webservice.exception.PermissionException SOAPException
   */
   @Throws(SOAPException, "")
   public function submitAwrReportBatchJob(awrReportUserSettings : AWRReportUserSettings) : ProcessID {
    return new SystemToolsImpl().submitAwrReportBatchJob( awrReportUserSettings )
   }

  /**
   * Creates a report of the state of the database catalog statistics for all tables.
   *
   * @return a zip file of an HTML report to view the database catalog statistics.
   * @throws gw.api.webservice.exception.PermissionException SOAPException
   */
   @Throws(SOAPException, "")
   public function reportDatabaseCatalogStatistics() : byte[]  {
    return new SystemToolsImpl().reportDatabaseCatalogStatistics()
   }

  /**
   * Creates a report of the state of the database catalog statistics for all tables.
   *
   * @param tables         null - report on all tables, else array of tables names to on which to report
   * @param stagingTables  null - report on all staging tables, else array of staging tables names to on which to report
   * @param typelistTables null - report on all typelist tables, else array of typelist tables names to on which to report
   * @return a zip file of an HTML report to view the database catalog statistics on the selected tables.
   * @throws ServerStateException
   */
  public function reportPartialDatabaseCatalogStatistics(tables : String[], stagingTables : String[], typelistTables : String[]): byte[] {
   return new SystemToolsImpl().reportPartialDatabaseCatalogStatistics(tables, stagingTables, typelistTables)
  }

  /**
   * Verify that the data mode matches the physical database
   * @return String[] Any differences between the data model and the physical database.
   */
  @Throws(SOAPServerException, "")
  @Throws(PermissionException, "")
  public function verifyDatabaseSchema() : String[]{
    return new SystemToolsImpl().verifyDatabaseSchema()
  }

  /**
   * Sets the run level of the server. If the server is currently undergoing a runlevel change, this method will block
   * until that level change has completed.
   * <p/>
   * The valid run levels that the server can be set to through this method are <code>SystemRunlevel.GW_DB_MAINTENANCE</code>,
   * <code>SystemRunlevel.GW_MAINTENANCE</code>, and <code>SystemRunlevel.GW_MULTIUSER</code>.  See the definitions of those constants
   * for more information.
   *
   * @param runLevel The level at which the server should run.
   */
  @Throws(ServerStateException, "if the server is already at that level or if the specified run level is not one of the allowed constants.")
  public function setRunlevel(runLevel : SystemRunlevel){
    new SystemToolsImpl().setRunlevel(runLevel)
  }

  /**
   * Gets the run level of the server.  See the definition of the run level constants for details of how to interpret
   * this value.
   *
   * @return An int containing the runlevel
   */
  public function getRunlevel() : SystemRunlevel{
    return new SystemToolsImpl().getRunlevel()
  }

  /**
     * Gets the highest run level of the cluster.  See the definition of the run level constants for details of how to
     * interpret this value.
     *
     * @return An int containing the highest runlevel of the cluster.
     */
  public function getHighestRunlevel() : SystemRunlevel {
    return new SystemToolsImpl().getHighestRunlevel()
  }

  /**
   * Returns all server session information.  The session information is returned as an array of SessionData objects,
   * each of which contains the user's name, ID, and session ID for a session that's currently open.
   *
   * @return all server session information.
   */
  @Throws(SOAPException, "")
  @Throws(PermissionException, "if the caller does not have all of the following permissions: ADMIN")
  public function getActiveSessionData() : SessionData[] {
    return new SystemToolsImpl().getActiveSessionData()
  }

  /**
   * Dynamically updates the logging level of the given logger.
   *
   * @param logger The name of the logger to be updated - this should be a qualified class or package
   * @param level One of 5 possible logging levels: INFO, DEBUG, WARN, ERROR, TRACE
   */
  @Throws(SOAPServerException, "If the logging level is not valid.")
  @Throws(RequiredFieldException, "If the logger field is null.")
  public function updateLoggingLevel(logger : String, level : String) {
    new SystemToolsImpl().updateLoggingLevel(logger, level)
  }

  /**
   * Causes a reload of the logging.properties.
   */
  public function reloadLoggingConfig(){
    new SystemToolsImpl().reloadLoggingConfig()
  }

  /**
   * Recalculates the file checksums used for clustered configuration verification.  Returns true
   * if checksums were recalcuted and false if clustering or configuration verification were disabled.
   *
   * @return <code>true</code> if checksums were recalcuted and <code>false</code> if clustering or configuration verification were disabled.
   */
  @Throws (SOAPServerException, "")
  @Throws (PermissionException, "")
  public function recalculateFileChecksums() : boolean {
    return new SystemToolsImpl().recalculateFileChecksums()
  }

  /**
   * Get a list of all of the logger categories available in the system. These can be used
   * directly in logging.properties.
   *
   * @return An array of Strings containing all logger categories in the system
   */
  @Throws (SOAPServerException, "")
  @Throws (PermissionException, "")
  function getLoggingCategories() : String[] {
    return new SystemToolsImpl().getLoggingCategories()
  }
}
