package exv.twilio.plugin.messaging
/**
 *  TwilioIntegrationPayload class mainly used for to create message , voice call etc payload.
 */
class TwilioIntegrationPayload {
  /**
     *  In this class a method i.e. MessagePayloadCreation is used for creating the message payload using three variables i.e. to, form and body and  return type of this method is String.
  */
    function  messagePayloadCreation(message:TwilioSMS) : String
    {
        var to=message.SendToContact.PrimaryPhoneValue;
        var from=message.SendFromUser.TwilioPhoneNumber;
        var body=message.MessageBody
        var payload= "Body=" + body + "&To= " + to + "&From= "+  from;
        return payload;

    }

}