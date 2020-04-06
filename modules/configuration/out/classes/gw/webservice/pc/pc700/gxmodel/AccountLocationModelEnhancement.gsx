package gw.webservice.pc.pc700.gxmodel

@Deprecated("As of 8.0 use gw.webservice.pc.pc800.gxmodel.AccountLocationModelEnhancement instead")
enhancement AccountLocationModelEnhancement : gw.webservice.pc.pc700.gxmodel.accountlocationmodel.types.complex.AccountLocation {
  function findMatchedLocation(account : Account) : AccountLocation{
    return account.AccountLocations.firstWhere(\ a -> a.AddressLine1 == this.AddressLine1
      and a.AddressLine2 == this.AddressLine2
      and a.AddressLine3 == this.AddressLine3
      and a.City == this.City
      and a.State.Code == this.State as String
      and a.County == this.County
      and a.Country == this.Country as String
      )
  }

  function populateAccountLocation(accountLocation : AccountLocation){
    SimpleValuePopulator.populate(this, accountLocation)
  }
}