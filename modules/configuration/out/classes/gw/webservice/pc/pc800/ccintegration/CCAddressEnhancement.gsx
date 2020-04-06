package gw.webservice.pc.pc800.ccintegration

uses gw.webservice.pc.pc800.ccintegration.entities.types.complex.CCAddress
uses gw.webservice.pc.pc800.ccintegration.entities.anonymous.elements.Envelope_CCAddress

enhancement CCAddressEnhancement : CCAddress {

  /**
   * Populates this CCAddress with the values from the given policyAddress.
   */
  function configure(policyAddress: PolicyAddress) {
    this.AddressLine1      = policyAddress.AddressLine1
    this.AddressLine1Kanji = policyAddress.AddressLine1Kanji
    this.AddressLine2      = policyAddress.AddressLine2
    this.AddressLine2Kanji = policyAddress.AddressLine2Kanji
    this.AddressLine3      = policyAddress.AddressLine3
    this.AddressType       = policyAddress.AddressType.Code
    this.City              = policyAddress.City
    this.CityKanji         = policyAddress.CityKanji
    this.Country           = policyAddress.Country.Code
    this.County            = policyAddress.County
    this.Description       = policyAddress.Description
    this.PostalCode        = policyAddress.PostalCode
    this.CEDEX             = policyAddress.CEDEX
    this.CEDEXBureau       = policyAddress.CEDEXBureau
    this.State             = policyAddress.State.Code
  }

  /**
   * Populates this CCAddress with the values from the given policyLocation.
   */
  function configure(policyLocation: PolicyLocation) {
    this.AddressLine1      = policyLocation.AddressLine1
    this.AddressLine1Kanji = policyLocation.AddressLine1Kanji
    this.AddressLine2      = policyLocation.AddressLine2
    this.AddressLine2Kanji = policyLocation.AddressLine2Kanji
    this.AddressLine3      = policyLocation.AddressLine3
    this.AddressType       = policyLocation.AddressType.Code
    this.City              = policyLocation.City
    this.CityKanji         = policyLocation.CityKanji
    this.Country           = policyLocation.Country.Code
    this.County            = policyLocation.County
    this.Description       = policyLocation.Description
    this.PostalCode        = policyLocation.PostalCode
    this.CEDEX             = policyLocation.CEDEX
    this.CEDEXBureau       = policyLocation.CEDEXBureau
    this.State             = policyLocation.State.Code
  }

  /**
   * Populates this CCAddress with the values from the given address.
   */
  function configure(address: Address) {
    this.AddressLine1      = address.AddressLine1
    this.AddressLine1Kanji = address.AddressLine1Kanji
    this.AddressLine2      = address.AddressLine2
    this.AddressLine2Kanji = address.AddressLine2Kanji
    this.AddressLine3      = address.AddressLine3
    this.AddressType       = address.AddressType.Code
    this.City              = address.City
    this.CityKanji         = address.CityKanji
    this.Country           = address.Country.Code
    this.County            = address.County
    this.Description       = address.Description
    this.PostalCode        = address.PostalCode
    this.CEDEX             = address.CEDEX
    this.CEDEXBureau       = address.CEDEXBureau
    this.State             = address.State.Code
  }

  /**
   * Returns true if the given Envelope_CCAddress (an XSD type) matches this CCAddress.
   * This is true if all the fields are exactly the same except for County or Country
   * (where null matches anything).
   */
  function matches(envelopeCCAddress : Envelope_CCAddress) : boolean {
    return this.AddressBookUID == envelopeCCAddress.AddressBookUID and
        this.AddressLine1 == envelopeCCAddress.AddressLine1 and
        this.AddressLine1Kanji == envelopeCCAddress.AddressLine1Kanji and
        this.AddressLine2 == envelopeCCAddress.AddressLine2 and
        this.AddressLine2Kanji == envelopeCCAddress.AddressLine2Kanji and
        this.AddressLine3 == envelopeCCAddress.AddressLine3 and
        this.City == envelopeCCAddress.City and
        this.CityKanji == envelopeCCAddress.CityKanji and
        (this.County==null or envelopeCCAddress.County==null or this.County==envelopeCCAddress.County) and
        this.PostalCode == envelopeCCAddress.PostalCode and
        this.CEDEX == envelopeCCAddress.CEDEX and
        this.CEDEXBureau == envelopeCCAddress.CEDEXBureau and
        this.State == envelopeCCAddress.State and
        (this.Country == null or envelopeCCAddress.Country == null or this.Country == envelopeCCAddress.Country) and
        this.ValidUntil == envelopeCCAddress.ValidUntil
  }

}
