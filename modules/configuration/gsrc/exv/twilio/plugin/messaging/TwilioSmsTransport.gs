package exv.twilio.plugin.messaging
/**
 * Created with IntelliJ IDEA.
 * User: Pariplab Pal
 * Date: 17/4/20
 * Time: 5:39 PM
 * To change this template use File | Settings | File Templates.
 */
uses gw.plugin.messaging.MessageTransport
uses gw.pl.messaging.entity.Message
class TwilioSmsTransport implements  MessageTransport
{
  override function send(aMessage: Message, transformedPayload: String)
  {
    print("\nMessage ID: " + aMessage.ID)
    //    print("\nTansformed Payload " + aMessage.Payload)
  }
  override function shutdown(){}
  override function resume(){}
  override function setDestinationID(a:int){}
  override function suspend(){}
}