package gw.lob.wc.options

@Export
class AircraftSeatWCOption extends WCOption {

  construct(policyPeriod : PolicyPeriod) {
    super(policyPeriod)
  }

  override property get Label() : String {
    return displaykey.Web.Policy.WC.AircraftSeatCharge
  }

  override property get Mode() : String {
    return "AircraftSeat"
  }

  override function addToPolicy() {
    WCLine.HasWCAircraftSeats = true
  }

  override function removeFromPolicy() {
    WCLine.HasWCAircraftSeats = false
  }

  override function isOnPolicy() : boolean {
    return WCLine.HasWCAircraftSeats
  }
}