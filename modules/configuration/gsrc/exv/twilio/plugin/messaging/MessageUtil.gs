package exv.twilio.plugin.messaging

uses gw.api.database.Query
uses gw.api.database.Relop

class MessageUtil {
  static function findMessagesByUser(user: User): TwilioSMS[]
  {
     var qobj=Query.make(TwilioSMS)
     qobj.compare(TwilioSMS#SendFromUser ,Relop.Equals , user)
     return qobj.select().toTypedArray()
  }

  static function messageInitiated(sms:TwilioSMS)
  {
       sms.MessageStatus=MessageStatus.TC_INITIATED
  }
}