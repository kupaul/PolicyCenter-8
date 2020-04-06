package gw.webservice.pc.pc800

uses gw.api.tools.ProcessID
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.maintenanceTools.ProcessStatus
uses gw.api.webservice.maintenanceTools.WQueueStatus
uses gw.api.webservice.maintenanceTools.WorkQueueConfig
uses gw.api.webservice.pc.maintenanceTools.PCMaintenanceToolsImpl
uses gw.webservice.SOAPUtil
uses gw.xml.ws.WsiAuthenticationException
uses gw.xml.ws.annotation.WsiAvailability
uses gw.xml.ws.annotation.WsiGenInToolkit
uses gw.xml.ws.annotation.WsiWebService
uses gw.xml.ws.annotation.WsiPermissions

uses java.lang.IllegalArgumentException
uses java.lang.Long
uses java.util.Date

/**
 * An API used for managing the application. This is distinct from
 * ISystemToolsAPI which is concerned with managing the application platform. 
 * 
 */
@WsiWebService("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/MaintenanceToolsAPI")
@WsiAvailability(MAINTENANCE)
@WsiGenInToolkit
@Export
class MaintenanceToolsAPI {
  
  /**
   * Note: All methods are overridden to ensure that the javadoc and exceptions for this web service are properly generated.
   */
  
  /**
   * Return the set of valid batch process names
   *
   * @return String array containing the set of valid batch process names
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @WsiPermissions({SystemPermissionType.TC_TOOLSBATCHPROCESSVIEW})
  @Returns("the set of valid batch process names")
  public function getValidBatchProcessNames() : String[] {
    return getDelegate().ValidBatchProcessNames as String[];
  }

   /**
   * Return whether a given batch process name is valid
   *
   * @param processName the batch process name to check for validity.
   * @return true if supplied processName is valid
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("processName", "the batch process name to check for validity.")
  @WsiPermissions({SystemPermissionType.TC_TOOLSBATCHPROCESSVIEW})
  @Returns("Whether a given batch process name is valid")
  function isBatchProcessNameValid(processName : String) : boolean {
    SOAPUtil.require(processName, "processName");
    return getDelegate().isBatchProcessNameValid(processName);
  }

  /**
   * Starts the given batch process.  If the process is already running on the server,
   * an exception will be thrown.
   *
   * @param processName the name of the batch process to start
   * @return the ProcessID of the process that was started
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no process exists with the given process name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("processName", "name of the batch process to start")
  @WsiPermissions({SystemPermissionType.TC_TOOLSBATCHPROCESSEDIT})
  @Returns("the ProcessID of the started process")
  function startBatchProcess(processName : String) : ProcessID {
    SOAPUtil.require(processName, "processName");
    return getDelegate().startBatchProcess( processName )
  }
  /**
   * Starts the ValidateArchiveLinks for all TestGraphRoots.
   *
   * @return the ProcessID of the process that was started
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @WsiPermissions({SystemPermissionType.TC_TOOLSBATCHPROCESSEDIT})
  @Returns("the ProcessID of the started process")
  function startValidateArchiveLinksBatchProcessAll() : ProcessID {
    return getDelegate().startBatchProcess( "ValidateArchiveLinks", {"all"} )
  }

  /**
   * Starts the ValidateArchiveLinks for all TestGraphRoots changed within the date range.
   *
   * @param startTime Beginning of date range for validation
   * @param endTime End of date range for validation
   * @return the ProcessID of the process that was started
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("startTime", "Beginning of date range for validation")
  @Param("endTime", "End of date range for validation")
  @WsiPermissions({SystemPermissionType.TC_TOOLSBATCHPROCESSEDIT})
  @Returns("the ProcessID of the started process")
  function startValidateArchiveLinksBatchProcessByDateRange(startTime : Date, endTime : Date) : ProcessID {
    SOAPUtil.require(startTime, "startTime");
    SOAPUtil.require(endTime, "endTime");
    return getDelegate().startBatchProcess( "ValidateArchiveLinks", { new Date[] { startTime, endTime} })
  }

  /**
   * Starts the ValidateArchiveLinks for the TestGraphRoots requested.
   *
   * @param ids the IDs of the TestGraphRoots for which to start the ValidateArchiveLinks process.
   * @return the ProcessID of the process that was started
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("ids", "the IDs of the TestGraphRoots for which to start the ValidateArchiveLinks process.")
  @WsiPermissions({SystemPermissionType.TC_TOOLSBATCHPROCESSEDIT})
  @Returns("the ProcessID of the started process")
  function startValidateArchiveLinksBatchProcessByIds(ids : Long[]) : ProcessID {
    SOAPUtil.require(ids, "ids");
    return getDelegate().startBatchProcess( "ValidateArchiveLinks", { ids } )
  }

  /**
   * Requests termination of the given batch process, if it's currently running.
   *
   * This method does not wait for the batch process to actually terminate
   *
   * @param processName the name of the batch process for which to request termination
   * @return true if the request was successful, false if the process could not be terminated
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("processName", "the name of the batch process for which to request termination")
  @WsiPermissions({SystemPermissionType.TC_TOOLSBATCHPROCESSEDIT})
  @Returns("true if the request was successful, false if the process could not be terminated")
  function requestTerminationOfBatchProcessByName(processName : String) : boolean {
    SOAPUtil.require(processName, "processName");
    return getDelegate().requestTerminationOfBatchProcess( processName )
  }

  /**
   * Requests termination of the given batch process, if it's currently running. Note that it's possible that
   * this particular invocation could have finished and another invocation of the same process
   * begun, in which case this won't request the termination of the current invocation.
   *
   * This method does not wait for the batch process to actually terminate
   *
   * @param pid the process ID of the process for which to request termination
   * @return true if the request was successful, false if the process could not be terminated
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "Invalid processID")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("processName", "the ID of the batch process for which to request termination")
  @WsiPermissions({SystemPermissionType.TC_TOOLSBATCHPROCESSEDIT})
  @Returns("true if the request was successful, false if the process could not be terminated")
  function requestTerminationOfBatchProcessByID(pid : ProcessID) : boolean {
    if (pid == null || pid.Pid <= 0) {
      throw new IllegalArgumentException("Invalid processID " + pid)
    }
    return getDelegate().requestTerminationOfBatchProcess( pid )
  }

  /**
   * Gets the status of the given batch process, indicating whether or not the process is running and,
   * if so, its current progress.
   *
   * @param processName the name of the process to retrieve the status of
   * @return the status of that particular process
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no process exists with the given process name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("processName", "the name of the process for which status should be retrieved")
  @WsiPermissions({SystemPermissionType.TC_TOOLSBATCHPROCESSVIEW})
  @Returns("the status of the specified process")
  function batchProcessStatusByName(processName : String) : ProcessStatus {
    SOAPUtil.require(processName, "processName");
    return getDelegate().batchProcessStatusByName( processName )
  }

  /**
   * Gets the status of a particular batch process invocation.  If that invocation is still running,
   * the status will indicate as much, and only the startDate and opsCompleted fields will be filled in.
   * Otherwise the returned object will contain information about
   * the completed run (see ProcessStatus for information about all the fields returned).
   *
   * @param pid the process ID to retrieve the status of
   * @return the status of that particular process invocation
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no process exists with the given process id or invalid ProcessID.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("pid", "the process ID to retrieve the status of")
  @WsiPermissions({SystemPermissionType.TC_TOOLSBATCHPROCESSVIEW})
  @Returns("the status of that particular process invocation")
  function batchProcessStatusByID(pid : ProcessID) : ProcessStatus {
    SOAPUtil.require(pid, "pid");
    if (pid == null || pid.Pid <= 0) {
      throw new IllegalArgumentException("Invalid processID " + pid)
    }
    return getDelegate().batchProcessStatusByID( pid )
  }

  /**
   * Return the date when the current statistics were calculated.
   *
   * @return date of the when the current statistics were calculated
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @WsiPermissions({SystemPermissionType.TC_TOOLSINFOVIEW})
  @Returns("date of the when the current statistics were calculated")
  public function whenStatsCalculated() : Date {
    return getDelegate().whenStatsCalculated().Time
  }

  /**
   * Get the current configuration of distributed workers for the
   * specified work queue.
   * @param queueName Name of the queue to query
   * @return A WorkQueueConfig instance containing the current settings
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no work queue exists with the given name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("queueName", "Name of the queue to query")
  @WsiPermissions({SystemPermissionType.TC_TOOLSWORKQUEUEVIEW})
  @Returns("a WorkQueueConfig instance containing the current settings")
  function getWorkQueueConfig(queueName : String) : WorkQueueConfig {
    SOAPUtil.require(queueName, "queueName");
    return getDelegate().getWorkQueueConfig( queueName )
  }

  /**
   * Sets the configuration for distributed workers for the
   * specified work queue.  Any currently running worker
   * instances will be stopped after the current workitem in process
   * is completed.  New worker instances as specified by the passed
   * in config will be created and started.  Note that the
   * changes made here are temporary; if the server is restarted,
   * the initial values from config.xml will be used when creating
   * and starting workers.
   * @param queueName Name of the queue to modify
   * @param config The configuration to establish.
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no work queue exists with the given name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("queueName", "Name of the queue to modify")
  @Param("config", "The configuration to establish")
  @WsiPermissions({SystemPermissionType.TC_TOOLSWORKQUEUEEDIT})
  function setWorkQueueConfig(queueName : String, config : WorkQueueConfig){
    SOAPUtil.require(queueName, "queueName");
    SOAPUtil.require(config, "config");
    getDelegate().setWorkQueueConfig( queueName, config )
  }

  /**
   * Returns the list of work queue names for this product.
   * These names may be used in {@link #getWorkQueueConfig}
   * and {@link #setWorkQueueConfig}.
   *
   * @return an array of Strings containing the names of the work queues for PolicyCenter.
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @WsiPermissions({SystemPermissionType.TC_TOOLSWORKQUEUEVIEW})
  @Returns("an array of Strings containing the names of the work queues for PolicyCenter.")
  function getWorkQueueNames() : String[]{
    return getDelegate().getWorkQueueNames()
  }

  /**
   * Wakes up all workers for the specified queue across the cluster.
   * Workers will check for workitems and will continue
   * processing any found until the workitem table for the
   * queue is empty.
   *
   * @param queueName Name of the queue for which workers should be notified
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no work queue exists with the given name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("queueName", "Name of the queue for which workers should be notified")
  @WsiPermissions({SystemPermissionType.TC_TOOLSWORKQUEUEEDIT})
  function notifyQueueWorkers(queueName : String){
    SOAPUtil.require(queueName, "queueName");
    getDelegate().notifyQueueWorkers( queueName )
  }

  /**
   * This will stop the specified work queue.
   *
   * @param queueName Name of the queue for which workers should be stopped
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no work queue exists with the given name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("queueName", "Name of the queue for which workers should be stopped")
  @WsiPermissions({SystemPermissionType.TC_TOOLSWORKQUEUEEDIT})
  function stopWorkQueueWorkers(queueName : String) {
    SOAPUtil.require(queueName, "queueName");
    getDelegate().stopWorkQueueWorkers(queueName)
  }

  /**
   * This will start the workqueue workers
   *
   * @param queueName Name of the queue for which workers should be started
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no work queue exists with the given name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("queueName", "Name of the queue for which workers should be started")
  @WsiPermissions({SystemPermissionType.TC_TOOLSWORKQUEUEEDIT})
  function startWorkQueueWorkers(queueName : String) {
    SOAPUtil.require(queueName, "queueName");
    getDelegate().startWorkQueueWorkers(queueName)
  }

  /**
   * Retrieves the status of active executors for that particular queue. Each executor contains information
   * about last 25 workers ran by each executor.
   *
   * @param queueName name of the queue for which status should be returned
   * @return The status of the queue as a WQueueStatus object
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no work queue exists with the given name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("queueName", "name of the queue for which status should be returned")
  @WsiPermissions({SystemPermissionType.TC_TOOLSWORKQUEUEVIEW})
  @Returns("The status of the queue as a WQueueStatus object")
  function getWQueueStatus(queueName : String) : WQueueStatus {    
    SOAPUtil.require(queueName, "queueName");
    return getDelegate().getWQueueStatus( queueName )
  }

  /**
   * Retrieves the number of active work items for a queue
   *
   * @param queueName name of the queue for which work items should be counted.
   * @return The number of active work items for specified queue as an integer.
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no work queue exists with the given name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("queueName", "name of the queue for which status should be returned")
  @WsiPermissions({SystemPermissionType.TC_TOOLSWORKQUEUEVIEW})
  @Returns("The number of active work items for specified queue as an integer.")
  function getNumActiveWorkItems(queueName : String) : int {
    SOAPUtil.require(queueName, "queueName");
    return getDelegate().getNumActiveWorkItems( queueName )
  }

  /**
   * Wait on the active work items for a queue
   *
   * @param queueName name of the queue for which to wait
   * @return true if the queue is now empty
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no work queue exists with the given name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("queueName", "name of the queue for which to wait")
  @WsiPermissions({SystemPermissionType.TC_TOOLSWORKQUEUEEDIT})
  @Returns("true if the queue is now empty")
  function waitOnActiveWorkItems(queueName : String) : boolean {
    SOAPUtil.require(queueName, "queueName");
    return getDelegate().waitOnActiveWorkItems( queueName, 60, 200)
  }

  /**
   * whether the plugin is started.
   *
   * @param pluginName the name of the plugin
   * @return true if the given plugin is started
   */
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(IllegalArgumentException, "If no plugin exists with the given name.")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("pluginName", "name of the plugin")
  @WsiPermissions({SystemPermissionType.TC_TOOLSPLUGINVIEW})
  @Returns("true if the given plugin is started")
  function isPluginStarted(pluginName : String) : boolean {
    SOAPUtil.require(pluginName, "pluginName");
    return getDelegate().isPluginStarted(pluginName)
  }

  /**
   * Starts the given startable plugin.
   *
   * @param pluginName the name of the plugin to start
   */
  @Throws(IllegalArgumentException,"if invalid plugin name")
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("pluginName", "the name of the plugin to start")
  @WsiPermissions({SystemPermissionType.TC_TOOLSPLUGINEDIT})
  function startPlugin(pluginName : String) {
    SOAPUtil.require(pluginName, "pluginName");
    getDelegate().startPlugin(pluginName)
  }

   /**
    * Stop the given startable plugin.
    *
    * @param pluginName the name of the plugin to stop.
    */
  @Throws(IllegalArgumentException,"if invalid plugin name")
  @Throws(WsiAuthenticationException,"On permission or authentication errors")
  @Throws(RequiredFieldException, "If required field is missing")
  @Param("pluginName", "The name of the plugin to stop")
  @WsiPermissions({SystemPermissionType.TC_TOOLSPLUGINEDIT})
  function stopPlugin(pluginName : String) {
    SOAPUtil.require(pluginName, "pluginName");
    getDelegate().stopPlugin(pluginName)
  }

  //----------------------------------------------------------------- private helper

  private function getDelegate() : PCMaintenanceToolsImpl {
    return new PCMaintenanceToolsImpl()
  }
}
