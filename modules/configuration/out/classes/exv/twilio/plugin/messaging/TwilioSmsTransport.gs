package exv.twilio.plugin.messaging

uses gw.plugin.messaging.MessageTransport
uses java.lang.ProcessBuilder
uses java.io.BufferedReader
uses java.io.InputStreamReader
uses org.json.simple.JSONObject
uses org.json.simple.JSONValue
uses java.util.ArrayList
uses org.apache.http.client.utils.DateUtils
uses gw.api.util.DateUtil

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

      var sms =aMessage.MessageRoot as TwilioSMS

      var twilioRequest = buildRequest(aMessage, transformedPayload)
      var builder = new ProcessBuilder(twilioRequest)
      var process=builder.start()

      sms.MessageStatus=MessageStatus.TC_SENT  //This will set the Message Status typekey field with Message Send.
      sms.SendTimeFromUser = DateUtil.currentDate()
      var reader = new BufferedReader(new InputStreamReader(process.getInputStream()))
      var response = reader.readLine()
      processResponse(aMessage, response)

  }

  private function buildRequest(message : Message , payload : String) : ArrayList<String> {

    var accountSid= message.User.AccountSID
    var authToken= message.User.AuthTOKEN

    // This needs to change as per your local ngrok url
    var statusCallBackUrl = "http://e3ea5524.ngrok.io/pc/service/sms/statuscallback"

    /***
     *   cURL is basically used to transfer data using Internet Protocols(Here HTTP requests) for the given URL.
     *   Curl is a Client side program. In the name cURL, c stands for Client.
     *   "-d" is used to send the post body content,
     *   "-u" is used for authorization purpose for Twilio
     */
    var command = {"curl" , "-X" ,"POST" ,
        "https://api.twilio.com/2010-04-01/Accounts/"+accountSid+"/Messages.json"  ,
        "-d", payload,
        "-d" , "StatusCallback="+statusCallBackUrl,
        "-u" ,  accountSid+":"+authToken  }
    return command
  }

  private function processResponse(message : Message , response : String) {

    var sms = message.MessageRoot as TwilioSMS

    var responseJsonObject = JSONValue.parse(response) as JSONObject

    if(responseJsonObject != null){
       message.reportAck()
       print(responseJsonObject)
    }
    var messageSid=responseJsonObject?.get("sid") as String

    if(messageSid!=null)
    {
      sms.MessageSid = messageSid
    }
    else {
      var errorMessage = responseJsonObject?.get("message") as String
      sms.ErrorMessage = errorMessage
    }
  }

  override function shutdown(){}
  override function resume(){}
  override function setDestinationID(a:int){}
  override function suspend(){}
}