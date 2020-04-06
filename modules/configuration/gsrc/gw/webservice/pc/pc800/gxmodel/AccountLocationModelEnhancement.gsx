package gw.webservice.pc.pc800.gxmodel

enhancement AccountLocationModelEnhancement : gw.webservice.pc.pc800.gxmodel.accountlocationmodel.types.complex.AccountLocation {
  function findMatchedLocation(account : Account) : AccountLocation {
    var result = account.AccountLocations.firstWhere(\ accountLocation -> {
      var doMatch = accountLocation.AddressLine1 == this.AddressLine1
        and accountLocation.AddressLine2 == this.AddressLine2
        and accountLocation.AddressLine3 == this.AddressLine3
        and accountLocation.City == this.City
        and accountLocation.State.Code == (this.State as String)
        and accountLocation.County == this.County
        and accountLocation.Country == (this.Country as String)
        and accountLocation.AddressLine1Kanji == this.AddressLine1Kanji
        and accountLocation.AddressLine2Kanji == this.AddressLine2Kanji
        and accountLocation.CityKanji == this.CityKanji
        and accountLocation.PostalCode == this.PostalCode
        and accountLocation.CEDEX == this.CEDEX
        and accountLocation.CEDEXBureau == this.CEDEXBureau

        return doMatch
      }
    )

    return result
  }
  
  function populateAccountLocation(accountLocation : AccountLocation){
    SimpleValuePopulator.populate(this, accountLocation)
  }
}