package gw.plugin.messaging


@Export
class ConsoleMessageTransport implements MessageTransport
{
  var _destinationId : int
  
  construct()
  {
  }

  override function send( message : Message, transformedPayload : String ) : void
  {
    print("ConsoleMessageTransport on " + _destinationId 
      + " SEND (Msg ID:" + message.ID + " objType=" + (typeof message.PrimaryObject).RelativeName 
      + " Payload=\"" + transformedPayload + "\")")
    message.reportAck()
  }

  override function resume() : void
  {
    print("ConsoleMessageTransport on " + _destinationId + " RESUME")
  }

  override function setDestinationID( dest : int ) : void
  {
    _destinationId = dest
    print("ConsoleMessageTransport set destination to " + _destinationId)
  }

  override function shutdown() : void
  {
    print("ConsoleMessageTransport on " + _destinationId + " SHUTDOWN")
  }

  override function suspend() : void
  {
    print("ConsoleMessageTransport on " + _destinationId + " SUSPEND")
  }

}
