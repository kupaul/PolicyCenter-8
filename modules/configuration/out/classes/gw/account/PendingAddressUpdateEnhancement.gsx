package gw.account

uses entity.PolicyAddress

enhancement PendingAddressUpdateEnhancement : entity.PendingAddressUpdate {

  function applyUpdateToAccountEntity(){    
    var target = this.TargetAddress
    target.refresh()
    if (target.Retired){
      return
    }
    if (this.AddressLine1 != null or this.AddressLine1IsNull){
      target.AddressLine1 = this.AddressLine1
    }
    if (this.AddressLine2 != null or this.AddressLine2IsNull){
      target.AddressLine2 = this.AddressLine2
    }
    if (this.AddressLine3 != null or this.AddressLine3IsNull){
      target.AddressLine3 = this.AddressLine3
    }
    if (this.City != null or this.CityIsNull){
      target.City = this.City
    }
    if (this.AddressLine1Kanji != null or this.AddressLine1KanjiIsNull){
      target.AddressLine1Kanji = this.AddressLine1Kanji
    }
    if (this.AddressLine2Kanji != null or this.AddressLine2KanjiIsNull){
      target.AddressLine2Kanji = this.AddressLine2Kanji
    }
    if (this.CityKanji != null or this.CityKanjiIsNull){
      target.CityKanji = this.CityKanji
    }
    if (this.CEDEX != null or this.CEDEXIsNull){
      target.CEDEX = this.CEDEX
    }
    if (this.CEDEXBureau != null or this.CEDEXBureauIsNull){
      target.CEDEXBureau = this.CEDEXBureau
    }
    if (this.County != null or this.CountyIsNull){
      target.County = this.County
    }
    if (this.PostalCode != null or this.PostalCodeIsNull){
      target.PostalCode = this.PostalCode
    }
    if (this.State != null or this.StateIsNull){      
      target.State = this.State
    }    
    if (this.Country != null or this.CountryIsNull){
      target.Country = this.Country
    }
    if (this.AddressType != null or this.AddressTypeIsNull){
      target.AddressType = this.AddressType
    }
    if (this.Description != null or this.DescriptionIsNull){
      target.Description = this.Description
    }
    if (target.LinkedAddress != null){
      target.updateLinkedAddresses()
    }    
  }

}
