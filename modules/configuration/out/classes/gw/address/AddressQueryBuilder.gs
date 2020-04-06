package gw.address
uses gw.search.EntityQueryBuilder
uses gw.api.database.ISelectQueryBuilder
uses gw.search.StringColumnRestrictor

@Export
class AddressQueryBuilder extends EntityQueryBuilder<Address> {
  var _addressLine1 : String
  var _addressLine1Restrictor : StringColumnRestrictor
  var _addressLine1Kanji : String
  var _addressLine1KanjiRestrictor : StringColumnRestrictor
  var _addressLine2 : String
  var _addressLine2Restrictor : StringColumnRestrictor
  var _addressLine2Kanji : String
  var _addressLine2KanjiRestrictor : StringColumnRestrictor
  var _city : String
  var _cityKanji : String
  var _cityRestrictor : StringColumnRestrictor
  var _cityKanjiRestrictor : StringColumnRestrictor
  var _country : Country
  var _county : String
  var _countyRestrictor : StringColumnRestrictor
  var _postalCode : String
  var _postalCodeRestrictor : StringColumnRestrictor
  var _state : State

  function withAddressLine1(value : String) : AddressQueryBuilder {
    withAddressLine1Restricted(value, EqualsIgnoringCase)
    return this
  }

  function withAddressLine1Restricted(value : String, restrictor : StringColumnRestrictor) : AddressQueryBuilder {
    _addressLine1 = value
    _addressLine1Restrictor = restrictor
    return this
  }

  function withAddressLine1Kanji(value : String) : AddressQueryBuilder {
    withAddressLine1KanjiRestricted(value, StartsWith)
    return this
  }

  function withAddressLine1KanjiRestricted(value : String, restrictor : StringColumnRestrictor) : AddressQueryBuilder {
    _addressLine1Kanji = value
    _addressLine1Restrictor = restrictor
    return this
  }

  function withAddressLine2(value : String) : AddressQueryBuilder {
    withAddressLine2Restricted(value, EqualsIgnoringCase)
    return this
  }

  function withAddressLine2Restricted(value : String, restrictor : StringColumnRestrictor) : AddressQueryBuilder {
    _addressLine2 = value
    _addressLine2Restrictor = restrictor
    return this
  }

  function withAddressLine2Kanji(value : String) : AddressQueryBuilder {
    withAddressLine2KanjiRestricted(value, StartsWith)
    return this
  }

  function withAddressLine2KanjiRestricted(value : String, restrictor : StringColumnRestrictor) : AddressQueryBuilder {
    _addressLine2Kanji = value
    _addressLine2KanjiRestrictor = restrictor
    return this
  }

  function withCity(value : String) : AddressQueryBuilder {
    return withCityRestricted(value, EqualsIgnoringCase)
  }

  function withCityStarting(value : String) : AddressQueryBuilder {
    return withCityRestricted(value, StartsWithIgnoringCase)
  }

  function withCityRestricted(value : String, restrictor : StringColumnRestrictor) : AddressQueryBuilder {
    _city = value
    _cityRestrictor = restrictor
    return this
  }

  function withCityKanji(value : String) : AddressQueryBuilder {
    return withCityKanjiRestricted(value,Equals)
  }

  function withCityKanjiStarting(value : String) : AddressQueryBuilder {
    return withCityKanjiRestricted(value, StartsWith)
  }

  function withCityKanjiRestricted(value : String, restrictor : StringColumnRestrictor) : AddressQueryBuilder {
    _cityKanji = value
    _cityKanjiRestrictor = restrictor
    return this
  }

  function withCountry(value : Country) : AddressQueryBuilder {
    _country = value
    return this
  }

  function withCounty(value : String) : AddressQueryBuilder {
    return withCountyRestricted(value, EqualsIgnoringCase)
  }

  function withCountyStarting(value : String) : AddressQueryBuilder {
    return withCountyRestricted(value, StartsWithIgnoringCase)
  }
  
  function withCountyRestricted(value : String, restrictor : StringColumnRestrictor) : AddressQueryBuilder {
    _county = value
    _countyRestrictor = restrictor
    return this
  }

  function withPostalCode(value : String) : AddressQueryBuilder {
    return withPostalCodeRestricted(value, EqualsIgnoringCase)
  }

  function withPostalCodeStarting(value : String) : AddressQueryBuilder {
    return withPostalCodeRestricted(value, StartsWithIgnoringCase)
  }

  function withPostalCodeRestricted(value : String, restrictor : StringColumnRestrictor) : AddressQueryBuilder {
    _postalCode = value
    _postalCodeRestrictor = restrictor
    return this
  }

  function withState(value : State) : AddressQueryBuilder {
    _state = value
    return this
  }

  override function doRestrictQuery(selectQueryBuilder : ISelectQueryBuilder) {
    if (_addressLine1.NotBlank) {
      _addressLine1Restrictor.restrict(selectQueryBuilder, "AddressLine1", _addressLine1)
    }
    if (_addressLine1Kanji.NotBlank) {
      _addressLine1Restrictor.restrict(selectQueryBuilder, "AddressLine1Kanji", _addressLine1Kanji)
    }
    if (_addressLine2.NotBlank) {
      _addressLine2Restrictor.restrict(selectQueryBuilder, "AddressLine2", _addressLine2)
    }
    if (_addressLine2Kanji.NotBlank) {
      _addressLine2KanjiRestrictor.restrict(selectQueryBuilder, "AddressLine2Kanji", _addressLine2Kanji)
    }
    if (_city.NotBlank) {
      _cityRestrictor.restrict(selectQueryBuilder, "City", _city)
    }
    if (_cityKanji.NotBlank) {
      _cityKanjiRestrictor.restrict(selectQueryBuilder, "CityKanji", _cityKanji)
    }
    if (_country != null) {
      selectQueryBuilder.compare("Country", Equals, _country)
    }
    if (_county.NotBlank) {
      _countyRestrictor.restrict(selectQueryBuilder, "County", _county)
    }
    if (_postalCode.NotBlank) {
      _postalCodeRestrictor.restrict(selectQueryBuilder, "PostalCode", _postalCode)
    }
    if (_state != null) {
      selectQueryBuilder.compare("State", Equals, _state)
    }
  }
  
}
