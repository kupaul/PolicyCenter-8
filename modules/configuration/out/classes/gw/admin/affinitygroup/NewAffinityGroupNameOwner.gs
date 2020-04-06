package gw.admin.affinitygroup

uses gw.api.name.ContactNameOwner
uses gw.api.name.ContactNameFields
uses java.util.Set
uses gw.api.name.NameOwnerFieldId

@Export
class NewAffinityGroupNameOwner extends ContactNameOwner {

  construct(fields : ContactNameFields) {
    super(fields)
  }

  override property get RequiredFields() : Set<NameOwnerFieldId> {
    return { NameOwnerFieldId.NP_NAME }.freeze()
  }

  override property get ContactNameLabel() : String {
    return displaykey.Web.Admin.AffinityGroupDetail.BasicsDV.GroupName
  }

  override property get ContactNamePhoneticLabel() : String {
    return displaykey.Web.Admin.AffinityGroupDetail.BasicsDV.GroupNamePhonetic
  }

  override property get ShowNameSummary(): boolean {
    return false
  }
}
