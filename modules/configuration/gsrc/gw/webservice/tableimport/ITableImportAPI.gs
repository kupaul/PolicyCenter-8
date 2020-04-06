package gw.webservice.tableimport

uses gw.api.webservice.exception.SOAPException
uses gw.api.tools.ProcessID
uses gw.api.webservice.tableImport.TableImportImpl
uses gw.api.webservice.tableImport.TableImportResult
uses java.lang.SuppressWarnings

/**
 * This interface provides methods for integrity checking and loading data via
 * the  staging tables.
 * <p/>
 * In particular, it allows the caller to instruct the server
 * to perform the following staging table operations:
 * <ol>
 * <li>Clear error table.</li>
 * <li>Clear exclusion table.</li>
 * <li>Clear staging tables.</li>
 * <li>Delete rows from staging tables based on contents of exclusion table.</li>
 * <li>Populate exclusion table with rows to be excluded.</li>
 * <li>Integrity check the contents of the staging tables.</li>
 * <li>Integrity check the contents of the Zone staging tables and load Zone source tables if no errors.</li>
 * <li>Integrity check the contents of the staging tables and load source tables if no errors.</li>
 * </ol>
 */
@RpcWebService
@Deprecated("Use WS-I webservice gw.wsi.pl.TableImportAPI instead.")
@SuppressWarnings("deprecation")
@Export
class ITableImportAPI {
  /**
   * Instructs the server to clear the error tables.
   */
  @Throws(SOAPException, "")
  public function clearErrorTable(){
    new TableImportImpl().clearErrorTable()
  }

  /**
   * Instructs the  server to clear the exclusion table.
   */
  @Throws(SOAPException, "")
  public function clearExclusionTable(){
    new TableImportImpl().clearExclusionTable()
  }

  /**
   * Instructs the server to clear all staging tables.
   */
  @Throws(SOAPException, "")
  public function clearStagingTables(){
    new TableImportImpl().clearStagingTables()
  }

  /**
   * Instructs the server to delete rows from staging tables
   * based on the contents of the exclusion table (delete all rows in all
   * staging tables where the LUWID matches a LUWID in the exclusion table.)
   */
  @Throws(SOAPException, "")
  public function deleteExcludedRowsFromStagingTables() : void
  {
    new TableImportImpl().deleteExcludedRowsFromStagingTables()
  }

  /**
   * Instructs the server to delete rows from staging tables
   * based on the contents of the exclusion table (delete all rows in all
   * staging tables where the LUWID matches a LUWID in the exclusion table.)
   * <p/>
   * The same as deleteExcludedRowsFromStagingTables except that the operation
   * is done asynchronously in a batch process.  Note that this batch process
   * can't be terminated.
   *
   * @return a ProcessID that can be used to retrieve the status of the job
   */
  @Throws(SOAPException, "")
  public function deleteExcludedRowsFromStagingTablesAsBatchProcess() : ProcessID {
    return new TableImportImpl().deleteExcludedRowsFromStagingTablesAsBatchProcess()
  }

  /**
   * Instructs the server to populate the exclusion table
   * with rows to be excluded (add rows to the exclusion table for every
   * unique LUWID in the load error tables that is not already in the exclusion table).
   */
  @Throws(SOAPException, "")
  public function populateExclusionTable(){
    new TableImportImpl().populateExclusionTable()
  }

  /**
   * Instructs the  server to populate the exclusion table
   * with rows to be excluded (add rows to the exclusion table for every
   * unique LUWID in the error tables that is not already in the exclusion table).
   * <p/>
   * The same as deleteExcludedRowsFromStagingTables except that the operation
   * is done asynchronously in a batch process. Note that this batch process
   * can't be terminated.
   *
   * @return a ProcessID that can be used to retrieve the status of the job
   */
  @Throws(SOAPException, "")
  public function populateExclusionTableAsBatchProcess(): ProcessID{
    return new TableImportImpl().populateExclusionTableAsBatchProcess()
  }

  /**
   * Instructs the  server to update the database statistics on the staging tables.
   * (Database statistics will not be updated on the other tables.)
   */
  @Throws(SOAPException, "")
  public function updateStatisticsOnStagingTables(){
     new TableImportImpl().updateStatisticsOnStagingTables()
  }

  /**
   * Instructs the  server to update the database statistics on the staging tables.
   * (Database statistics will not be updated on the other tables.)  The same as updateStatisticsOnStagingTables
   * except that the process will be performed asynchronously in a batch process.  After completion,
   * the process status will contain the number of tables that were updated in the opsCompleted field.  
   * Note that this batch process can't be terminated.
   *
   * @return a ProcessID that can be used to retrieve the status of the job
   */
  @Throws(SOAPException, "")
  public function updateStatisticsOnStagingTablesAsBatchProcess() : ProcessID {
    return new TableImportImpl().updateStatisticsOnStagingTablesAsBatchProcess()
  }

  /**
   * Instructs the  server to check the integrity of the contents of the staging
   * tables, inserting details about any failures into the load error tables.
   *
   * @param clearErrorTable        If true, the load error tables will be cleared
   *                               before executing integrity checking (defaults to true if this parameter is null).
   * @param populateExclusionTable If true, populate exclusion table with any newly
   *                               excluded rows before executing integrity checking (defaults to true if this parameter
   *                               is null).
   * @param allowRefsToExistingNonAdminRows  If true, rows in the staging tables are allowed to reference
   *                                         existing rows in any table, regardless of whether or not the tables
   *                                         are admin tables.
   * @return a TableImportResult object containing load error information and
   *         any raised exception.
   */
  @Throws(SOAPException, "")
  public function integrityCheckStagingTableContents(
    clearErrorTable : Boolean, populateExclusionTable : Boolean,
    allowRefsToExistingNonAdminRows : Boolean) : TableImportResult
  {
     return new TableImportImpl().integrityCheckStagingTableContents( 
         clearErrorTable, 
         populateExclusionTable,
         allowRefsToExistingNonAdminRows)
  }

  /**
   * Instructs the  server to check the integrity of the contents of the staging
   * tables, inserting details about any failures into the load error tables.  Works like
   * integrityCheckStagingTableContents, but does so in a batch process. After
   * completion, the process status will indicate whether or not the load succeeded, and the
   * failedOps field will contain the number of integrity check errors that occurred (if any).  Note that this batch process
   * can't be terminated.
   *
   * @param clearErrorTable        If true, the load error tables will be cleared
   *                               before executing integrity checking (defaults to true if this parameter is null).
   * @param populateExclusionTable If true, populate exclusion table with any newly
   *                               excluded rows before executing integrity checking (defaults to true if this parameter
   *                               is null).
   * @param allowRefsToExistingNonAdminRows  If true, rows in the staging tables are allowed to reference
   *                                         existing rows in any table, regardless of whether or not the tables
   *                                         are admin tables.
   * @return a ProcessID that can be used to retrieve the status of the job
   */
  @Throws(SOAPException, "")
  public function integrityCheckStagingTableContentsAsBatchProcess(
    clearErrorTable : Boolean,
    populateExclusionTable : Boolean,
    allowRefsToExistingNonAdminRows : Boolean) : ProcessID{
      return new TableImportImpl().integrityCheckStagingTableContentsAsBatchProcess( 
         clearErrorTable, 
         populateExclusionTable,
         allowRefsToExistingNonAdminRows)
    }

  /**
   * Instructs the server to check the integrity of the contents of the staging
   * tables, inserting details about any failures into the error tables. If no integrity check
   * errors are detected, the server will load the source tables (the main application
   * tables) with the contents of the staging tables.
   *
   * @param clearErrorTable        If true, the load error tables will be cleared
   *                               before executing integrity checking (defaults to true if this parameter is null).
   * @param populateExclusionTable If true, populate exclusion table with any newly
   *                               excluded rows before executing integrity checking (defaults to true if this parameter
   *                               is null).
   * @param updateDBStatisticsWithEstimates
   *                               If true, then update the database statistics on any table that will be loaded with
   *                               estimated changes based on the contents of the associated staging table.  When
   *                               loading large amounts of data which will cause a source table to grow significantly, the optimizer could choose
   *                               a bad query plan based on the existing state of the database statistics unless the loader updates the database
   *                               statistics to reflect the expected size of the table after the load has completed.  This
   *                               parameter is only meaningful when running against Oracle.
   * @param allowRefsToExistingNonAdminRows  If true, rows in the staging tables are allowed to reference
   *                                         existing rows in any table, regardless of whether or not the tables
   *                                         are admin tables.
   * @return a TableImportResult object containing load error information and
   *         any raised exception.
   */
  @Throws(SOAPException, "")
  public function integrityCheckStagingTableContentsAndLoadSourceTables(
    clearErrorTable : Boolean, 
    populateExclusionTable : Boolean,
    updateDBStatisticsWithEstimates : Boolean, 
    allowRefsToExistingNonAdminRows : Boolean
    ) : TableImportResult
  {
    return new TableImportImpl().integrityCheckStagingTableContentsAndLoadSourceTables( 
         clearErrorTable, 
         populateExclusionTable,
         updateDBStatisticsWithEstimates,
         allowRefsToExistingNonAdminRows)
  }

  /**
   * Instructs the server to check the integrity of the contents of the Zone staging
   * tables, inserting details about any failures into the error tables. If no integrity check
   * errors are detected, the server will load the Zone source tables (the Zone main application
   * tables) with the contents of the staging tables.
   *
   * @param clearErrorTable        If true, the load error tables will be cleared
   *                               before executing integrity checking (defaults to true if this parameter is null).
   * @param populateExclusionTable If true, populate exclusion table with any newly
   *                               excluded rows before executing integrity checking (defaults to true if this parameter
   *                               is null).
   * @param updateDBStatisticsWithEstimates
   *                               If true, then update the database statistics on any table that will be loaded with
   *                               estimated changes based on the contents of the associated staging table.  When
   *                               loading large amounts of data which will cause a source table to grow significantly, the optimizer could choose
   *                               a bad query plan based on the existing state of the database statistics unless the loader updates the database
   *                               statistics to reflect the expected size of the table after the load has completed.  This
   *                               parameter is only meaningful when running against Oracle.
   * @return a TableImportResult object containing load error information and
   *         any raised exception.
   */
  @Throws(SOAPException, "")
  public function integrityCheckZoneStagingTableContentsAndLoadZoneSourceTables(
    clearErrorTable : Boolean, 
    populateExclusionTable : Boolean,
    updateDBStatisticsWithEstimates : Boolean
    ) : TableImportResult
  {
    return new TableImportImpl().integrityCheckZoneStagingTableContentsAndLoadZoneSourceTables( 
         clearErrorTable, 
         populateExclusionTable,
         updateDBStatisticsWithEstimates)
  }

  /**
   * Instructs the server to check the integrity of the contents of the staging
   * tables, inserting details about any failures into the load error tables. If no integrity check
   * errors are detected, the server will load the source tables (the main application
   * tables) with the contents of the staging tables.  This method does the load asynchronously
   * via the batch process mechanism, and the process ID that is returned can be used to query
   * the status of the load and find out if it succeeded or failed (or is still running).  After
   * completion, the process status will indicate whether or not the load succeeded, and the
   * failedOps field will contain the number of validation errors that occurred (if any).  Note that this batch process
   * can't be terminated.
   *
   * @param clearErrorTable        If true, the load error tables will be cleared
   *                               before executing integrity checking (defaults to true if this parameter is null).
   * @param populateExclusionTable If true, populate exclusion table with any newly
   *                               excluded rows before executing integrity checking (defaults to true if this parameter
   *                               is null).
   * @param updateDBStatisticsWithEstimates
   *                               If true, then update the database statistics on any table that will be loaded with
   *                               estimated changes based on the contents of the associated staging table.  When
   *                               loading large amounts of data which will cause a source table to grow significantly, the optimizer could choose
   *                               a bad query plan based on the existing state of the database statistics unless the loader updates the database
   *                               statistics to reflect the expected size of the table after the load has completed.  This
   *                               parameter is only meaningful when running against Oracle.
   * @param allowRefsToExistingNonAdminRows  If true, rows in the staging tables are allowed to reference
   *                                         existing rows in any table, regardless of whether or not the tables
   *                                         are admin tables.
   * @return a ProcessID that can be used to query the status of the running load
   */
  @Throws(SOAPException, "")
  public function integrityCheckStagingTableContentsAndLoadSourceTablesAsBatchProcess(
    clearErrorTable : Boolean, 
    populateExclusionTable : Boolean,
    updateDBStatisticsWithEstimates : Boolean, 
    allowRefsToExistingNonAdminRows : Boolean) : ProcessID 
  {
    return new TableImportImpl().integrityCheckStagingTableContentsAndLoadSourceTablesAsBatchProcess( 
         clearErrorTable, 
         populateExclusionTable,
         updateDBStatisticsWithEstimates,
         allowRefsToExistingNonAdminRows)
  }

   /**
   * Encrypt columns configured to be encrypted in the staging tables
   *
   * @return The number of staging tables whose columns were encrypted
   */
  @Throws(SOAPException, "")
  public function encryptDataOnStagingTables() : int
  {
    return new TableImportImpl().encryptDataOnStagingTables()
  }

}
