package gw.webservice.pc.pc700.messagingTools

uses gw.api.webservice.messagingTools.Acknowledgement
uses gw.api.webservice.messagingTools.MessageOptionalFields
uses gw.api.webservice.messagingTools.MessageStatisticsData
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.pc.messagingTools.PCMessagingToolsImpl
uses gw.api.webservice.WSRunlevel
uses java.util.Calendar

/**
 * MessagingTools is a remote interface to a set of tools to get messaging
 * statistics and perform operations on messages.
 */

@RpcWebService(WSRunlevel.MULTIUSER)
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.MessagingToolsAPI instead")
class IMessagingToolsAPI {

  /**
   * Purges the message history table of completed messages.
   * Deletes all messages with send time less than supplied before date.
   *
   * @param cutoff Remove messages with send time less than this date.
   */
  @Throws(SOAPException, "")
  function purgeCompletedMessages(cutoff : Calendar) {
    getDelegate().purgeCompletedMessages(cutoff)
  }

  /**
   * Suspends the destination with the specified destination id
   *
   * @param destID The destination id of the destination to suspend
   */
  @Throws(SOAPException, "")
  function suspendDestination(destID : int){
    getDelegate().suspendDestination(destID)
  }

  /**
   * Resumes the destination with the specified destination id
   *
   * @param destID The destination id of the destination to resume
   */
  @Throws(SOAPException, "")
  function resumeDestination(destID : int){
    getDelegate().resumeDestination(destID)
  }

  /**
   * Gets the message id for a message with a specific sender ref id and a specific destination id.
   * If the destination id passed in is -1, then this would find messages from any destination that matches the sender ref id.
   * Returns -1 if no message is found that has given sender ref id and destination id.
   * If there are multiple messages that match, this will return the first one.
   *
   * @param senderRefID The sender ref id for the message we want to get
   * @param destinationID The destination id for the message we want to get. -1 would match all destination ids.
   * @return message id, or -1 if message is not found
   */
  @Throws(SOAPException, "")
  function getMessageId(senderRefID : String, destinationID : int) : long {
    return getDelegate().getMessageId(senderRefID, destinationID)
  }

  /**
   * Acknowledges message
   *
   * @param ack The acknowledgement to report
   * @throws SOAPException If the ack could not be committed to the database
   * @return optional message fields that can be set
   * @deprecated In PC 7.0.3.  MessageOptionalFields are no longer supported.
   * Please use {@link #ackMessage(Acknowledgement)} instead.
   */
  @Throws(SOAPException, "If the ack could not be committed to the database.")
  function acknowledgeMessage(ack : Acknowledgement) : MessageOptionalFields{
    return getDelegate().acknowledgeMessage(ack)
  }

  /**
   * Acknowledges message
   *
   * @param ack The acknowledgement to report
   * @throws SOAPException If the ack could not be committed to the database
   * @return true if the message was found and acked, false otherwise.
   */
  @Throws(SOAPException, "If the ack could not be committed to the database.")
  function ackMessage(ack : Acknowledgement) : boolean {
    return getDelegate().ackMessage(ack)
  }

  /**
   * Retries a single message (retryable error or inflight).
   *
   * @param messageID The message to retry.
   * @return Returns whether or not the message was successfully retried.
   *         If the message with this messageID does not exist, this returns false.
   *         If the message is not a retryable error message or an inflight message, this returns false.
   *         Returning true does not necessarily mean that the retry was successful; it just means that the message was retried.
   */
  @Throws(SOAPException, "")
  function retryMessage(messageID : long) : boolean{
    return getDelegate().retryMessage(messageID)
  }

  /**
   * Skips a single message (error or inflight).
   *
   * @param messageID The message to skip.
   * @return Returns whether the message was successfully skipped.
   *         If the message with this messageId does not exist, this returns false.
   *         If the message is not in an active state(active states are:
   *         pending send, inflight, error, retryable error and pending retry),
   *         this returns false.
   */
  @Throws(SOAPException, "")
  function skipMessage(messageID : long) : boolean {
    return getDelegate().skipMessage(messageID)
  }

  /**
   * Retries all messages in retryable error state for the given destination.
   *
   * @param destID The destination that should be retried.
   * @return Returns true if all messages were successfully retried; false if any errors occurred.
   */
  @Throws(SOAPException, "")
  function retryRetryableErrorMessages(destID : int) : boolean {
    return getDelegate().retryRetryableErrorMessages(destID)
  }

  /**
   * Retries messages in retryable error state for the given destination and error category,
   *
   * @param destID     The destination that should be retried.
   * @param category The error category of the messages that should be retried.
   * @return Returns true if all messages were successfully retried; false if any errors occurred.
   */
  @Throws(SOAPException, "")
  function retryRetryableErrorMessagesForCategory(destID : int, category : ErrorCategory) : boolean {
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
  @Throws(SOAPException, "")
  function retryRetryableErrorMessages(destID : int, retryLimit : int) : boolean {
    return getDelegate().retryRetryableErrorMessages(destID, retryLimit)
  }

  /**
   * Gets all the message statistics of a given destination and safe ordered object.
   *
   * @param destID  The destination to get the message statistics.
   * @param safeOrderedObjectId The public id of the safe ordered object of interest
   * @return the message statistics for the specified destination and safe order object
   */
  @Throws(SOAPException, "")
  function getMessageStatisticsForSafeOrderedObject(destID : int, safeOrderedObjectId : String) : MessageStatisticsData {
    return getDelegate().getMessageStatisticsForSafeOrderedObject(destID, safeOrderedObjectId)
  }

  /**
   * Gets all the message statistics of a given destination.
   *
   * @param destID  The destination to get the message statistics.
   * @return the message statistics for the specified destination
   */
  @Throws(SOAPException, "")
  function getTotalStatistics(destID : int) : MessageStatisticsData {
    return getDelegate().getTotalStatistics(destID)
  }

  /**
   * This will resync all the event messages associated with the given account.
   *
   * @param destID  The destination to get the message statistics.
   * @param accountNumber The account number of the account with all the messages need to be resync.
   */
  function resyncAccount(destID : int, accountNumber : String){
    getDelegate().resyncAccount(destID, accountNumber)
  }

  //----------------------------------------------------------------- private helper methods

  private function getDelegate() : gw.api.webservice.pc.messagingTools.PCMessagingToolsImpl {
    return new PCMessagingToolsImpl()
  }
}
