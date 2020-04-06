package gw.webservice.pc.pc700.maintenanceTools

uses gw.api.tools.ProcessID
uses gw.api.webservice.WSRunlevel
uses gw.api.webservice.exception.PermissionException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.SOAPSenderException
uses gw.api.webservice.exception.SOAPServerException
uses gw.api.webservice.maintenanceTools.ProcessStatus
uses gw.api.webservice.maintenanceTools.WorkQueueConfig
uses gw.api.webservice.maintenanceTools.WorkQueueStatus
uses gw.api.webservice.maintenanceTools.WQueueStatus
uses gw.api.webservice.pc.maintenanceTools.PCMaintenanceToolsImpl
uses gw.api.webservice.pc.maintenanceTools.IPCMaintenanceToolsAPI
uses java.lang.IllegalArgumentException
uses java.util.Calendar

/**
 * An API used for managing the application. This is distinct from
 * {@link ISystemToolsAPI} which is concerned with managing the application platform.
 */

@RpcWebService(WSRunlevel.NODAEMONS)
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.MaintenanceToolsAPI instead")
class IMaintenanceToolsAPI {

  /**
   * Note: All methods are overriden to ensure that the javadoc and execptions for this web service are properly generated.
   */

  /**
   * Return the set of valid batch process names
   *
   * @return String[]
   */
  @Throws(SOAPServerException, "if there is an exception thrown during the processing")
  public function getValidBatchProcessNames() : String[] {
    return getMaintenanceImpl().ValidBatchProcessNames as String[]
  }


  /**
   * Return whether a given batch process name is valid
   *
   * @return boolean
   */
  @Throws(SOAPServerException, "if there is an exception thrown during the processing")
  function isBatchProcessNameValid(processName : String) : boolean {
    return getMaintenanceImpl().isBatchProcessNameValid(processName);
  }

  /**
   * Starts the given batch process.  If the process is already running on the server,
   * an exception will be thrown.
   *
   * @param processName the name of the batch process to start
   * @return the ProcessID of the process that was started
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  @Throws(IllegalArgumentException, "If no process exists with the given process name.")
  function startBatchProcess(processName : String) : ProcessID {
    return getMaintenanceImpl().startBatchProcess( processName )
  }

  /**
   * Return the date when the current statistics were calculated.
   *
   * @return date of the when the current statistics were calculated
   */
  @Throws(SOAPException, "if there is an exception thrown during the processing")
  public function whenStatsCalculated() : Calendar {
    return getMaintenanceImpl().whenStatsCalculated()
  }

  /**
   * Requests termination of the given batch process, if it's currently running.
   *
   * This method does not wait for the batch process to actually terminate
   *
   * @param processName the name of the batch process for which to request termination
   * @return <code>true</code> if the request was successful, <code>false</code> if the process could not be terminated
   * @deprecated (4.0) Use {@link #requestTerminationOfBatchProcessByName(String)} instead
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function terminateBatchProcessByName(processName : String) : boolean {
    return getMaintenanceImpl().requestTerminationOfBatchProcess( processName )
  }

  /**
   * Requests termination of the given batch process, if it's currently running. Note that it's possible that
   * this particular invocation could have finished and another invocation of the same process
   * begun, in which case this won't request the termination of the current invocation.
   *
   * This method does not wait for the batch process to actually terminate
   *
   * @param pid the process ID of the process for which to request termination
   * @return <code>true</code> if the request was successful, <code>false</code> if the process could not be terminated
   * @deprecated (4.0) Use {@link #requestTerminationOfBatchProcessByID(ProcessID)} instead
   */
  @Throws(PermissionException, "")
  @Throws(SOAPSenderException, "")
  @Throws(SOAPServerException, "")
  function terminateBatchProcessByID(pid : ProcessID) : boolean {
    return getMaintenanceImpl().requestTerminationOfBatchProcess( pid )
  }

  /**
   * Requests termination of the given batch process, if it's currently running.
   *
   * This method does not wait for the batch process to actually terminate
   *
   * @param processName the name of the batch process for which to request termination
   * @return <code>true</code> if the request was successful, <code>false</code> if the process could not be terminated
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function requestTerminationOfBatchProcessByName(processName : String) : boolean {
    return getMaintenanceImpl().requestTerminationOfBatchProcess( processName )
  }

  /**
   * Requests termination of the given batch process, if it's currently running. Note that it's possible that
   * this particular invocation could have finished and another invocation of the same process
   * begun, in which case this won't request the termination of the current invocation.
   *
   * This method does not wait for the batch process to actually terminate
   *
   * @param pid the process ID of the process for which to request termination
   * @return <code>true</code> if the request was successful, <code>false</code> if the process could not be terminated
   */
  @Throws(PermissionException, "")
  @Throws(SOAPSenderException, "")
  @Throws(SOAPServerException, "")
  function requestTerminationOfBatchProcessByID(pid : ProcessID) : boolean {
    return getMaintenanceImpl().requestTerminationOfBatchProcess( pid )
  }

  /**
   * Gets the status of the given batch process, indicating whether or not the process is running and,
   * if so, its current progress.
   *
   * @param processName the name of the process to retrieve the status of
   * @return the status of that particular process
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function batchProcessStatusByName(processName : String) : ProcessStatus {
    return getMaintenanceImpl().batchProcessStatusByName( processName )
  }

  /**
   * Gets the status of a particular batch process invocation.  If that invocation is still running,
   * the status will indicate as much, and only the startDate and opsCompleted fields will be filled in.
   * Otherwise the returned object will contain information about
   * the completed run (see {@link com.guidewire.pc.webservices.entity.ProcessStatus} for information about all the fields returned).
   *
   * @param pid the process ID to retrieve the status of
   * @return the status of that particular process invocation
   */
  @Throws(PermissionException, "")
  @Throws(SOAPSenderException, "")
  @Throws(SOAPServerException, "")
  function batchProcessStatusByID(pid : ProcessID) : ProcessStatus {
    return getMaintenanceImpl().batchProcessStatusByID( pid )
  }

  /**
   * Get the current configuration of distributed workers for the
   * specified work queue.
   * @param queueName Name of the queue to query
   * @return A {@link com.guidewire.pc.webservices.entity.WorkQueueConfig} instance containing the current settings
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function getWorkQueueConfig(queueName : String) : WorkQueueConfig {
    return getMaintenanceImpl().getWorkQueueConfig( queueName )
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
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function setWorkQueueConfig(queueName : String, config : WorkQueueConfig){
    getMaintenanceImpl().setWorkQueueConfig( queueName, config )
  }

  /**
   * Returns the list of work queue names for this product.
   * These names may be used in {@link #getWorkQueueConfig}
   * and {@link #setWorkQueueConfig}.
   * @return String[] Work queue names
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function getWorkQueueNames() : String[]{
    return getMaintenanceImpl().getWorkQueueNames()
  }

  /**
   * This will stop the specified ied work queue.
   * @param queueName Name of the queue
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function stopWorkQueueWorkers(queueName : String) {
    getMaintenanceImpl().stopWorkQueueWorkers(queueName)
  }

  /**
   * This will start the workqueue wokers
   * @param queueName Name of the queue
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function startWorkQueueWorkers(queueName : String) {
    getMaintenanceImpl().startWorkQueueWorkers(queueName)
  }

  /**
   * Wakes up all workers for the specified queue across the cluster.
   * Workers will check for workitems and will continue
   * processing any found until the workitem table for the
   * queue is empty.
   * @param queueName Name of the queue for which to notify workers
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  @Throws(IllegalArgumentException, "If an invalid queue name is provided.")
  function notifyQueueWorkers(queueName : String){
    getMaintenanceImpl().notifyQueueWorkers( queueName )
  }

  /**
   * Retrieves the status of active executors for that particular queue. Each executor contains information
   * about last 25 workers ran by each executor.
   *
   * @param queueName name of the queue
   * @return The status of the queue
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function getWQueueStatus(queueName : String) : WQueueStatus {
    return getMaintenanceImpl().getWQueueStatus( queueName )
  }

  /**
   * Retrieves the worker status with information about work queues across a cluster.
   *
   * @param queueName name of the queue
   * @return The status of the queue
   *
   * @deprecated in PC 8.0.  Use the method {@link #getWQueueStatus(String)} instead.  It returns more detailed and accurate
   * information about a worker queue executors and workers.
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function getWorkQueueStatus(queueName : String) : WorkQueueStatus {
    return getMaintenanceImpl().getWorkQueueStatus( queueName )
  }

  /**
   * Retrieves the number of active work items for a queue
   *
   * @param queueName name of the queue
   * @return The number of active work items for a queue
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function getNumActiveWorkItems(queueName : String) : int {
    return getMaintenanceImpl().getNumActiveWorkItems( queueName )
  }

  /**
   * Wait on the active work items for a queue
   *
   * @param queueName name of the queue
   * @return <code>true</code> if the queue is now empty
   */
  @Throws(PermissionException, "")
  @Throws(SOAPServerException, "")
  function waitOnActiveWorkItems(queueName : String) : boolean {
    return getMaintenanceImpl().waitOnActiveWorkItems( queueName, 60, 200)
  }

  /**
   * whether the plugin is started.
   *
   * @param pluginName the name of the plugin to start
   */
  @Throws(IllegalArgumentException,"if invalid plugin name")
  @Throws(PermissionException,"if user does not have toolspluginview")
  function isPluginStarted(pluginName : String) : boolean {
    return getMaintenanceImpl().isPluginStarted(pluginName)
  }

  /**
   * Starts the given startable plugin.
   *
   * @param pluginName the name of the plugin to start
   */
  @Throws(IllegalArgumentException,"if invalid plugin name")
  @Throws(PermissionException,"if user does not have toolspluginedit")
  function startPlugin(pluginName : String) {
    getMaintenanceImpl().startPlugin(pluginName)
  }

   /**
    * Stop the given startable plugin.
    *
    * @param pluginName the name of the plugin
    */
  @Throws(IllegalArgumentException,"if invalid plugin name")
  @Throws(PermissionException,"if user does not have toolspluginedit")
  function stopPlugin(pluginName : String) {
    getMaintenanceImpl().stopPlugin(pluginName)
  }

  //----------------------------------------------------------------- private helper

  private function getMaintenanceImpl() : IPCMaintenanceToolsAPI {
    return new PCMaintenanceToolsImpl()
  }

}
