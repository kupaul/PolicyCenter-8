package gw.solr.utils

uses gw.solr.request.IMessageRequest

uses java.lang.Exception
uses java.lang.Integer
uses java.lang.NumberFormatException
uses java.lang.StringBuilder
uses java.lang.StringIndexOutOfBoundsException
uses java.util.ArrayList
uses gw.api.system.PLLoggerCategory


/**
 *  Holds a partitioned Solr update message, with the document type of
 *  the message separated from the JSON message itself.
 */
@Export
final class PCSolrMessageAggregator {

  public static final var HEADER : String = "MSG:"
  public static final var HEADER_LEN : int = HEADER.length()

  /**
   *  For extracting aggregated Solr messages from the string stored in the
   *  message queue.  See also {@link aggregateMessages(List<IMessageRequest>)} 
   * 
   *  The format is 
   *  <pre>
   *    MSG:${msglen as int}\n
   *    [doctype]\n
   *    [json formatted Solr message]
   *    MSG:${msglen as int}\n
   *    ...
   *  </pre>
   * 
   * @param msg an aggregated message from the message queue
   * @return List<SolrUpdateMessage> list of split solr update messages
   * 
   * @throws Exception if message is badly formed or document type cannot be found.
   */
  static function parse(msg : String) : List<SolrUpdateMessage> {
    var msgs = new ArrayList<SolrUpdateMessage>()
    while(msg.length() > 0) {
      var nextMsgIndex = 0
      if(msg.startsWith(HEADER)) {
        var sepIndex = msg.indexOf(SolrUpdateMessage.SEPARATOR)
        if(sepIndex > 0) {
          var msgLenStr = msg.substring(HEADER_LEN, sepIndex)
          try {
            var subMsgLen = Integer.parseInt(msgLenStr)
            var msgIndex = sepIndex + 1
            nextMsgIndex = msgIndex + subMsgLen
            var subMsg = msg.substring(msgIndex, nextMsgIndex)
            msgs.add(SolrUpdateMessage.parse(subMsg))
          } catch(nfe : NumberFormatException) {
            throw new Exception("Aggregate message header malformed (length '" + msgLenStr + "' is not a valid integer), for Solr update message", nfe)
          } catch(iobe : StringIndexOutOfBoundsException) {
            throw new Exception("Declared length larger than embedded payload in Solr update message", iobe)
          }
        } else {
          throw new Exception("Aggregate message header malformed (missing terminating separator), for Solr update message.")
        }
      } else {
        PLLoggerCategory.SOLR_INDEX.trace("Aggregate message header not found for Solr update message.  Processing as single message.")
        msgs.add(SolrUpdateMessage.parse(msg))
        nextMsgIndex = msg.length()
      }
      msg = msg.substring(nextMsgIndex)
    }
    return msgs
  }
  
  /**
   * For aggregating Solr messages so a single string can be written to the
   * message queue.  See also {@link parse(String)}
   * 
   * @param requestList list of IMessageRequest objects to be stored
   * @return String all messages combined in one String using the aggregate
   *   message format defined by parse()
   */
  static function aggregateMessages(requestList : List<IMessageRequest>) : String {
    var sb = new StringBuilder(1024 * requestList.size())
    for(req in requestList) {
      if(req.hasContent()) {
        var msg = req.toMessage()
        sb.append(HEADER)
        sb.append(Integer.toString(msg.length()))
        sb.append(SolrUpdateMessage.SEPARATOR)
        sb.append(msg)
      }
    }
    return sb.toString()
  }

  private construct() {
  }
  
}
