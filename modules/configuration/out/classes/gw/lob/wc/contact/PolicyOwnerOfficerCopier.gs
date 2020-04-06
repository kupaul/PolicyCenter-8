package gw.lob.wc.contact
uses gw.contact.AbstractPolicyContactRoleCopier

@Export
class PolicyOwnerOfficerCopier extends AbstractPolicyContactRoleCopier<PolicyOwnerOfficer> {

  construct(ownerOfficer : PolicyOwnerOfficer) {
    super(ownerOfficer)
  }
  
  override protected function copyRoleSpecificFields(ownerOfficer : PolicyOwnerOfficer) {
    _bean.OwnershipPct = ownerOfficer.OwnershipPct
    _bean.Included = ownerOfficer.Included
    _bean.State = ownerOfficer.State
    _bean.ClassCode = ownerOfficer.ClassCode
  }

}
