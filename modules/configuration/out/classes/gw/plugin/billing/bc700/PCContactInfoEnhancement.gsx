package gw.plugin.billing.bc700
uses java.util.ArrayList
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.PCContactInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.AddressInfo
uses wsi.remote.gw.webservice.bc.bc700.entity.anonymous.elements.PCContactInfo_Addresses
uses gw.plugin.Plugins
uses gw.plugin.phone.IPhoneNormalizerPlugin
uses gw.api.util.phone.GWPhoneNumberBuilder

@Export
enhancement PCContactInfoEnhancement : PCContactInfo
{
  /**
   * When both PC and Billing System are integrated to Contact Manager, any shared 
   * contact between the 3 systems need to be synced to Contact Manager first before
   * sending to Billing System.
   */
  function sync(contact : Contact) {
    this.ContactType = contact typeis Person ? ContactType.TC_PERSON.Code
      : ContactType.TC_COMPANY.Code
    if(contact typeis Company){
      this.Name = contact.Name
    }else{
      this.FirstName = (contact as Person).FirstName
      this.LastName = (contact as Person).LastName
    }
    this.AddressBookUID = contact.AddressBookUID
    this.PublicID = contact.PublicID
    this.EmailAddress1 = contact.EmailAddress1
    var workPhone = new GWPhoneNumberBuilder().withCountryCode(contact.WorkPhoneCountry)
                                              .withNationalNumber(contact.WorkPhone)
                                              .withExtension(contact.WorkPhoneExtension)
                                              .build()
    var phoneNormalizerPlugin = Plugins.get(IPhoneNormalizerPlugin)
    this.WorkPhone = ( contact.WorkPhone == null ? null : phoneNormalizerPlugin.formatPhoneNumber(workPhone))

    for(address in contact.AllAddresses){
      var addressInfo = new AddressInfo()
      addressInfo.AddressBookUID = address.AddressBookUID
      addressInfo.AddressLine1 = address.AddressLine1
      addressInfo.AddressLine2 = address.AddressLine2
      addressInfo.City = address.City
      addressInfo.State = address.State.Code
      addressInfo.PostalCode = address.PostalCode
      addressInfo.Country = address.Country.Code
      addressInfo.Primary = (address == contact.PrimaryAddress)
      var element = new PCContactInfo_Addresses()
      element.$TypeInstance = addressInfo
      this.Addresses.add(element)
    }
    // send the list of accounts to BC so that BC can update their names
    var accountNumbers = new ArrayList<String>()
    for(account in contact.findHeldAccounts()){
      accountNumbers.add(account.AccountNumber)
    }
    this.AccountNumbers = accountNumbers
    this.DisplayName = contact.DisplayName
  }
}
