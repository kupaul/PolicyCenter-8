package exv.twilio.plugin.messaging

uses gw.plugin.messaging.MessageTransport
uses gw.pl.messaging.entity.Message
uses java.lang.ProcessBuilder
uses java.lang.Process
uses java.io.BufferedReader
uses java.io.InputStreamReader
uses java.lang.System
uses java.util.Properties
uses org.json.simple.parser.JSONParser
uses org.json.simple.JSONObject
uses gw.api.database.Query
uses gw.api.database.Relop

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

      var accountSid= aMessage.User.AccountSID
      var authToken= aMessage.User.AuthTOKEN
    /***
     *   cURL is basically used to transfer data using Internet Protocols(Here HTTP requests) for the given URL.
     *   Curl is a Client side program. In the name cURL, c stands for Client.
     *   "-d" is used to send the post body content,
     *   "-u" is used for authorization purpose for Twilio
     */
      var command = {"curl" , "-X" ,"POST" ,
          "https://api.twilio.com/2010-04-01/Accounts/"+accountSid+"/Messages.json"  , "-d", transformedPayload,
          "-d" , "StatusCallback=https://toolbox-robin-1768.twil.io/StatusCallBackURL",
          "-d" , "StatusCallBackMethod=POST",
          "-d" , "StatusCallBackEvent=['queued','failed','send','delivered','undelivered']",
          "-u" ,  accountSid+":"+authToken  }

      var builder = new ProcessBuilder(command)
      var process=builder.start()

      (aMessage.MessageRoot as TwilioSMS).MessageStatus=MessageStatus.TC_SEND   //This will set the Message Status typekey field with Message Send.

      var reader = new BufferedReader(new InputStreamReader(process.getInputStream()))
      var line = reader.readLine()
      var parser= new JSONParser()
      var jobj=(JSONObject) parser.parse(line)
      var status=(String) jobj.get("status")

      print(status)
      if(status!=null)
      {
          aMessage.reportAck()
          if(status!="400")
              (aMessage.MessageRoot as TwilioSMS).MessageStatus=MessageStatus.TC_DELIVERED

      }



      print(line)

    /*while(line != null)
    {
        System.out.println(line)
        line = reader.readLine()
        System.out.println()
    }  */
  }

  override function shutdown(){}
  override function resume(){}
  override function setDestinationID(a:int){}
  override function suspend(){}
}