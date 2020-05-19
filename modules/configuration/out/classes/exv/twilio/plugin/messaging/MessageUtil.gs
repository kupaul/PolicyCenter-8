package exv.twilio.plugin.messaging

uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.util.DateUtil

class MessageUtil {
  static function findMessagesByUser(user: User): TwilioSMS[]
  {
     var qObj=Query.make(TwilioSMS)
     qObj.compare(TwilioSMS#SendFromUser ,Relop.Equals , user)
     return qObj.select().toTypedArray()
  }

  static function updateMessageStatus(messageSid : String, status : String)   {
      var queryObj = Query.make(TwilioSMS)
      queryObj.compare(TwilioSMS#MessageSid, Relop.Equals, messageSid)
      var targetMessage = queryObj.select().AtMostOneRow
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      targetMessage = bundle.add(targetMessage)
      targetMessage.MessageStatus = status
      if(targetMessage.MessageStatus == MessageStatus.TC_DELIVERED){
        targetMessage.ReceivedTimeToContact = DateUtil.currentDate()
      }
  }, "su")
  }

}