package gw.plugin.document.impl

uses gw.api.util.DateUtil
uses gw.api.util.RetryableException
uses gw.plugin.document.IDocumentContentSource
uses gw.plugin.document.IDocumentMetadataSource
uses gw.plugin.InitializablePlugin
uses gw.plugin.messaging.MessageTransport
uses java.lang.Integer
uses java.util.Map
uses gw.plugin.Plugins
uses java.lang.Exception
uses gw.api.system.PCLoggerCategory

@Export
class DocumentStoreTransport implements MessageTransport, InitializablePlugin
{
  static var MAX_RETRIES_PARAM = "MaxRetries"
  static var MAX_RETRIES_DEFAULT = 5
  static var RETRY_MINUTES_PARAM = "RetryMinutes"
  static var RETRY_MINUTES_DEFAULT = 1 
  var _maxRetries : int
  var _retryMinutes : int
  var _destId : int
  
  construct()  {
  }

  override function send( msg: Message, transformedPayload: String ) : void  {
    var document = msg.getMessageRoot() as Document
    PCLoggerCategory.DOCUMENT.info("DST-Sending message id=${msg.ID} for Document:${document.ID} from '${document.PendingDocUID}'")
    var idcs = Plugins.get( IDocumentContentSource )
    var idms = Plugins.get( IDocumentMetadataSource )

    try {
      if (idcs.addDocument( null, document ) and idms != null) {
        idms.saveDocument( document )
      }
      msg.reportAck()
    } 
    catch (e : RetryableException) {
      document = document.Bundle.loadBean( document.ID ) as Document
      if (msg.RetryCount < _maxRetries) {
        var retryTime = e.SuggestedRetryTime
        if (retryTime == null) {
          retryTime = DateUtil.currentDate().addMinutes( _retryMinutes )
        }
        PCLoggerCategory.DOCUMENT.info("Retry requested for Document:${document.ID} '${document.Name}' will retry again at ${retryTime.format( "HH:mn" )}", e)
        msg.reportError(retryTime)
      } else {
        PCLoggerCategory.DOCUMENT.info("Retry requested for Document:${document.ID} '${document.Name}' exceeding maxRetry will discard.", e)
        document.addEvent( "FailedDocumentStore" )
        msg.reportNonRetryableError()
      }
    }
    catch (e : Exception) {
      document = document.Bundle.loadBean( document.ID ) as Document
      PCLoggerCategory.DOCUMENT.info("Error processing Document:${document.ID} '${document.Name}'", e)
        document.addEvent( "FailedDocumentStore" )
      msg.reportNonRetryableError()
    }
  }

  override function resume() : void {
    // since communication is through IDCS & IDMS, there is nothing to do here
  }


  override function shutdown() : void {
    // since communication is through IDCS & IDMS, there is nothing to do here
  }

  override function suspend() : void {
    // since communication is through IDCS & IDMS, there is nothing to do here
  }

   override function setDestinationID( destId : int ) : void {
    _destId = destId
  }

 override function setParameters( params: Map<Object,Object> ) : void {
    _maxRetries = parseAndSetInt(params, MAX_RETRIES_PARAM, MAX_RETRIES_DEFAULT)
    _retryMinutes = parseAndSetInt(params, RETRY_MINUTES_PARAM, RETRY_MINUTES_DEFAULT)
    PCLoggerCategory.DOCUMENT.info("DST-starting with maxRetries=${_maxRetries}, retryMinutes=${_retryMinutes}")
  }

  private function parseAndSetInt(params : Map<Object,Object>, paramName : String, defaultValue : int) : int{
    var valueStr = params.get(paramName) as String
    if (valueStr != null) {
      try {
        return Integer.parseInt( valueStr )
      } catch(e : Exception) {
      }
    }
    return defaultValue
  }
}
