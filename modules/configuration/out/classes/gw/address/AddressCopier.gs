package gw.address
uses gw.api.copy.Copier

/**
 * A {@link Copier} to copy all {@link Address} fields
 * to a target {@link Address}.
 */
@Export
class AddressCopier extends Copier<Address> {

  var _address : Address as readonly Source
  
  construct(address : Address) {
    _address = address
    shouldCopy()
  }
  
  override function copy(target : Address) {
    target.AddressLine1   = _address.AddressLine1
    target.AddressLine2   = _address.AddressLine2
    target.AddressLine3   = _address.AddressLine3
    target.City           = _address.City
    target.AddressLine1Kanji   = _address.AddressLine1Kanji
    target.AddressLine2Kanji   = _address.AddressLine2Kanji
    target.CityKanji           = _address.CityKanji
    target.CEDEX          = _address.CEDEX
    target.CEDEXBureau    = _address.CEDEXBureau
    target.State          = _address.State
    target.PostalCode     = _address.PostalCode
    target.Country        = _address.Country
    target.County         = _address.County
    target.AddressType    = _address.AddressType
    target.Description    = _address.Description
    target.ValidUntil     = _address.ValidUntil
    target.SpatialPoint   = _address.SpatialPoint
    target.GeocodeStatus  = _address.GeocodeStatus
  }

}
