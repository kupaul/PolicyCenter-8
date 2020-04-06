package gw.plugin.contact.ab700

uses wsi.remote.gw.webservice.ab.ab700.abcontactapi.types.complex.AddressSearchInfo
uses wsi.remote.gw.webservice.ab.ab700.abcontactapi.types.complex.ABContactSearchCriteriaInfo
uses wsi.remote.gw.webservice.ab.ab700.abcontactapi.anonymous.types.complex.ABContactSearchCriteriaInfo_Tags


@Deprecated("Since 8.0.0.  Please use the ab800 package.")
enhancement ABContactSearchCriteriaInfoEnhancement : ABContactSearchCriteriaInfo {
  
  function sync(searchCriteria : ContactSearchCriteria){
    var isPerson = Person.Type.isAssignableFrom(searchCriteria.ContactIntrinsicType)
    this.ContactType = isPerson ? wsi.remote.gw.webservice.ab.ab700.abcontactapi.enums.ABContact.ABPerson : wsi.remote.gw.webservice.ab.ab700.abcontactapi.enums.ABContact.ABCompany
    this.FirstName = searchCriteria.FirstName
    this.Keyword = searchCriteria.Keyword
    this.TaxID = searchCriteria.TaxID
    this.OrganizationName = searchCriteria.OrganizationName
    var address = new AddressSearchInfo()
    address.City = searchCriteria.Address.City
    address.State = wsi.remote.gw.webservice.ab.ab700.abcontactapi.enums.State.forGosuValue(searchCriteria.Address.State.Code)
    address.PostalCode = searchCriteria.Address.PostalCode
    address.Country = wsi.remote.gw.webservice.ab.ab700.abcontactapi.enums.Country.forGosuValue(searchCriteria.Address.Country.Code)
    this.Address.$TypeInstance = address
    this.Tags.$TypeInstance = new ABContactSearchCriteriaInfo_Tags()
    this.Tags.Entry.add(wsi.remote.gw.webservice.ab.ab700.abcontactapi.enums.ContactTagType.Client)

  }
}
