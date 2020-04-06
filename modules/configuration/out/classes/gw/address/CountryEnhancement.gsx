package gw.address

enhancement CountryEnhancement : typekey.Country {

  property get UsesTerritoryCodes() : Boolean {
    return this == TC_US
  }

}
