package gw.lob.pa.mvr

uses gw.globalization.UnsupportedPersonNameFields
uses gw.api.motorvehiclerecord.IMVRData
uses gw.globalization.UnsupportedPropertyBehavior

/**
 * Adapts an IMVRData to work with PersonNameFields-dependent components.
 */
@Export
class MVRDriverNameAdapter extends UnsupportedPersonNameFields {

  var _mvrDriver : IMVRData
  var _readonlyBehavior = new UnsupportedPropertyBehavior(this.IntrinsicType, UnsupportedPropertyBehavior.READONLY_MESSAGE_FORMAT)

  construct(mvrDriver : IMVRData) {
    _mvrDriver = mvrDriver
  }

  override property get FirstName() : String {
    return _mvrDriver.FirstName
  }
  override property set FirstName(val : String) {
    _readonlyBehavior.setValue("FirstName")
  }

  override property get LastName() : String {
    return _mvrDriver.LastName
  }
  override property set LastName(val : String) {
    _readonlyBehavior.setValue("LastName")
  }

  override property get MiddleName() : String {
    return _mvrDriver.MiddleName
  }
  override property set MiddleName(val : String) {
    _readonlyBehavior.setValue("MiddleName")
  }

}