package gw.plugin.contact.ab800

uses wsi.remote.gw.webservice.ab.ab801.abcontactapi.types.complex.AddressInfo

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

    this.AddressLine1Kanji = address.AddressLine1Kanji
    this.AddressLine2Kanji = address.AddressLine2Kanji
    this.CityKanji = address.CityKanji
    this.CEDEX = address.CEDEX as String
    this.CEDEXBureau = address.CEDEXBureau

    return this
  }
}
