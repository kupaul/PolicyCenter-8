package gw.webservice.pc.pc700.ccintegration.ccentities
uses java.math.BigDecimal

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCNumericCovTerm extends CCCovTerm {

  var _value : BigDecimal as NumericValue
  var _units : String as Units

  construct() {
  }

}
