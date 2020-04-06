package gw.policyaddress
uses gw.account.AddressToPolicyAddressSyncedField
uses gw.api.address.AddressFormatter

enhancement PolicyAddressEnhancement : entity.PolicyAddress {

  /**
   * This is built for address internationalization.  See AddressFormatter and usages.
   */
  function addressString(delimiter : String, includeCountry : boolean, includeCounty : boolean) : String {
    var formatter = new AddressFormatter() {  :IncludeCounty = includeCounty,
                                              :IncludeCountry = includeCountry,
                                              :AddressLine1 = this.AddressLine1,
                                              :AddressLine2 = this.AddressLine2,
                                              :City         = this.City,
                                              :AddressLine1Kanji = this.AddressLine1Kanji,
                                              :AddressLine2Kanji = this.AddressLine2Kanji,
                                              :CityKanji         = this.CityKanji,
                                              :CEDEX        = this.CEDEX,
                                              :CEDEXBureau  = this.CEDEXBureau,
                                              :State        = this.State,
                                              :PostalCode   = this.PostalCode,
                                              :Country      = this.Country,
                                              :County       = this.County
    }
    return formatter.format(formatter, delimiter == "," ? ", " : delimiter)
  }
  
  /**
   * Shared and revisioned address line 1.
   */
  property get AddressLine1() : String {
    return AddressToPolicyAddressSyncedField.AddressLine1.getValue(this)
  }

  /**
   * Shared and revisioned address line 1.
   */
  property set AddressLine1(arg : String) {
    AddressToPolicyAddressSyncedField.AddressLine1.setValue(this, arg)
  }

  /**
   * Shared and revisioned address line 2.
   */
  property get AddressLine2() : String {
    return AddressToPolicyAddressSyncedField.AddressLine2.getValue(this)
  }

  /**
   * Shared and revisioned address line 2.
   */
  property set AddressLine2(arg : String) {
    AddressToPolicyAddressSyncedField.AddressLine2.setValue(this, arg)
  }

  /**
   * Shared and revisioned address line 3.
   */
  property get AddressLine3() : String {
    return AddressToPolicyAddressSyncedField.AddressLine3.getValue(this)
  }

  /**
   * Shared and revisioned address line 3.
   */
  property set AddressLine3(arg : String) {
    AddressToPolicyAddressSyncedField.AddressLine3.setValue(this, arg)
  }

  /**
   * Shared and revisioned city.
   */
  property get City() : String {
    return AddressToPolicyAddressSyncedField.City.getValue(this)
  }

  /**
   * Shared and revisioned city.
   */
  property set City(arg : String) {
    AddressToPolicyAddressSyncedField.City.setValue(this, arg)
  }

  /**
   * Shared and revisioned address line 1 for kanji.
   */
  property get AddressLine1Kanji() : String {
    return AddressToPolicyAddressSyncedField.AddressLine1Kanji.getValue(this)
  }

  /**
   * Shared and revisioned address line 1 for kanji.
   */
  property set AddressLine1Kanji(arg : String) {
    AddressToPolicyAddressSyncedField.AddressLine1Kanji.setValue(this, arg)
  }

  /**
   * Shared and revisioned address line 2 for kanji.
   */
  property get AddressLine2Kanji() : String {
    return AddressToPolicyAddressSyncedField.AddressLine2Kanji.getValue(this)
  }

  /**
   * Shared and revisioned address line 2 for kanji.
   */
  property set AddressLine2Kanji(arg : String) {
    AddressToPolicyAddressSyncedField.AddressLine2Kanji.setValue(this, arg)
  }

  /**
   * Shared and revisioned city for kanji.
   */
  property get CityKanji() : String {
    return AddressToPolicyAddressSyncedField.CityKanji.getValue(this)
  }

  /**
   * Shared and revisioned city for kanji.
   */
  property set CityKanji(arg : String) {
    AddressToPolicyAddressSyncedField.CityKanji.setValue(this, arg)
  }

  /**
   * Shared and revisioned CEDEX.
   */
  property get CEDEX() : Boolean {
    return AddressToPolicyAddressSyncedField.CEDEX.getValue(this)
  }

  /**
   * Shared and revisioned CEDEX.
   */
  property set CEDEX(arg : Boolean) {
    AddressToPolicyAddressSyncedField.CEDEX.setValue(this, arg)
  }

  /**
   * Shared and revisioned CEDEX bureau.
   */
  property get CEDEXBureau() : String {
    return AddressToPolicyAddressSyncedField.CEDEXBureau.getValue(this)
  }

  /**
   * Shared and revisioned CEDEX bureau.
   */
  property set CEDEXBureau(arg : String) {
    AddressToPolicyAddressSyncedField.CEDEXBureau.setValue(this, arg)
  }

  /**
   * Shared and revisioned county.
   */
  property get County() : String {
    return AddressToPolicyAddressSyncedField.County.getValue(this)
  }

  /**
   * Shared and revisioned county.
   */
  property set County(arg : String) {
    AddressToPolicyAddressSyncedField.County.setValue(this, arg)
  }

  /**
   * Shared and revisioned postal code.
   */
  property get PostalCode() : String {
    return AddressToPolicyAddressSyncedField.PostalCode.getValue(this)
  }

  /**
   * Shared and revisioned postal code.
   */
  property set PostalCode(arg : String) {
    AddressToPolicyAddressSyncedField.PostalCode.setValue(this, arg)
  }

  /**
   * Shared and revisioned state.
   */
  property get State() : State {
    return AddressToPolicyAddressSyncedField.State.getValue(this)
  }

  /**
   * Shared and revisioned state.
   */
  property set State(arg : State) {
    AddressToPolicyAddressSyncedField.State.setValue(this, arg)
  }

  /**
   * Shared and revisioned country.
   */
  property get Country() : Country {
    return AddressToPolicyAddressSyncedField.Country.getValue(this)
  }

  /**
   * Shared and revisioned country.
   */
  property set Country(arg : Country) {
    AddressToPolicyAddressSyncedField.Country.setValue(this, arg)
  }

  /**
   * Shared and revisioned description.
   */
  property get Description() : String {
    return AddressToPolicyAddressSyncedField.Description.getValue(this)
  }

  /**
   * Shared and revisioned description.
   */
  property set Description(arg : String) {
    AddressToPolicyAddressSyncedField.Description.setValue(this, arg)
  }

  /**
   * Shared and revisioned address type.
   */
  property get AddressType() : AddressType {
    return AddressToPolicyAddressSyncedField.AddressType.getValue(this)
  }

  /**
   * Shared and revisioned address type.
   */
  property set AddressType(arg : AddressType) {
    AddressToPolicyAddressSyncedField.AddressType.setValue(this, arg)
  }

  function copyToNewAddress() : Address {
    return new Address() {
      :AddressLine1 = AddressLine1,
      :AddressLine2 = AddressLine2,
      :AddressLine3 = AddressLine3,
      :City = City,
      :AddressLine1Kanji = AddressLine1Kanji,
      :AddressLine2Kanji = AddressLine2Kanji,
      :CityKanji = CityKanji,
      :CEDEX = CEDEX,
      :CEDEXBureau = CEDEXBureau,
      :County = County,
      :PostalCode = PostalCode,
      :Description = Description,
      :State = State,
      :Country = Country,
      :AddressType = AddressType
    }
  }
  
  function copyFromAddress(address : Address) {
    AddressLine1 = address.AddressLine1
    AddressLine2 = address.AddressLine2
    AddressLine3 = address.AddressLine3
    City = address.City
    AddressLine1Kanji = address.AddressLine1Kanji
    AddressLine2Kanji = address.AddressLine2Kanji
    CityKanji = address.CityKanji
    CEDEX = address.CEDEX
    CEDEXBureau = address.CEDEXBureau
    County = address.County
    PostalCode = address.PostalCode
    Description = address.Description
    State = address.State
    Country = address.Country
    AddressType = address.AddressType
  }
}
