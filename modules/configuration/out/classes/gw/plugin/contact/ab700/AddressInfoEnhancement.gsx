package gw.plugin.contact.ab700

uses wsi.remote.gw.webservice.ab.ab700.abcontactapi.types.complex.AddressInfo

@Deprecated("Since 8.0.0.  Please use the ab800 package.")
enhancement AddressInfoEnhancement : AddressInfo {
  
  function sync(address : Address) : AddressInfo{
    this.AddressType = address.AddressType as java.lang.String
    this.AddressLine1 = address.AddressLine1
    this.AddressLine2 = address.AddressLine2
    this.AddressLine3 = address.AddressLine3
    this.City = address.City
    this.State = address.State.Code
    this.County = address.County
    this.PostalCode = address.PostalCode
    this.Country = address.Country.Code
    this.Description = address.Description
    this.ValidUntil = address.ValidUntil.Calendar as java.util.Date
    return this
  }
}
