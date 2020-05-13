package exv.twilio.plugin.messaging
enhancement TwilioSmEnhancement : entity.TwilioSMS {
     function onChangeofMessageBody(account : Account)
     {
       this.SendFrom=User.util.CurrentUser
       var contact = this.SendTo
       var accountContact = account.AccountContacts.firstWhere( \ acContact -> acContact.Contact == contact)
       this.fkeyofAccountContact = accountContact
       accountContact.addToMessageKey(this)
     }
}
