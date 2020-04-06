package gw.webservice.pc.pc700.ccintegration.ccentities

uses java.util.Date



/**
 * Represents a ClaimCenter Policy Search Criteria
 */
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCPCSearchCriteria
{
  var _accountNumber : String as AccountNumber
  var _asOfDate : Date as AsOfDate
  var _nonRenewalCode : String as NonRenewalCode
  var _policyNumber : String as PolicyNumber
  var _policyStatus : String as PolicyStatus
  var _producerCodeString : String as ProducerCodeString
  var _producerString : String as ProducerString
  var _product : String as Product
  var _productCode : String as ProductCode
  var _state : String as State
  var _firstName : String as FirstName
  var _lastName : String as LastName
  var _companyName : String as CompanyName
  var _taxID : String as TaxID
  var _includeArchived : boolean as IncludeArchived
  var _primaryInsuredCity : String as PrimaryInsuredCity
  var _primaryInsuredState : String as PrimaryInsuredState
  var _primaryInsuredPostalCode : String as PrimaryInsuredPostalCode
  var _primaryInsuredCountry : String as PrimaryInsuredCountry

  construct()
  {
  }

}
