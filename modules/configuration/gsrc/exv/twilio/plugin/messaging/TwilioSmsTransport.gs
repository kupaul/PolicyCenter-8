package exv.twilio.plugin.messaging

uses gw.plugin.messaging.MessageTransport
uses gw.pl.messaging.entity.Message
uses java.lang.ProcessBuilder
uses java.lang.Process
uses java.io.BufferedReader
uses java.io.InputStreamReader
uses java.lang.System
uses java.util.Properties

// TwilioSmsTransport plugin class is used to send SMS to the external system


class TwilioSmsTransport implements  MessageTransport
{
  /**
  *  This send method accepts the following arguments.
  *  message: Message entity instance to send
  *  transformedPayload: The transformed payload of the message
  */

  override function send(aMessage: Message, transformedPayload : String)
  {
//      var ACCOUNT_SID = PropertiesFileAccess.getProperty("exv/twilio/plugin/Twilio/Twilio", "ACCOUNT_SID")

      print("\nMessage ID: " + aMessage.ID)

      var command = {"curl" , "-X" ,"POST" ,
          "https://api.twilio.com/2010-04-01/Accounts/ACd04949e93a39aac9da62638fda2c81ba/Messages.json"  , "-d", transformedPayload,
          "-u" ,  "ACd04949e93a39aac9da62638fda2c81ba : b80057c0a11598c0e4b02c646eddcfbc"  }

      var builder = new ProcessBuilder(command)
      var process=builder.start()
      var reader = new BufferedReader(new InputStreamReader(process.getInputStream()))
      var line = reader.readLine()
      while(line != null)
      {
          System.out.println(line)
          line = reader.readLine()
          System.out.println()
      }
  }

  override function shutdown(){}
  override function resume(){}
  override function setDestinationID(a:int){}
  override function suspend(){}
}