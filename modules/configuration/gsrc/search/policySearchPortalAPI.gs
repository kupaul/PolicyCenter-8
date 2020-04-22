package search
uses gw.xml.ws.annotation.WsiWebService
uses java.util.ArrayList
@WsiWebService
class policySearchPortalAPI {
        /*TO GET THE ACCOUNT INFORMATION*/
function getAccountInfo(accountNumber : String) : AccountInfo
    {
      var queryObj = gw.api.database.Query.make(Account)
      queryObj.compare("AccountNumber",Equals ,accountNumber )
      var targetAccount = queryObj.select().AtMostOneRow
      var aAccountInfo = new AccountInfo()
      aAccountInfo.AccountNumber = targetAccount.AccountNumber
      aAccountInfo.AccountName = targetAccount.AccountHolderContact.DisplayName
      aAccountInfo.Status = targetAccount.AccountStatus.DisplayName
      aAccountInfo.ServiceTier = targetAccount.ServiceTier.DisplayName
      aAccountInfo.PhoneNumber = targetAccount.AccountHolderContact.PrimaryPhoneValue
      aAccountInfo.Email = targetAccount.AccountHolderContact.EmailAddress1
      aAccountInfo.Address = targetAccount.AccountHolderContact.PrimaryAddress.DisplayName
      aAccountInfo.Policies = getPolicies(targetAccount)
      aAccountInfo.AccountContact = getAccountContact(targetAccount)
       return aAccountInfo
    }
  /*TO GET THE EXISTING POLICIES OF THE GIVEN ACCOUNT NUMBER*/
private  function getPolicies(account : Account) : ArrayList<String>
  {
    var policies = new ArrayList<String>()
    for(policy in account.Policies)
    {
      if(policy.LatestBoundPeriod != null){
         policies.add(policy.LatestBoundPeriod.PolicyNumber)
      }
    }
    return policies
  }
  /*TO GET ACCOUNT CONTACT OF GIVEN POLICY NUMBER*/
  private function getAccountContact(account : Account) : ArrayList<String>
  {
    var acContact = new ArrayList<String> ()
    for(acCont in account.AccountContacts)
    {
      acContact.add(acCont.Contact.DisplayName)
    }
    return acContact
  }
}