package exv.twilio.plugin.messaging
/**
 * Created with IntelliJ IDEA.
 * User: 91990
 * Date: 17/4/20
 * Time: 1:01 PM
 * To change this template use File | Settings | File Templates.
 */
class TwilioIntegrationPayload {
    function  MessagePayloadCreation() : String {
        var message=new TwilioSMS();
        var to=message.ToNumber;
        var from=message.FromNumber;
        var body=message.SMSBody

      var payload= "Body=" + body + "&To= " + to + "&From= "+  from;
      return payload;

    }

}