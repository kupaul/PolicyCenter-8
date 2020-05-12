package search
uses gw.xml.ws.annotation.WsiWebService
uses java.util.ArrayList
@WsiWebService
class PolicySearchPortalAPI {
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
      aAccountInfo.AccountContact = getAccountContacts(targetAccount)
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
  private function getAccountContacts(account : Account) : ArrayList<AccountContactInfo>
  {
    var acContacts = new ArrayList<AccountContactInfo> ()

    for(acCont in account.AccountContacts)
    {
      var acontactInfo = new AccountContactInfo()
      acontactInfo.AccountContactName = acCont.Contact.DisplayName
      acontactInfo.AccountContactPublicId = acCont.Contact.PublicID
      acContacts.add(acontactInfo)
    }
    return acContacts
  }


    /*TO GET THE POLICY INFORMATION*/
    function getPolicyInfo(policyNumber : String) : PolicyInfo
    {
      var queryObj = gw.api.database.Query.make(PolicyPeriod)
      queryObj.compare("PolicyNumber",Equals ,policyNumber )
      var targetPolicy = queryObj.select().AtMostOneRow
      var aPolicyInfo = new PolicyInfo()
      aPolicyInfo.PolicyNumber = targetPolicy.PolicyNumber
      aPolicyInfo.Product =   targetPolicy.Policy.Product
      //aPolicyInfo.Offering = targetPolicy.Offering
      aPolicyInfo.SSN = targetPolicy.PNIContactDenorm.TaxID
      aPolicyInfo.Issued = targetPolicy.Policy.Issued
      aPolicyInfo.IssueDate =  targetPolicy.Policy.IssueDate
      aPolicyInfo.Underwriter =  targetPolicy.Policy.getUserRoleAssignmentByRole(typekey.UserRole.TC_UNDERWRITER).AssignedUser
      aPolicyInfo.PrimaryNamedInsured = targetPolicy.PrimaryInsuredName
      aPolicyInfo.PNIPublicID = targetPolicy.PNIContactDenorm.PublicID
      aPolicyInfo.AccountNumber = targetPolicy.Policy.Account.AccountNumber
      aPolicyInfo.AccountName = targetPolicy.Policy.Account.AccountHolderContact.DisplayName
      aPolicyInfo.Address =    targetPolicy.Policy.Account.AccountHolderContact.PrimaryAddress.DisplayName
      aPolicyInfo.AddressType =  targetPolicy.Policy.Account.AccountHolderContact.PrimaryAddress.AddressType

      return aPolicyInfo
    }

  /*TO GET THE ACCOUNT Contacts INFORMATION*/
  function getContactInfo(publicId : String) : ContactInfo
  {
      var queryObj = gw.api.database.Query.make(Contact)
      queryObj.compare("PublicId",Equals ,publicId)
      var targetContact = queryObj.select().AtMostOneRow
      var cContactInfo = new ContactInfo()
      cContactInfo.ContactFirstName = (targetContact as Person).FirstName
      cContactInfo.ContactLastName = (targetContact as Person).LastName
      cContactInfo.DateOfBirth = (targetContact as Person).DateOfBirth
      cContactInfo.MaritalStatus = (targetContact as Person).MaritalStatus
      cContactInfo.PrimaryPhone = (targetContact as Person).PrimaryPhone
      cContactInfo.HomePhone = targetContact.HomePhone
      cContactInfo.WorkPhone = targetContact.WorkPhone
      cContactInfo.MobilePhone = (targetContact as Person).CellPhone
      cContactInfo.PrimaryEmail = (targetContact as Person).EmailAddress1
      cContactInfo.AddressType = targetContact.PrimaryAddress.AddressType
      cContactInfo.Address = targetContact.PrimaryAddress.DisplayName
      cContactInfo.License = (targetContact as Person).LicenseNumber
      cContactInfo.LicenseState = (targetContact as Person).LicenseState
      cContactInfo.SSNOfficialID = (targetContact as Person).SSNOfficialID
      return cContactInfo


  }
}