package gw.admin.affinitygroup

uses gw.api.name.ContactNameOwner
uses gw.api.name.NameOwnerFieldId
uses gw.api.name.PersonNameFields

uses java.util.Set

@Export
class AffinityGroupContactOwner extends ContactNameOwner {

  construct (fields : PersonNameFields) {
    super(fields)
  }

  override property get FirstNameLabel() : String {
    return displaykey.Web.Admin.AffinityGroupDetail.BasicsDV.PrimaryContactFirstName
  }

  override property get FirstNamePhoneticLabel() : String {
    return displaykey.Web.Admin.AffinityGroupDetail.BasicsDV.PrimaryContactPhoneticFirstName
  }

  override property get LastNameLabel() : String {
    return displaykey.Web.Admin.AffinityGroupDetail.BasicsDV.PrimaryContactLastName
  }

  override property get LastNamePhoneticLabel(): String {
    return displaykey.Web.Admin.AffinityGroupDetail.BasicsDV.PrimaryContactPhoneticLastName
  }

  override property get RequiredFields() : Set<NameOwnerFieldId> {
    return { }.freeze()
  }

  override property get HiddenFields() : Set<NameOwnerFieldId> {
    return { NameOwnerFieldId.PREFIX, NameOwnerFieldId.SUFFIX,
        NameOwnerFieldId.MIDDLENAME, NameOwnerFieldId.PARTICLE }
        .freeze()
  }

  override property get ShowNameSummary() : boolean {
    return false
  }
 }