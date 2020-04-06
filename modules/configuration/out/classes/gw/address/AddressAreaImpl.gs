package gw.address

@Export
class AddressAreaImpl implements AddressArea {

  var _city : String as City
  var _cityKanji : String as CityKanji
  var _country : Country as Country
  var _county : String as County
  var _postalCode : String as PostalCode
  var _state : State as State

  function isAnyFieldSet() : boolean {
    return _city != null || _cityKanji != null || _country != null || _county != null || _postalCode != null
        || _state != null
  }
}
