package exv.twilio.plugin.messaging
/**
 * Created with IntelliJ IDEA.
 * User: Pariplab Pal
 * Date: 17/4/20
 * Time: 12:06 PM
 * To change this template use File | Settings | File Templates.
 */

//  This TwilioMessageTransport class sends the Message to the External system with the help of send Method

uses gw.plugin.messaging.MessageTransport
uses gw.pl.messaging.entity.Message
class TwilioMessageTransport implements  MessageTransport
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