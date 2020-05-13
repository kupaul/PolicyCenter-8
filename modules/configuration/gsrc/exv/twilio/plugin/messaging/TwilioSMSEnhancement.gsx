package exv.twilio.plugin.messaging
enhancement TwilioSMSEnhancement: entity.TwilioSMS {
     function onChangeOfMessageBody(account: Account)
     {
       this.SendFromUser=User.util.CurrentUser
       var contact = this.SendToContact
       var accountContact = account.AccountContacts.firstWhere( \ acContact -> acContact.Contact == contact)
       this.AccountContactID = accountContact
       accountContact.addToMessages(this)
     }
}
