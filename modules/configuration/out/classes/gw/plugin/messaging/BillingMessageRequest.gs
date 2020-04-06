package gw.plugin.messaging
uses gw.api.system.database.SequenceUtil
uses java.util.Date
uses gw.api.util.BatchSequenceUtil

@Export
class BillingMessageRequest implements MessageRequest{

  construct() {  }
  
  override function beforeSend(message : Message) : String {
    return message.Payload
  }

  override function shutdown() { }

  override function resume() { }

  override function suspend() { }

  override function setDestinationID(p0 : int) { }


  override function afterSend(p0 : Message) { }

}
