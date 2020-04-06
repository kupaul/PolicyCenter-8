package gw.lob.common.contact
uses gw.api.contact.AdditionalInterestContainer
uses java.util.ArrayList
uses java.util.Arrays

@Export
abstract class AbstractAdditionalInterestContainer<K extends KeyableBean> implements AdditionalInterestContainer
{
  protected var _owner : K
  
  construct(owner : K) {
    _owner = owner
  }
  
  override property get OwnerDisplayName() : String {
    return _owner.DisplayName
  }
  
  override property get AdditionalInterestCandidates() : AccountContact[] {
    if (not ContainerIsValid) {
      return new AccountContact[0]
    }
    var accountInterests = this.PolicyPeriod.Policy.Account.getAccountContactsWithRole("AdditionalInterest")
    return accountInterests
  }
  
  override property get AdditionalInterestOtherCandidates() : AccountContact[] {
    if (not ContainerIsValid) {
      return new AccountContact[0]
    }
    var additionalInterests = this.PolicyPeriod.Policy.Account.getAccountContactsWithRole("AdditionalInterest")
    var otherContacts = this.PolicyLine.Branch.Policy.Account.ActiveAccountContacts.toSet()
    return otherContacts.subtract(Arrays.asList(additionalInterests)).toTypedArray()
  }
  
  override function addAdditionalInterestDetail(policyAdditionalInterest : PolicyAddlInterest) : AddlInterestDetail {
    // create a detail entity
    var interestDetail= createNewAdditionalInterestDetail()
    this.addToAdditionalInterestDetails(interestDetail)
    policyAdditionalInterest.addToAdditionalInterestDetails(interestDetail)
    return interestDetail
  }

  override function addAdditionalInterestDetail(contact : Contact) : AddlInterestDetail {
    var policyAdditionalInterest = this.PolicyPeriod.PolicyContactRoles.whereTypeIs(PolicyAddlInterest).firstWhere( \ pcr -> pcr.AccountContactRole.AccountContact.Contact == contact )
    if (policyAdditionalInterest == null) {
      policyAdditionalInterest = this.PolicyPeriod.addNewPolicyContactRoleForContact(contact, "PolicyAddlInterest") as PolicyAddlInterest
    }
    return addAdditionalInterestDetail(policyAdditionalInterest)
  }
  
  override function removeFromAdditionalInterestDetails(interestDetail : AddlInterestDetail) {
    var policyAdditionalInterest = interestDetail.PolicyAddlInterest
    policyAdditionalInterest.removeFromAdditionalInterestDetails(interestDetail)
  }

  override function createAndAddAdditionalInterestDetail(contactType : ContactType) : AddlInterestDetail {
    var acctContact = this.PolicyLine.Branch.Policy.Account.addNewAccountContactOfType(contactType)
    acctContact.addNewRole("AdditionalInterest")
    return addAdditionalInterestDetail(acctContact.Contact)
  }
  
  override function getAdditionalInterestDetailsForPolicyAddlInterest(policyAdditionalInterest : PolicyAddlInterest) : AddlInterestDetail[] {
    return this.AdditionalInterestDetails.where( \ p -> p.PolicyAddlInterest == policyAdditionalInterest )
  }
  
  abstract function createNewAdditionalInterestDetail() : AddlInterestDetail
  
  abstract property get ContainerIsValid() : boolean

  abstract property get PolicyLine() : PolicyLine
}
