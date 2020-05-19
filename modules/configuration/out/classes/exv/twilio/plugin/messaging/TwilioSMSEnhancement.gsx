package exv.twilio.plugin.messaging

uses pcf.SendSMSWorksheet

enhancement TwilioSMSEnhancement: entity.TwilioSMS {
     function onChangeOfMessageBody(account: Account)
     {
       this.SendFromUser=User.util.CurrentUser
       var contact = this.SendToContact
       var accountContact = account.AccountContacts.firstWhere( \ acContact -> acContact.Contact == contact)
       this.AccountContactID = accountContact
       accountContact.addToMessages(this)
     }

     function onClickSendSMS(location : SendSMSWorksheet) {
       this.addEvent("SendSMS");
       this.MessageStatus = MessageStatus.TC_INITIATED
       location.commit()

     }

    function messageStatusValue() : String {
      if(MessageStatus.TF_UNSUCCESSFUL.TypeKeys.contains(this.MessageStatus)) {
        return this.MessageStatus.DisplayName+" (Click here to know more)"
      }
      else{
        return this.MessageStatus.DisplayName
      }
    }

   function unDeliveredReasonMessage() {
     if(MessageStatus.TF_UNSUCCESSFUL.TypeKeys.contains(this.MessageStatus)){
        gw.api.util.LocationUtil.addRequestScopedInfoMessage(displaykey.Web.Account.Twilio.Errormessage(this.SendToContact, this.SendTimeFromUser, this.ErrorMessage))
     }
   }
}
