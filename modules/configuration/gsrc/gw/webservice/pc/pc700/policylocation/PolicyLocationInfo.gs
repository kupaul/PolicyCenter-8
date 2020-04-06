package gw.webservice.pc.pc700.policylocation

uses gw.plugin.policylocation.IPolicyLocationInfo
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCAddress
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCPolicyLocation
uses java.math.BigDecimal
uses gw.policylocation.MapEntry

/**
 * External representation of policy location information for API methods.
 */

@gw.xml.ws.annotation.WsiExportable( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/policylocation/PolicyLocationInfo" )
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
final class PolicyLocationInfo implements IPolicyLocationInfo {

  /**
   * Policy location unique identifier
   */
  var _policyLocation : CCPolicyLocation as PolicyLocation

  /**
   * Policy number
   */
  var _policyNumber : String as PolicyNumber

  /**
   * Product code
   */
  var _productCode : String as ProductCode

  /**
   * Latitude of policy location
   */
  var _policyLocationLatitude : BigDecimal as PolicyLocationLatitude

  /**
   * Longitude of policy location
   */
  var _policyLocationLongitude : BigDecimal as PolicyLocationLongitude

  /*
   * Geocode status of policy location
   */
  var _policyLocationGeocodeStatus : String as PolicyLocationGeocodeStatus

  /**
   * Policy location address fields

  var _policyLocationAddressFields : CCAddress as PolicyLocationAddressFields
   */


  /**
   * Primary named insured name
   */
  var _pniName : String as PNIName

  /**
   * Primary named insured name address fields
   */
  var _pniAddressFields : CCAddress as PNIAddressFields

  /**
   * Primary named insured phone number
   */
  var _pniPhoneNumber : String as PNIPhoneNumber

  /**
   * Primary named insured email
   */
  var _pniEmail : String as PNIEmail

  /**
   * A map array that maps each TIV to its CoverageGroup total insured values from all the Reinsurables
   */
  var _totalInsuredValues : MapEntry[] as TotalInsuredValues

  construct() {
  }

  function copy(pl : PolicyLocation) : PolicyLocationInfo{

    PolicyNumber = pl.BranchValue.PolicyNumber
    ProductCode = pl.BranchValue.Policy.ProductCode
    PolicyLocationLatitude = pl.AccountLocation.Latitude
    PolicyLocationLongitude = pl.AccountLocation.Longitude
    PolicyLocationGeocodeStatus = pl.AccountLocation.GeocodeStatus.Code
    PNIName = pl.BranchValue.PrimaryInsuredName
    PNIPhoneNumber = pl.BranchValue.EffectiveDatedFields.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact.WorkPhone
    PNIEmail = pl.BranchValue.EffectiveDatedFields.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact.EmailAddress1

    PNIAddressFields = new CCAddress()
    PNIAddressFields.AddressLine1 = pl.BranchValue.PolicyAddress.AddressLine1
    PNIAddressFields.AddressLine2 = pl.BranchValue.PolicyAddress.AddressLine2
    PNIAddressFields.AddressLine3 = pl.BranchValue.PolicyAddress.AddressLine3
    PNIAddressFields.AddressType = pl.BranchValue.PolicyAddress.AddressType.Code
    PNIAddressFields.City = pl.BranchValue.PolicyAddress.City
    PNIAddressFields.Country = pl.BranchValue.PolicyAddress.Country.Code
    PNIAddressFields.County = pl.BranchValue.PolicyAddress.County
    PNIAddressFields.Description = pl.BranchValue.PolicyAddress.Description
    PNIAddressFields.PostalCode = pl.BranchValue.PolicyAddress.PostalCode
    PNIAddressFields.State = pl.BranchValue.PolicyAddress.State.Code

    PolicyLocation = new CCPolicyLocation()
    PolicyLocation.PolicySystemID = pl.TypeIDString
    var PolicyLocationAddressFields = new CCAddress()
    PolicyLocationAddressFields.AddressLine1 = pl.AddressLine1
    PolicyLocationAddressFields.AddressLine2 = pl.AddressLine2
    PolicyLocationAddressFields.AddressLine3 = pl.AddressLine3
    PolicyLocationAddressFields.AddressType = pl.AccountLocation.AddressType.Code
    PolicyLocationAddressFields.City = pl.City
    PolicyLocationAddressFields.Country = pl.Country.Code
    PolicyLocationAddressFields.County = pl.County
    PolicyLocationAddressFields.Description = pl.Description
    PolicyLocationAddressFields.PostalCode = pl.AccountLocation.PostalCode
    PolicyLocationAddressFields.State = pl.AccountLocation.State.Code
    PolicyLocation.Address = PolicyLocationAddressFields

    TotalInsuredValues = new MapEntry[pl.LocationRisks.Count]
    for(reinsurable in pl.LocationRisks index i){
      TotalInsuredValues[i] = new MapEntry(){
        :Name = reinsurable.CoverageGroup.Code,
        :Value = reinsurable.TotalInsuredValue.Amount,
        :Currency = reinsurable.TotalInsuredValue.Currency
      }
    }

    return this
  }
}
