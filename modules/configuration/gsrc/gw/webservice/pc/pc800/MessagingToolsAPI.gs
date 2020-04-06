package gw.webservice.pc.pc800

uses gw.api.messaging.ExternalDestinationConfig
uses gw.api.messaging.MessageProcessingDirection
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.BatchProcessException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.SOAPSenderException
uses gw.api.webservice.messagingTools.Acknowledgement
uses gw.api.webservice.messagingTools.MessageStatisticsData
uses gw.api.webservice.pc.messagingTools.PCMessagingToolsImpl
uses gw.webservice.SOAPUtil
uses gw.xml.ws.WsiAuthenticationException
uses gw.xml.ws.annotation.WsiAvailability
uses gw.xml.ws.annotation.WsiGenInToolkit
uses gw.xml.ws.annotation.WsiWebService

uses java.lang.IllegalArgumentException
uses java.lang.Integer
uses java.lang.Long
uses java.util.Date
uses gw.xml.ws.annotation.WsiPermissions

/**
 * MessagingTools is a remote interface to a set of tools to get messaging
 * statistics and perform operations on messages.
 */
@WsiWebService("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/MessagingToolsAPI")
@WsiAvailability(MAINTENANCE)
@WsiGenInToolkit
@Export
class MessagingToolsAPI {
        
  /**
   * Purges the message history table of completed messages.
   * Deletes all messages with send time prior to specified cutoff date.
   *
   * @param cutoff Remove messages with send time less than this date.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(RequiredFieldException, "if a required parameter is missing or null")
  @Param("cutoff", "the cutoff Date")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  function purgeCompletedMessages(cutoff : Date) {
    SOAPUtil.require(cutoff, "cutoff");
    getDelegate().purgeCompletedMessages( cutoff )
  }

  /**
   * Suspends the destination with the specified destination id
   *
   * @param destID The destination id of the destination
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Throws(IllegalArgumentException, "if destination id is invalid")
  @Param("destID", "the destination ID")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  function suspendDestinationBothDirections(destID : int){
    checkForInvalidDestinationAndThrowIfNecessary(destID);
    getDelegate().suspendDestination( destID )
  }

  /**
   * Resumes the destination with the specified destination id
   *
   * @param destID The destination id of the destination
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Throws(IllegalArgumentException, "if destination id is invalid")
  @Param("destID", "the destination ID")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  function resumeDestinationBothDirections(destID : int){
    checkForInvalidDestinationAndThrowIfNecessary(destID);
    getDelegate().resumeDestination( destID )
  }

  /**
   * Restart the destination with the given changes to configuration settings; note that this
   * will wait for the destination to stop for the configured stop time.
   *
   * @param destID The destination id of the destination to suspend
   * @param timeToWaitInSec the number of seconds to wait for the shutdown before forcing it
   * @param maxretries max retries
   * @param initialretryinterval initial retry interval
   * @param retrybackoffmultiplier additional retry backoff
   * @param pollinterval how often to poll (from start to start)
   * @param numsenderthreads number of sender threads for multithreaded sends
   * @param chunksize number of messages to read in a chunk
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Throws(IllegalArgumentException, "if destination id is invalid")
  @Param("destID", "the destination ID")
  @Param("timeToWaitInSec", "the number of seconds to wait for the shutdown before forcing it")
  @Param("maxretries", "max retries")
  @Param("initialretryinterval", "initial retry interval")
  @Param("retrybackoffmultiplier", "additional retry backoff")
  @Param("pollinterval", "how often to poll (from start to start)")
  @Param("numsenderthreads", "number of sender threads for multithreaded sends")
  @Param("chunksize", "number of messages to read in a chunk")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  function configureDestination(
        destID : int,
        timeToWaitInSec : int,
       maxretries : Integer,
        initialretryinterval : Long,
        retrybackoffmultiplier : Integer,
        pollinterval : Integer,
        numsenderthreads : Integer,
        chunksize : Integer ) {
    checkForInvalidDestinationAndThrowIfNecessary(destID);
    getDelegate().configureDestination(destID, timeToWaitInSec, maxretries, initialretryinterval, retrybackoffmultiplier, pollinterval, numsenderthreads, chunksize);
  }

  /**
   * Retrieves the configuration of the destination with the given destination ID.
   *
   * @param destID The destination id
   * @return an ExternalDestinationConfig object with the configuration of the specified destination.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Throws(IllegalArgumentException, "if destination id is invalid")
  @Param("destID", "the destination ID")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  @Returns("an ExternalDestinationConfig object with the configuration of the specified destination.")
  function getConfiguration(destID : int) : ExternalDestinationConfig {
    checkForInvalidDestinationAndThrowIfNecessary(destID);
    return getDelegate().getConfiguration(destID);
  }

  /**
   * Gets the message id for a message with a specific sender ref id and a specific destination id.
   * If there are multiple matching messages, this method will throw an exception.
   *
   * @param senderRefID The sender ref id for the desired message
   * @param destID The destination id for the desired message
   * @return message id, or null if message was not found.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Throws(IllegalArgumentException, "if destination id is invalid")
  @Throws(SOAPSenderException, "if there are multiple messages matching the criteria")
  @Throws(RequiredFieldException, "if a required parameter is missing or null")
  @Param("senderRefID", "The sender ref id for the desired message")
  @Param("destID", "The destination id for the desired message")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  @Returns("The message ID of the found message, or null if the message was not found")
  function getMessageIdBySenderRefId(senderRefID: String, destID: int) : java.lang.Long {
    SOAPUtil.require(senderRefID, "senderRefID");
    checkForInvalidDestinationAndThrowIfNecessary(destID);
    return getDelegate().getMessageIdBySenderRefId( senderRefID, destID)
  }

  /**
   * Acknowledges message.
   *
   * @param ack The acknowledgement to report
   * @throws SOAPException If the ack could not be committed to the database
   * @return true if the message was found and successfully acknowledged, false otherwise.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if ack is invalid")
  @Throws(SOAPSenderException, "If caller has not supplied valid acknowledgement")
  @Throws(SOAPException, "If processing was in error")
  @Throws(RequiredFieldException, "if a required parameter is missing or null")
  @Param("ack", "The acknowledgement to report")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  @Returns("true if the message was found and successfully acknowledged, false otherwise.")
  function ackMessage(ack : Acknowledgement) : boolean {
    SOAPUtil.require(ack, "ack");
    checkForInvalidMessageIdAndThrowIfNecessary(ack.MessageID);
    return getDelegate().ackMessage( ack )
  }

  /**
   * Retries a single message (retryable error or inflight).
   *
   * @param messageID The message ID of the message to retry.
   * @return Returns whether or not the message was successfully retried.
   *         If the message with this messageID does not exist, this returns false.
   *         If the message is not a retryable error message or an inflight message, this returns false.
   *         A true return value does not necessarily mean that the retry was successful; it just means that the retry operation was attempted.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if messageID is invalid")
  @Param("messageID", "The ID of the message")
  @WsiPermissions({SystemPermissionType.TC_RETRYMESSAGE})
  @Returns("True if the retry operation was successfully initiated (though retry may not have been successful), false otherwise")
  function retryMessage(messageID : long) : boolean{
    checkForInvalidMessageIdAndThrowIfNecessary(messageID)
    return getDelegate().retryMessage( messageID )
  }

  /**
   * Skips a single message (error or inflight).
   *
   * @param messageID The message ID of the message to skip.
   * @return Returns whether the message was successfully skipped.
   *         If the message with this messageId does not exist, this returns false.
   *         If the message is not in an active state(active states are:
   *         pending send, inflight, error, retryable error and pending retry),
   *         this returns false.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if messageID is invalid")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Param("messageID", "The ID of the message")
  @WsiPermissions({SystemPermissionType.TC_SKIPMESSAGE})
  @Returns("True if the message was successfuly skipped, false otherwise")
  function skipMessage(messageID : long) : boolean {
    checkForInvalidMessageIdAndThrowIfNecessary(messageID)
    return getDelegate().skipMessage( messageID )
  }

  /**
   * Retries all messages in retryable error state for the given destination.
   *
   * @param destID The ID of the destination that should be retried.
   * @return Returns true if all messages were successfully retried; false if any errors occurred.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if destId is invalid")
  @Param("destID", "the destination ID")
  @WsiPermissions({SystemPermissionType.TC_RETRYMESSAGE})
  @Returns("True if all messages were successfully retried; false otherwise")
  function retryRetryableErrorMessages(destID : int) : boolean{
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    return getDelegate().retryRetryableErrorMessages( destID )
  }

  /**
   * Retries messages in retryable error state for the given destination and error category.
   *
   * @param destID     The destination that should be retried.
   * @param category The error category of the messages that should be retried.
   * @return Returns true if all messages were successfully retried; false if any errors occurred.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if the destination is invalid")
  @Param("destID", "the destination ID")
  @Param("category", "the error category of messages to retry")
  @WsiPermissions({SystemPermissionType.TC_RETRYMESSAGE})
  @Returns("True if all messages were successfully retried; false otherwise")
  function retryRetryableErrorMessagesForCategory(destID : int, category : ErrorCategory) : boolean {
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    return getDelegate().retryRetryableErrorMessagesForCategory(destID, category)
  }

  /**
   * Retries messages in retryable error state for the given destination where the message
   * has previously been retried fewer than retryLimit times.  Each message maintains a retry
   * count; attempts to retry the message increment the retry count.  If there are messages
   * whose retry count >= retryLimit, they will not be retried.
   * <p/>
   * Specifying a retryLimit of 0 retries all retryable error messages,
   * and is identical to retryRetryableErrorMessages(int destID).
   *
   * @param destID     The destination that should be retried.
   * @param retryLimit Retry only messages with retryCount < retryLimit; if retryLimit
   *                   is 0, retry all messages.
   * @return Returns true if all messages were successfully retried; false if any errors occurred.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if the destination is invalid or the retryLimit is less than zero")
  @Param("destID", "the destination ID")
  @Param("retryLimit", "the maximum retry count of messages to retry, or zero to retry all messages")
  @WsiPermissions({SystemPermissionType.TC_RETRYMESSAGE})
  @Returns("True if all messages were successfully retried; false otherwise")
  function retryRetryableSomeErrorMessages(destID : int, retryLimit : int) : boolean {
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    if(retryLimit < 0) {
      throw new RequiredFieldException(displaykey.Webservice.Error.MissingRequiredField("retryLimit"))
    }
    return getDelegate().retryRetryableErrorMessages( destID, retryLimit)
  }

  /**
   * Gets all the message statistics of a given destination and safe ordered object.
   *
   * @param destID  The destination to get the message statistics.
   * @param safeOrderedObjectId The public id of the safe ordered object of interest
   * @return the message statistics for the specified destination and safe order object
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if the destination is invalid")
  @Throws(RequiredFieldException, "if a required parameter is missing or null")
  @Param("destID", "the destination ID")
  @Param("safeOrderedObjectId", "The public id of the safe ordered object of interest")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  @Returns("the message statistics for the specified destination and safe order object")
  function getMessageStatisticsForSafeOrderedObject(destID : int, safeOrderedObjectId : String) : MessageStatisticsData {
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    SOAPUtil.require(safeOrderedObjectId, "safeOrderedObjectId");
    return getDelegate().getMessageStatisticsForSafeOrderedObject( destID, safeOrderedObjectId )
  }

  /**
   * Gets all the message statistics of a given destination.
   *
   * @param destID  The destination for which to obtain message statistics.
   * @return the message statistics for the specified destination
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if the destination is invalid")
  @Param("destID", "the destination ID")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  @Returns("the message statistics for the specified destination")
  function getTotalStatistics(destID : int) : MessageStatisticsData {
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    return getDelegate().getTotalStatistics(destID)
  }

  /**
   * Suspend inbound or outbound processing for the destination, depending on the specified direction.
   *
   * When outbound processing is suspended, the request and transport
   * plugins are suspended, along with message sending.
   * When inbound processing is suspended, the reply plugin is suspended
   *
   * @param destID  the destination ID of the destination to suspend
   * @param direction the direction to suspend (inbound, outbound or both)
   * @return True if processing was previously active and is now suspended; false if processing was already suspended.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if the destination is invalid")
  @Throws(RequiredFieldException, "if a required parameter is missing or null")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Throws(SOAPException, "If processing was in error")
  @Param("destID", "the destination ID of the destination to suspend")
  @Param("direction", "the direction to suspend (inbound, outbound or both)")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  @Returns("True if destination state was changed from active to suspended; false otherwise")
  function suspendDestination(destID : int, direction :MessageProcessingDirection) : boolean {
    SOAPUtil.require(direction, "direction");
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    return getDelegate().suspendDestination( destID, direction);
  }

  /**
   * Resume outbound or inbound message processing, depending on the specified direction.
   *
   * When outbound processing is resumed, this resumes the
   * request and transport plugins, and resumes message sending.
   * When inbound processing is resumed, the reply plugin is resumed
   *
   * @param destID  the destination ID of the destination to suspend
   * @param direction the direction to resume (inbound, outbound or both)
   * @return True if processing was previously suspended and is now resumed; false if processing was already resumed.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if the destination is invalid")
  @Throws(RequiredFieldException, "if a required parameter is missing or null")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Throws(SOAPSenderException, "If caller has not supplied valid direction")
  @Throws(SOAPException, "If processing was in error")
  @Param("destID", "the destination ID of the destination to suspend")
  @Param("direction", "the direction to resume (inbound, outbound or both)")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  @Returns("True if destination state was changed from suspended to active; false otherwise")
  function resumeDestination(destID: int, direction : MessageProcessingDirection): boolean {
    SOAPUtil.require(direction, "direction")
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    return getDelegate().resumeDestination( destID, direction);
  }

  /**
   * Checks if a specified destination and direction are suspended.
   *
   * @param destID  the destination ID of the destination to check
   * @param direction the direction to check (inbound, outbound or both)
   * @return True if processing this destination/direction is suspended; false otherwise.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if the destination is invalid")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Throws(RequiredFieldException, "if a required parameter is missing or null")
  @Throws(SOAPSenderException, "If caller has not supplied valid direction")
  @Param("destID", "the destination ID of the destination to check")
  @Param("direction", "the direction to check (inbound, outbound or both)")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  @Returns("True if processing this destination/direction is suspended; false otherwise.")
  function isSuspended(destID: int, direction : MessageProcessingDirection): boolean {
    SOAPUtil.require(direction, "direction");
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    return getDelegate().isSuspended( destID, direction);
  }

  /**
   * Checks if a specified destination and direction are resumed/active.
   *
   * @param destID  the destination ID of the destination to check
   * @param direction the direction to check (inbound, outbound or both)
   * @return true if the processing for the specified destination and direction is resumed.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if the destination is invalid")
  @Throws(RequiredFieldException, "if a required parameter is missing or null")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Param("destID", "the destination ID of the destination to check")
  @Param("direction", "the direction to check (inbound, outbound or both)")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  @Returns("True if processing this destination/direction is resumed; false otherwise.")
  function isResumed(destID: int, direction : MessageProcessingDirection): boolean {
    SOAPUtil.require(direction, "direction");
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    return getDelegate().isResumed(destID, direction);
  }

  /**
   * Returns status of the specified Destination.
   *
   * @param   destID  the destination ID of the destination to check
   * @return  A String containing the status of the given destination.
   */
  @Throws(WsiAuthenticationException, "if there are permission/authentication issues")
  @Throws(IllegalArgumentException, "if the destination is invalid")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Param("destID", "the destination ID of the destination to check")
  @WsiPermissions({SystemPermissionType.TC_EVENTMESSAGEVIEW})
  @Returns("A String containing the status of the given destination.")
  public function getDestinationStatus(destID : int) : String {
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    var d = gw.api.admin.DestinationMessageStatisticsUtil.getMessageStatistics()
    var x = d?.firstWhere( \ id -> id.DestinationId == destID)
    return x?.Status
  }

  /**
   * Resync all the event messages associated with the specified account and destination.
   * 
   * @param destID  The destination to resync
   * @param accountNumber The account number of the account for which messages need to be resynced.
   */
  @Throws(BadIdentifierException, "on invalid account number")
  @Throws(IllegalArgumentException, "if the destination is invalid")
  @Throws(BatchProcessException, "if there are problems communicating with the batch server")
  @Param("destID", "the destination ID of the destination to check")
  @Param("accountNumber", "The account number of the account for which messages need to be resynced.")
  @WsiPermissions({SystemPermissionType.TC_RESYNCMESSAGE})
  function resyncAccount(destID : int, accountNumber : String){
    checkForInvalidDestinationAndThrowIfNecessary(destID)
    getDelegate().resyncAccount(destID, accountNumber)
  }

  //----------------------------------------------------------------- private helper methods
  @Throws(IllegalArgumentException, "If the specified destination ID is invalid")
  private function checkForInvalidDestinationAndThrowIfNecessary(destinationId: int) {
    if (destinationId <= 0) {
      throw new IllegalArgumentException(displaykey.Webservice.Messaging.DestinationIdInvalid(destinationId))
    }
    getDelegate().validateDestination(destinationId)
  }

  @Throws(IllegalArgumentException, "If the specified message ID is invalid")
  private function checkForInvalidMessageIdAndThrowIfNecessary(messageId: long) {
    if (messageId <= 0) {
      throw new IllegalArgumentException(displaykey.Webservice.Messaging.MessageIdInvalid(messageId))
    }
  }
  
  private function getDelegate() : gw.api.webservice.pc.messagingTools.PCMessagingToolsImpl {
    return new PCMessagingToolsImpl()
  }
}
