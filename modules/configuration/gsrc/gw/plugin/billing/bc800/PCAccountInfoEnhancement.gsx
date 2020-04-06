package gw.plugin.billing.bc800

uses java.util.ArrayList
uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.PCAccountInfo
uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.PCContactInfo
uses wsi.remote.gw.webservice.bc.bc800.entity.anonymous.elements.PCAccountInfo_BillingContacts

@Export
enhancement PCAccountInfoEnhancement : PCAccountInfo
{
  function sync(account : Account){
    this.AccountNumber = account.AccountNumber
    this.AccountName = account.AccountHolderContact.AccountName
    this.AccountNameKanji = account.AccountHolderContact.AccountNameKanji

    this.CustomerServiceTier = account.ServiceTier as String

    var insuredContact = new PCContactInfo()
    insuredContact.sync( account.AccountHolderContact )
    this.InsuredContact.$TypeInstance = insuredContact

    var insuredContactID = account.AccountHolderContact.ID

    var billingContacts = new ArrayList<PCContactInfo>()
    var accountBillingContacts = account.getAccountContactsWithRole( typekey.AccountContactRole.TC_BILLINGCONTACT)
    for(b in accountBillingContacts){
      if(insuredContactID == b.Contact.ID){
        this.InsuredIsBilling = true
      }else{
        var PCContactInfo = new PCContactInfo()
        PCContactInfo.sync( b.Contact )
        billingContacts.add( PCContactInfo )
      }
    }
    billingContacts.each(\ p -> {
      var element = new PCAccountInfo_BillingContacts()
      element.$TypeInstance = p
      this.BillingContacts.add(element)
    })
  }
}
