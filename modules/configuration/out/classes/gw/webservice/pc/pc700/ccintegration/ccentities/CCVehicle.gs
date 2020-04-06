package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.util.ArrayList
uses java.math.BigDecimal

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCVehicle
{
  var _PolicySystemID : String as PolicySystemID
  var _color : String as Color
  var _licensePlate : String as LicensePlate
  var _loan : boolean as Loan
  var _loanMonthlyPayment : BigDecimal as LoanMonthlyPayment
  var _loanMonthsRemaining : int as LoanMonthsRemaining
  var _loanPayoffAmount : BigDecimal as LoanPayoffAmount
  var _make : String as Make
  var _model : String as Model
  var _serialNumber : String as SerialNumber
  var _vin : String as Vin
  var _year : int as Year

  // typekeys in cc
  var _boatType : String as BoatType
  var _manufacturer : String as Manufacturer
  var _offRoadStyle : String as OffRoadStyle
  var _state : String as State
  var _style : String as Style

  var _leinholders = new ArrayList<CCVehicleOwner>()

  construct()
  {
  }

  property get Lienholders() : CCVehicleOwner[]
  {
    return _leinholders as CCVehicleOwner[]
  }

  function addToLienholders(leinholder : CCVehicleOwner) : void
  {
    _leinholders.add(leinholder)
  }
}
