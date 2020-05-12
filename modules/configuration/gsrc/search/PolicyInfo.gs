package search

uses gw.xml.ws.annotation.WsiExportable
/**
 * Created with IntelliJ IDEA.
 * User: Admin
 * Date: 23/4/20
 * Time: 11:23 AM
 * To change this template use File | Settings | File Templates.
 */
@WsiExportable

final class PolicyInfo {

  construct()
  {}

  var _product : String as Product
  var _ssn : String as SSN
  var _offering : String as Offering
  var _policyNumber : String as PolicyNumber
  var _issued : String as Issued
  var _firstIssueDate : String as IssueDate
  var _underwriter : String as Underwriter
  var  _policyHolderName : String as  PrimaryNamedInsured
  var _accNumber : String as AccountNumber
  var _accName : String as AccountName
  var _accAddress : String as Address
  var _accAddType : String as AddressType
  var _pNIPublicId : String as PNIPublicID


}