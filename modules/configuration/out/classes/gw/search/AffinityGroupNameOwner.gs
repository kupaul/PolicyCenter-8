package gw.search

uses gw.api.name.ContactNameFields
uses gw.api.name.ContactNameOwner
uses gw.api.name.NameOwnerFieldId
uses gw.api.name.PersonNameFields
uses java.util.Set

@Export
class AffinityGroupNameOwner extends ContactNameOwner {

  construct(fields : ContactNameFields) {
    super(fields)
  }

  construct (fields : PersonNameFields) {
    super(fields)
  }

  override property get RequiredFields() : Set<NameOwnerFieldId> {
    return { }.freeze()
  }

  override property get HiddenFields() : Set<NameOwnerFieldId> {
    return {NameOwnerFieldId.PREFIX, NameOwnerFieldId.SUFFIX, NameOwnerFieldId.MIDDLENAME}.freeze()
  }

  override property get ContactNamePhoneticLabel() : String {
    return displaykey.Web.Admin.GroupSearch.NamePhonetic
  }

  override property get ContactNameLabel() : String {
    return displaykey.Web.Admin.GroupSearch.Name
  }

  override property get ShowNameSummary(): boolean {
    return false
  }
}