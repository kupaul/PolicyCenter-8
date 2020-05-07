package search
uses gw.xml.ws.annotation.WsiExportable
uses java.util.ArrayList
@WsiExportable
final class AccountInfo {
  construct()
  {}
  var _accountNumber : String as AccountNumber
  var _accountName : String as AccountName
  var _status : String as Status
  var _serviceTier : String as ServiceTier
  var _phoneNumber : String as PhoneNumber
  var _email : String as Email
  var _address : String as Address
  var _policies : ArrayList<String>   as Policies
  var _accountContact : ArrayList<AccountContactInfo> as AccountContact
}